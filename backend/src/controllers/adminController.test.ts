import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "../utils/testUtils";

jest.mock("../models/userModel", () => ({
    __esModule: true,
    default: { findOne: jest.fn() },
}));
jest.mock("bcrypt", () => ({
    __esModule: true,
    default: { compare: jest.fn() },
}));
jest.mock("../utils/analytics", () => ({
    DashboardAnalytics: jest.fn().mockImplementation(() => ({
        getUsersCount: jest.fn(async () => 12),
        getOrdersCount: jest.fn(async () => 8),
        getTotalEarnings: jest.fn(async () => 940),
    })),
}));

const userModel = require("../models/userModel").default as {
    findOne: jest.Mock<(filter: unknown) => Promise<unknown>>;
};
const bcrypt = require("bcrypt").default as {
    compare: jest.Mock<(plainText: string, hash: string) => Promise<boolean>>;
};
const { adminLogin, getDashboardStats } = require("./adminController") as typeof import("./adminController");

describe("admin controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "admin-controller-test-secret";
        process.env.AUTH_TOKEN = "token";
    });

    it("rejects an unknown admin account", async () => {
        userModel.findOne.mockResolvedValue(null);
        const res = createResponse();

        await adminLogin(createRequest({ body: { email: "missing@example.com", password: "secret" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Error In Email Or Password",
        });
    });

    it("does not allow a valid non-admin user to log in as admin", async () => {
        userModel.findOne.mockResolvedValue({
            _id: { toString: () => "user-1" },
            password: "hashed",
            admin: false,
        });
        bcrypt.compare.mockResolvedValue(true);
        const res = createResponse();

        await adminLogin(createRequest({ body: { email: "user@example.com", password: "secret" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "You are not an admin" });
    });

    it("logs an admin in and returns their profile", async () => {
        userModel.findOne.mockResolvedValue({
            _id: { toString: () => "admin-1" },
            name: "Admin",
            email: "admin@example.com",
            password: "hashed",
            admin: true,
        });
        bcrypt.compare.mockResolvedValue(true);
        const res = createResponse();

        await adminLogin(createRequest({ body: { email: "admin@example.com", password: "secret" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: { name: "Admin", email: "admin@example.com" },
        });
        expect(res.cookie).toHaveBeenCalledWith("token", expect.any(String), expect.objectContaining({ httpOnly: true }));
    });

    it("returns dashboard analytics", async () => {
        const res = createResponse();

        await getDashboardStats(createRequest(), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { totalUsers: 12, totalOrders: 8, totalEarnings: 940 },
        });
    });
});
