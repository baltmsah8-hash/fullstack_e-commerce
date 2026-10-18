import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockSaveNotification = jest.fn<() => Promise<unknown>>();

jest.mock("../models/userModel", () => ({
    __esModule: true,
    default: { countDocuments: jest.fn() },
}));
jest.mock("../models/orderModel", () => ({
    __esModule: true,
    default: { countDocuments: jest.fn(), aggregate: jest.fn() },
}));
jest.mock("../models/notificationModel", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: Record<string, unknown>, data: unknown) {
        Object.assign(this, data);
        this.save = mockSaveNotification;
    }),
}));

const UserModel = require("../models/userModel").default as {
    countDocuments: jest.Mock<(...args: unknown[]) => Promise<number>>;
};
const OrderModel = require("../models/orderModel").default as {
    countDocuments: jest.Mock<(...args: unknown[]) => Promise<number>>;
    aggregate: jest.Mock<(...args: unknown[]) => Promise<Array<{ total: number }>>>;
};
const NotificationModel = require("../models/notificationModel").default as jest.Mock;
const { DashboardAnalytics, Tracker } = require("./analytics") as typeof import("./analytics");

describe("analytics utilities", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns the users count", async () => {
        UserModel.countDocuments.mockResolvedValue(5);

        await expect(new DashboardAnalytics().getUsersCount()).resolves.toBe(5);
        expect(UserModel.countDocuments).toHaveBeenCalledWith({});
    });

    it("counts only paid orders", async () => {
        OrderModel.countDocuments.mockResolvedValue(3);

        await expect(new DashboardAnalytics().getOrdersCount()).resolves.toBe(3);
        expect(OrderModel.countDocuments).toHaveBeenCalledWith({ payment: true });
    });

    it("returns total earnings or zero when there are no paid orders", async () => {
        OrderModel.aggregate.mockResolvedValueOnce([{ total: 125 }]).mockResolvedValueOnce([]);
        const analytics = new DashboardAnalytics();

        await expect(analytics.getTotalEarnings()).resolves.toBe(125);
        await expect(analytics.getTotalEarnings()).resolves.toBe(0);
        expect(OrderModel.aggregate).toHaveBeenCalledWith([
            { $match: { payment: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
    });

    it("records a notification through the notification model", async () => {
        mockSaveNotification.mockResolvedValue(undefined);
        const tracker = new Tracker("order", "Order paid", "order-1");

        await tracker.postNotification({ amount: 25 });

        expect(NotificationModel).toHaveBeenCalledWith({
            title: "order",
            message: "Order paid",
            data: { amount: 25 },
            orderId: "order-1",
        });
        expect(mockSaveNotification).toHaveBeenCalledTimes(1);
    });

    it("ignores duplicate order notification keys but propagates unrelated errors", async () => {
        mockSaveNotification.mockRejectedValueOnce({ code: 11000 }).mockRejectedValueOnce(new Error("database error"));
        const tracker = new Tracker("order", "Order paid", "order-1");

        await expect(tracker.postNotification()).resolves.toBeUndefined();
        await expect(tracker.postNotification()).rejects.toThrow("database error");
    });

    it("returns zero dashboard counts if a model query fails", async () => {
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        UserModel.countDocuments.mockRejectedValue(new Error("database unavailable"));

        await expect(new DashboardAnalytics().getUsersCount()).resolves.toBe(0);
        expect(errorSpy).toHaveBeenCalled();
    });
});
