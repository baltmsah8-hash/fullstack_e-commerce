import type { Request, Response } from "express";
import userModel from "../models/userModel";
import { DashboardAnalytics } from "../utils/analytics";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Error In Email Or Password" });
        }

        const passwordvalid = await bcrypt.compare(password, user.password);
        if (!passwordvalid) {
            return res.status(401).json({ success: false, message: "Error In Email Or Password" });
        }

        if ((user.admin as string | boolean) !== true && (user.admin as string | boolean) !== "true") {
            return res.status(403).json({ success: false, message: "You are not an admin" });
        }

        const token = createToken(user._id.toString(), user.admin as boolean | string);
        const cookieName = process.env.AUTH_TOKEN ? process.env.AUTH_TOKEN : "token";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 6 * 60 * 60 * 1000,
        })

        res.status(200).json({ 
            success: true,
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

const createToken = (id: string, admin: boolean | string): string => {
    return jwt.sign({ id, admin },
            process.env.JWT_SECRET as string,
            { expiresIn: "6h" });
};


const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const analytics = new DashboardAnalytics();

        const [usersCount, ordersCount, totalEarnings] = await Promise.all([
            analytics.getUsersCount(),
            analytics.getOrdersCount(),
            analytics.getTotalEarnings()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers: usersCount,
                totalOrders: ordersCount,
                totalEarnings: totalEarnings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export { adminLogin, getDashboardStats};
