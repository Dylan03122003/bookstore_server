import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    author: {
      type: String,
      required: [true, 'Please provide an author'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
    categories: {
      type: [String],
      required: [true, 'Please provide a category'],
    },
    image: {
      type: String,
      required: [true, 'Please provide an image'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (currentValue) => Math.round(currentValue * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'book',
  localField: '_id',
});

const BookModel = mongoose.model('Book', BookSchema);

export default BookModel;
