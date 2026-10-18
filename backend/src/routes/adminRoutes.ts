import express from "express";
import { adminLogin, getDashboardStats } from "../controllers/adminController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { loginLimiter } from "../middleware/limiter";

const adminRouter = express.Router();

adminRouter.post('/login', loginLimiter, adminLogin);
adminRouter.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);


export default adminRouter;
