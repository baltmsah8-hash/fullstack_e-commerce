import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = async (req: Request, res: Response, next: () => void) => {
    const token = req.headers.token as string;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token missing" })
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.userId = token_decode.id;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export default authMiddleware;