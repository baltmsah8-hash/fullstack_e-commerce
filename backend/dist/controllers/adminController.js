"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Error In Email Or Password" });
        }
        if (!user.admin) {
            return res.status(403).json({ success: false, message: "You are not an admin" });
        }
        const passwordvalid = await bcrypt_1.default.compare(password, user.password);
        if (!passwordvalid) {
            return res.status(401).json({ success: false, message: "Error In Email Or Password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, isAdmin: user.admin }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = adminLogin;
