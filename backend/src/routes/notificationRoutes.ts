import express from "express";
import { createNotification, getNotifications, updateStatus, clearNotifications } from "../controllers/notificationControllers";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { contactLimiter } from "../middleware/limiter";

const notificationRouter = express.Router();

notificationRouter.post("/contact", contactLimiter, createNotification);
notificationRouter.get("/get", authMiddleware, adminMiddleware, getNotifications);
notificationRouter.put("/mark-read", authMiddleware, adminMiddleware, updateStatus);
notificationRouter.delete("/clear", authMiddleware, adminMiddleware, clearNotifications);

export default notificationRouter;
