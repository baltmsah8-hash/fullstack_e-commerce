import express from 'express';
import { listOrders, updataStatus, userOrder, stripeWebhook, placeOrder } from '../controllers/orderControllers';
import authMiddleware from '../middleware/auth';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/webhook', stripeWebhook);
orderRouter.post('/user-orders', authMiddleware, userOrder);
orderRouter.post('/status', updataStatus);
orderRouter.get('/orders-list', listOrders);


export default orderRouter;
