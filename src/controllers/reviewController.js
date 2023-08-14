import Review from '../models/reviewModel.js';

export function setTourAndUserID(req, res, next) {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
}

export async function createReview(req, res, next) {
  try {
    const review = await Review.create(req.body);

    res.status(201).json({ status: 'success', review });
  } catch (error) {
    return next(error);
  }
}

export async function getAllReviews(req, res, next) {
  try {
    let filter = {};
    if (req.params.bookID) {
      filter = { book: req.params.bookID };
    }

    const reviews = await Review.find(filter);

    res.status(200).json({ status: 'success', result: reviews.length, reviews });
  } catch (error) {
    return next(error);
  }
}
