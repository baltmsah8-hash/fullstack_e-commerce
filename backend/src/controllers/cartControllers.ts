import type { Request, Response } from "express";
import userModel from "../models/userModel";
import productModel from "../models/productModel";


const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id: itemId } = req.body;
        let userData = await userModel.findById(userId).select("cartData");

        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        const itemExists = await productModel.exists({ _id: itemId });
        if (!itemExists) {
            return res.status(404).json({ success: false, message: "Product Not Found" });
        }

        let cartData = userData.cartData || {};
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }

        userData.cartData = cartData;
        userData.markModified("cartData");
        await userData.save();
        res.status(201).json({ success: true, message: "Product Added To cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeItemFromCart = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id: itemId, type } = req.body;
        let userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        if (itemId) {
            if (type === "delete") {
                delete userData.cartData[itemId];
            } else {
                userData.cartData[itemId] -= 1;
                if (userData.cartData[itemId] <= 0) {
                    delete userData.cartData[itemId];
                }
            }
        } else {
            userData.cartData = {};
        }

        userData.markModified("cartData");
        await userData.save();
        res.status(201).json({
            success: true,
            message: 
            itemId ? "Product Removed From Cart" : "Cart Clear Successfully",
            cartData: userData.cartData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
};

const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User Is Not Fiund" });
        }

        res.status(200).json({ 
            success: true, 
            message: "successful operation", 
            cart: userData.cartData || {} })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User Is Not Fخund" });
        }

        user.cartData = {};
        user.markModified("cartData");
        await user.save()

        res.status(200).json({ 
            success: true, 
            message: "Cart Clear Successfully",
            cartData: user.cartData});
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { addToCart, removeItemFromCart, getCart, clearCart };