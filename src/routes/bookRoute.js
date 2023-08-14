import express from 'express';
import { allow, protect } from '../controllers/authController.js';
import {
  createBook,
  deleteBook,
  getABook,
  getAllBooks,
  updateBook,
  uploadBookImage,
} from '../controllers/bookController.js';
import { getAllReviews } from '../controllers/reviewController.js';
const router = express.Router();

router.route('/').post(protect, allow('admin'), uploadBookImage, createBook).get(getAllBooks);

router.route('/:bookID/reviews').get(protect, getAllReviews);

router
  .route('/:bookID')
  .get(getABook)
  .patch(protect, allow('admin'), uploadBookImage, updateBook)
  .delete(protect, allow('admin'), deleteBook);

export default router;
