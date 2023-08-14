import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  quantity: {
    type: Number,
    required: [true, 'An order must have a quantity'],
  },
  status: {
    type: String,
    enum: {
      values: ['processing', 'shipping', 'completed', 'failed'],
      message: 'Status must be one of the following processing, shipping, completed or failed',
    },
    default: 'processing',
  },

  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'Order must be belong to a book'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must be belong to a user'],
  },
});

// EXPORTING
const Order = mongoose.model('Order', OrderSchema);

export default Order;
