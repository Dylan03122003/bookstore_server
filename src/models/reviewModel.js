import mongoose from 'mongoose';
import Book from './bookModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'Review cannot be empty!'] },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: [true, 'Review must be belong to a book'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (bookID) {
  // this points to the current Model which is Review Model
  const stats = await this.aggregate([
    {
      $match: {
        book: bookID,
      },
    },
    {
      $group: {
        _id: '$book',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookID, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Book.findByIdAndUpdate(bookID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// This post middleware is executed when a new review has been saved to the database
reviewSchema.post('save', function () {
  // this points to the current review document
  // this.constructor points to the Review Model
  this.constructor.calcAverageRatings(this.book);
});

// FOR UPDATE AND DELETE REVIEW
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRatings(this.review.book);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
