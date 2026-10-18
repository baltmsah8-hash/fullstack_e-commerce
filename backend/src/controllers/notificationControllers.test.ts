import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "../utils/testUtils";

const saveNotification = jest.fn<() => Promise<unknown>>();

jest.mock("../models/notificationModel", () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn().mockImplementation(function (this: Record<string, unknown>, data: unknown) {
            Object.assign(this, data);
            this.save = saveNotification;
        }),
        { find: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
    ),
}));

const notificationModel = require("../models/notificationModel").default as typeof import("../models/notificationModel").default;
const { clearNotifications, createNotification, getNotifications, updateStatus } = require("./notificationControllers") as typeof import("./notificationControllers");
const notificationConstructor = notificationModel as unknown as jest.Mock;
const notificationStatics = notificationModel as unknown as {
    find: jest.Mock<(...args: unknown[]) => unknown>;
    updateMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    deleteMany: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
};

describe("notification controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        saveNotification.mockResolvedValue(undefined);
    });

    it("creates a contact notification with valid details", async () => {
        const res = createResponse();
        const payload = {
            name: "Test User",
            phone: "01012345678",
            message: "Please contact me about an order.",
        };

        await createNotification(createRequest({ body: payload }), res.response);

        expect(notificationConstructor).toHaveBeenCalledWith({
            title: "contact",
            message: payload.message,
            data: { name: payload.name, phone: payload.phone },
        });
        expect(saveNotification).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it.each([
        [{ phone: "01012345678", message: "Valid enough message" }, "All input fields are required"],
        [{ name: "A", phone: "01012345678", message: "Valid enough message" }, "Invalid name"],
        [{ name: "Test User", phone: "123", message: "Valid enough message" }, "Invalid phone number"],
        [{ name: "Test User", phone: "01012345678", message: "short" }, "Invalid message"],
    ])("rejects invalid contact data", async (body, message) => {
        const res = createResponse();

        await createNotification(createRequest({ body }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message });
        expect(saveNotification).not.toHaveBeenCalled();
    });

    it("lists notifications newest first", async () => {
        const notifications = [{ _id: "notification-1" }];
        const sort = jest.fn(async (_sort: Record<string, number>) => notifications);
        notificationStatics.find.mockReturnValue({ sort });
        const res = createResponse();

        await getNotifications(createRequest(), res.response);

        expect(notificationStatics.find).toHaveBeenCalledWith({});
        expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: notifications });
    });

    it("marks unread notifications as read", async () => {
        notificationStatics.updateMany.mockResolvedValue({ modifiedCount: 2 });
        const res = createResponse();

        await updateStatus(createRequest(), res.response);

        expect(notificationStatics.updateMany).toHaveBeenCalledWith(
            { isRead: false },
            { isRead: true },
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("clears notifications", async () => {
        notificationStatics.deleteMany.mockResolvedValue({ deletedCount: 2 });
        const res = createResponse();

        await clearNotifications(createRequest(), res.response);

        expect(notificationStatics.deleteMany).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
