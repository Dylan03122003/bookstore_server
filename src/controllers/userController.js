import multer from 'multer';
import sharp from 'sharp';
import Order from './../models/orderModel.js';
import User from './../models/userModel.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split("/")[1];

//     cb(null, `user-${req.user._id}-${Date.now()}.${extension}`);
//   },
// });

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image file please upload image files'), false);
  }
};

const upload = multer({ storage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObject[key] = obj[key];
    }
  });

  return newObject;
};

export async function updateMe(req, res, next) {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password update. Please use /updateMyPassword.', 400));
    }

    const filteredBody = filterObj(req.body, 'name', 'email', 'address', 'phone');

    if (req.file) {
      filteredBody.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserOrders(req, res, next) {
  try {
    const userID = req.params.userID;

    const user = await User.findById(userID);

    // Find all orders for the given user ID
    const orders = await Order.find({ user: userID }).populate('book');

    res.status(200).json({ status: 'success', result: orders.length, orders, user });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserOrders(req, res, next) {
  try {
    const userID = req.params.userID;

    const { status } = req.body;

    await Order.updateMany({ user: userID, status: { $ne: 'completed' } }, { $set: { status: status } });
    res.status(200).json({
      success: true,
      message: 'Status of orders updated successfully',
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();

    const allUsers = users
      .filter((user) => user.email !== req.user.email)
      .map((user) => {
        return { ...user._doc, userID: user._id };
      });

    res.status(200).json({ status: 'success', results: allUsers.length, allUsers });
  } catch (error) {
    return next(error);
  }
}

export async function getAnUser(req, res, next) {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID);

    res.status(200).json({ status: 'success', user });
  } catch (error) {
    return next(error);
  }
}
