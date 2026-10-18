import type { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    userId: string;
    isAdmin?: boolean;
}

interface JwtPayloadSchema {
    id: string;
    admin?: boolean; 
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const cookieName = process.env.AUTH_TOKEN || "token";
    const token = req.cookies?.[cookieName];
    if (!token) {
        return res.status(401).json({ success: false, message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadSchema;
        if (!decoded || typeof decoded.id !== "string") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const authReq = req as AuthenticatedRequest;
        authReq.userId = decoded.id;
        authReq.isAdmin = decoded.admin === true;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    try {
        const userDoc = await userModel.findById(authReq.userId).select("admin");

        if (!userDoc) {
            return res.status(404).json({ success: false, message: "User session account not found" });
        }

        if (userDoc.admin !== true) {
            return res.status(403).json({ success: false, message: "You are not an admin" });
        }

        authReq.isAdmin = true;
        return next();
        
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error during admin validation" });
    }
};

export { authMiddleware, adminMiddleware };