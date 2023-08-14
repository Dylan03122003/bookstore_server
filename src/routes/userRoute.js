import express from 'express';
import { allow, forgotPassword, login, protect, resetPassword, signup } from '../controllers/authController.js';
import {
  getAllUsers,
  getAnUser,
  getUserOrders,
  resizeUserPhoto,
  updateMe,
  updateUserOrders,
  uploadUserPhoto,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/sign-up', signup);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/log-in', login);

router.patch('/update-me', protect, uploadUserPhoto, resizeUserPhoto, updateMe);

router.get('/get-all-users', protect, allow('admin'), getAllUsers);

router.get('/:userID', protect, allow('admin'), getAnUser);

router.route('/:userID/orders').get(getUserOrders).patch(protect, allow('shipper'), updateUserOrders);

export default router;
