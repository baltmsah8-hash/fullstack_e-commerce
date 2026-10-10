import UserModel from "../models/userModel";
import OrderModel from "../models/orderModel";
import NotificationModel from "../models/notificationModel";

class Tracker {
    private title: string;
    private message: string;

    constructor(title: string, message: string) {
        this.title = title;
        this.message = message;
    }

    async postNotification(additionalData: object = {}) {
        try {
            const newNotification = new NotificationModel({
                title: this.title,
                message: this.message,
                data: additionalData
            });
            await newNotification.save();
        } catch (error) {
            console.error(error);
        }
    }
}

class DashboardAnalytics {
    async getUsersCount(): Promise<number> {
        try {
            return await UserModel.countDocuments({});
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    async getOrdersCount(): Promise<number> {
        try {
            return await OrderModel.countDocuments({});
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    async getTotalEarnings(): Promise<number> {
        try {
            const result = await OrderModel.aggregate([
                { $match: { payment: true } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            return result.length > 0 ? (result[0] as any).total : 0;
        } catch (err) {
            console.error(err);
            return 0;
        }
    }
}

export { Tracker, DashboardAnalytics };
