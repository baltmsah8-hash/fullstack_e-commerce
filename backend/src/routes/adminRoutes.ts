import express from "express";
import { adminLogin, getDashboardStats } from "../controllers/adminController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats);


export default adminRouter;
