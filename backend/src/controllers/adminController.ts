import type { Request, Response } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Error In Email Or Password" });
        }

        if (!user.admin) {
            return res.status(403).json({ success: false, message: "You are not an admin" });
        }

        const passwordvalid = await bcrypt.compare(password, user.password);
        if (!passwordvalid) {
            return res.status(401).json({ success: false, message: "Error In Email Or Password" });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.admin },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        res.status(200).json({ 
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default adminLogin;
