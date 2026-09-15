"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Error In Email Or Password" });
        }
        const passwordvalid = await bcrypt_1.default.compare(password, user.password);
        if (!passwordvalid) {
            return res.status(401).json({ success: false, message: "Error In Email Or Password" });
        }
        const token = createToken(user._id.toString());
        res.status(200).json({ success: true, message: "Login Successful", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.login = login;
const createToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET);
};
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const isExist = await userModel_1.default.findOne({ email });
        if (isExist) {
            return res.status(400).json({ success: false, message: "Email Already Exist" });
        }
        if (!validator_1.default.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const newUser = new userModel_1.default({ name, email, password: hashedPassword });
        const savedUser = await newUser.save();
        const token = createToken(savedUser._id.toString());
        res.status(201).json({ success: true, message: "User Registered Successfully", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.register = register;
