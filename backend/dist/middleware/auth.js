"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token missing" });
    }
    try {
        const token_decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id;
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = authMiddleware;
