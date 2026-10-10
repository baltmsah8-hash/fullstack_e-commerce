import type { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    userId: string;
    isAdmin?: boolean | string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const cookieName = process.env.AUTH_TOKEN || "token";
    const token = req.cookies?.[cookieName] || req.cookies?.["token"] || req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (typeof decoded === "string" || typeof decoded.id !== "string") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const authReq = req as AuthenticatedRequest;
        authReq.userId = decoded.id;
        authReq.isAdmin = decoded.admin;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.isAdmin === true || authReq.isAdmin === "true") {
        return next();
    }

    try {
        const user = await userModel.findOne({_id: authReq.userId});

        if (!user) {
            return res.status(404).json({ success: false, message: "User session account not found" });
        }

        if ((user.admin as string | boolean) !== true && (user.admin as string | boolean) !== "true") {
            return res.status(403).json({ success: false, message: "You are not an admin" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "You're not admin" });
    }
};

export { authMiddleware, adminMiddleware };