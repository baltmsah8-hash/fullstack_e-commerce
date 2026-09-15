"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.getCart = exports.removeItemFromCart = exports.addToCart = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { id: itemId } = req.body;
        let userData = await userModel_1.default.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        let cartData = userData.cartData || {};
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        }
        else {
            cartData[itemId] += 1;
        }
        await userModel_1.default.findByIdAndUpdate(userId, { cartData });
        res.status(201).json({ success: true, message: "Product Added To cart" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.addToCart = addToCart;
const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { id: itemId } = req.body;
        let userData = await userModel_1.default.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        if (itemId) {
            if (userData.cartData[itemId]) {
                userData.cartData[itemId] -= 1;
                if (userData.cartData[itemId] <= 0) {
                    delete userData.cartData[itemId];
                }
            }
        }
        else {
            userData.cartData = {};
        }
        await userData.save();
        res.status(201).json({
            success: true,
            message: itemId ? "Product Removed From Cart" : "Cart Clear Successfully",
            cartData: userData.cartData,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.removeItemFromCart = removeItemFromCart;
const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await userModel_1.default.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User Is Not Fiund" });
        }
        res.status(200).json({
            success: true,
            message: "successful operation",
            cart: userData.cartData || {}
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getCart = getCart;
const clearCart = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User Is Not Fخund" });
        }
        user.cartData = {};
        await user.save();
        res.status(200).json({
            success: true,
            message: "Cart Clear Successfully",
            cartData: user.cartData
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.clearCart = clearCart;
