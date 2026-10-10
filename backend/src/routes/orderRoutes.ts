import express from 'express';
import { listOrders, updataStatus, userOrder, stripeWebhook, placeOrder } from '../controllers/orderControllers';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/webhook', stripeWebhook);
orderRouter.get('/user-orders', authMiddleware, userOrder);
orderRouter.put('/status', authMiddleware, adminMiddleware, updataStatus);
orderRouter.get('/orders-list', authMiddleware, adminMiddleware, listOrders);


export default orderRouter;
