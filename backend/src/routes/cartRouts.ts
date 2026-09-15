import express from "express";
import { addToCart, removeItemFromCart, getCart, clearCart } from "../controllers/cartControllers";
import authMiddleware from "../middleware/auth";

const cartRouter = express.Router();

cartRouter.post('/add', addToCart);
cartRouter.post('/remove', removeItemFromCart);
cartRouter.post('/get', getCart);
cartRouter.post('/clear', authMiddleware, clearCart);

export default cartRouter;
