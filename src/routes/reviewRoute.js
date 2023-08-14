import express from 'express';
import { createReview, getAllReviews, setTourAndUserID } from '../controllers/reviewController.js';
import { allow, protect } from './../controllers/authController.js';
const router = express.Router();

router.use(protect);

router.route('/').post(allow('user'), setTourAndUserID, createReview).get(getAllReviews);

export default router;
