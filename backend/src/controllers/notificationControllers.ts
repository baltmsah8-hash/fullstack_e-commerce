import type { Request, Response } from "express";
import notificationModel from "../models/notificationModel";

const createNotification = async (req: Request, res: Response) => {
    const { name, phone, message } = req.body;
    if (!name || !phone || !message) {
        return res.status(400).json({ success: false, message: "All input fields are required" });
    }

    try {
        const newNotification = new notificationModel({
            title: 'contact',
            message: message,
            data: {
                name: name,
                phone: phone
            }
        });

        await newNotification.save();
        res.status(201).json({ success: true, message: "Your message forwarded securely to admin logs" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await notificationModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateStatus = async (req: Request, res: Response) => {
    try {
        await notificationModel.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: "All notifications updated trajectory to read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const clearNotifications = async (req: Request, res: Response) => {
    try {
        await notificationModel.deleteMany({});
    res.status(200).json({ success: true, message: "Notification vault database cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { createNotification, getNotifications, updateStatus, clearNotifications };