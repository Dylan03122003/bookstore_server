import express from 'express';
import { allow, protect } from '../controllers/authController.js';
import { createOrder, getAllOrders, getMyOrders, getOrdersOfEachUser } from '../controllers/orderController.js';
const router = express.Router();

router.route('/').post(protect, allow('user'), createOrder).get(protect, allow('admin'), getAllOrders);

router.route('/my-orders').get(protect, allow('user'), getMyOrders);

router.route('/users').get(protect, allow('admin', 'shipper'), getOrdersOfEachUser);

export default router;
