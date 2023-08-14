import Book from '../models/bookModel.js';
import Order from '../models/orderModel.js';
import AppError from '../util/AppError.js';

export async function createOrder(req, res, next) {
  try {
    const { orders } = req.body;

    const createdOrders = await Order.create(orders);

    const bookUpdates = orders.map(async (order) => {
      const { book, quantity } = order;
      await Book.findByIdAndUpdate(book, { $inc: { quantity: -quantity } });

      const updatedBook = await Book.findById(book);
      if (updatedBook.quantity === 0) {
        await Book.findByIdAndDelete(book);
      }
    });

    await Promise.all(bookUpdates);

    res.status(201).json({ status: 'success', orders: createdOrders });
  } catch (error) {
    return next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().populate('book user');
    res.status(200).json({ status: 'success', result: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const { _id } = req.user;

    const orders = await Order.find({ user: _id }).populate('book');

    res.status(200).json({ status: 'success', result: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}

export async function getOrdersOfEachUser(req, res, next) {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orders: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users', // Assuming your users collection is named 'users'
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    res.status(200).json({ status: 'success', result: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}
