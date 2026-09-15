import type { Request, Response } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    try{
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Error In Email Or Password" });
        }
        const passwordvalid = await bcrypt.compare(password, user.password);
        if (!passwordvalid) {
            return res.status(401).json({ success: false, message: "Error In Email Or Password" });
        }
        const token = createToken(user._id.toString());
        res.status(200).json({ success: true, message: "Login Successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const createToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string);
}

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    try {
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            return res.status(400).json({ success: false, message: "Email Already Exist" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new userModel({ name, email, password: hashedPassword });
        const savedUser = await newUser.save();
        const token = createToken(savedUser._id.toString());
        res.status(201).json({ success: true, message: "User Registered Successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { login, register };
