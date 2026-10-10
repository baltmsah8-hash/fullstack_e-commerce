import express from "express";
import { addToCart, removeItemFromCart, getCart, clearCart } from "../controllers/cartControllers";
import { authMiddleware } from "../middleware/auth";

const cartRouter = express.Router();

cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove', authMiddleware, removeItemFromCart);
cartRouter.get('/get', authMiddleware, getCart);
cartRouter.post('/clear', authMiddleware, clearCart);

export default cartRouter;
