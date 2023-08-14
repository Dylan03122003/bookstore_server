import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../util/AppError.js';
import { sendEmail } from '../util/send-email.js';
import User from './../models/userModel.js';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

export const signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const { password, ...userWithoutPassword } = newUser.toObject();
    const token = createToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password: commingPassword } = req.body;

    if (!email || !commingPassword) {
      return next(new AppError('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.passwordIsTheSame(commingPassword, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = createToken(user._id);
    const { password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ status: 'success', token, data: { user: userWithoutPassword } });
  } catch (error) {
    return next(error);
  }
};

export async function forgotPassword(req, res, next) {
  const user = await User.findOne({ email: req.body.email });

  try {
    if (!user) {
      return next(new AppError('There is no user that email'));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordPageURL = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetPasswordPageURL}.\nIf you didn't forget your password, just ignore this email.`;

    await sendEmail({
      sendTo: user.email,
      subject: 'Forgot your password. (Valid in 10 minutes)',
      sendFrom: 'Quoc Duong',
      message,
      resetPasswordPageURL,
    });

    res.status(200).json({
      status: 'success',
      message: 'Check your email for a link to reset your password',
    });
  } catch (error) {
    user.passwordResetToken = undefined; // remove the field
    user.passwordResetExpires = undefined; // remove the field
    // 2 above lines just modify the field not saving in database
    await user.save({ validateBeforeSave: false });

    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('There is no user', 400));
    }

    if (!req.body.password || !req.body.passwordConfirm) {
      return next(new AppError('Please provide new password', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const newToken = createToken(user._id);
    res.status(200).json({
      status: 'success',
      token: newToken,
      name: user.name,
      email: user.email,
      photo: user.photo,
    });
  } catch (error) {
    return next(error);
  }
}

export async function protect(req, res, next) {
  try {
    // Step 1
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    // Step 2
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Step 3
    const currentUser = await User.findById(decoded._id);

    if (!currentUser) {
      return next(new AppError('The user belongs to the token does no longer exist.', 401));
    }

    // Step 4

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User has recently changed their password! Please log in again.', 401));
    }

    req.user = currentUser;

    next();
  } catch (error) {
    return next(error);
  }
}

export function allow(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}
