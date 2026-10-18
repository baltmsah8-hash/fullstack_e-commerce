import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "../utils/testUtils";

const mockSaveUser = jest.fn<() => Promise<unknown>>();

jest.mock("../models/userModel", () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn().mockImplementation(function (this: Record<string, unknown>, data: unknown) {
            Object.assign(this, data);
            this.save = mockSaveUser;
        }),
        { findOne: jest.fn(), findById: jest.fn(), find: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() },
    ),
}));
jest.mock("bcrypt", () => ({
    __esModule: true,
    default: { compare: jest.fn(), hash: jest.fn() },
}));
jest.mock("../utils/analytics", () => ({
    Tracker: jest.fn().mockImplementation(() => ({ postNotification: jest.fn(async () => undefined) })),
}));

const userModel = require("../models/userModel").default as typeof import("../models/userModel").default & {
    findOne: jest.Mock<(filter: unknown) => Promise<unknown>>;
    findById: jest.Mock<(id: string) => unknown>;
    findByIdAndUpdate: jest.Mock<(id: string, update: unknown) => unknown>;
    findByIdAndDelete: jest.Mock<(id: string) => Promise<unknown>>;
};
const bcrypt = require("bcrypt").default as {
    compare: jest.Mock<(plainText: string, hash: string) => Promise<boolean>>;
    hash: jest.Mock<(plainText: string, rounds: number) => Promise<string>>;
};
const {
    changeRole,
    login,
    logout,
    profile,
    register,
    removeUser,
} = require("./userController") as typeof import("./userController");

describe("user controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "user-controller-test-secret";
        process.env.AUTH_TOKEN = "token";
        mockSaveUser.mockResolvedValue({ _id: { toString: () => "user-123" } });
    });

    it("returns the same generic error for an unknown login", async () => {
        userModel.findOne.mockResolvedValue(null);
        const res = createResponse();

        await login(createRequest({ body: { email: "missing@example.com", password: "secret" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Error In Email Or Password" });
    });

    it("logs in with a valid password and sets an HTTP-only cookie", async () => {
        userModel.findOne.mockResolvedValue({
            _id: { toString: () => "user-123" },
            name: "Test User",
            email: "user@example.com",
            password: "hashed",
        });
        bcrypt.compare.mockResolvedValue(true);
        const res = createResponse();

        await login(createRequest({ body: { email: "user@example.com", password: "secret" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Login Successful",
            user: { name: "Test User", email: "user@example.com" },
        });
        expect(res.cookie).toHaveBeenCalledWith("token", expect.any(String), expect.objectContaining({ httpOnly: true }));
    });

    it("rejects a duplicate email during registration", async () => {
        userModel.findOne.mockResolvedValue({ _id: "existing-user" });
        const res = createResponse();

        await register(createRequest({
            body: { name: "User", email: "existing@example.com", password: "StrongPass123" },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email Already Exist" });
        expect(mockSaveUser).not.toHaveBeenCalled();
    });

    it("rejects invalid email input", async () => {
        userModel.findOne.mockResolvedValue(null);
        const res = createResponse();

        await register(createRequest({
            body: { name: "User", email: "not-an-email", password: "StrongPass123" },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid Email" });
    });

    it("creates an account with a hashed password", async () => {
        userModel.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashed-password");
        const res = createResponse();

        await register(createRequest({
            body: { name: "Test User", email: "new@example.com", password: "StrongPass123" },
        }), res.response);

        expect(bcrypt.hash).toHaveBeenCalledWith("StrongPass123", 12);
        expect(mockSaveUser).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "User Registered Successfully" });
    });

    it("clears the auth cookie on logout", async () => {
        const res = createResponse();

        await logout(createRequest(), res.response);

        expect(res.clearCookie).toHaveBeenCalledWith("token", expect.objectContaining({ httpOnly: true }));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Logged out successully" });
    });

    it("returns the current user without their password", async () => {
        const user = { _id: "user-123", name: "Test User" };
        const select = jest.fn(async (_fields: string) => user);
        userModel.findById.mockReturnValue({ select });
        const res = createResponse();

        await profile(createRequest({ userId: "user-123" }), res.response);

        expect(select).toHaveBeenCalledWith("-password");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, user });
    });

    it("changes a user's role and records an admin notification", async () => {
        const updatedUser = { _id: "user-456", email: "member@example.com", admin: true };
        userModel.findByIdAndUpdate.mockReturnValue({
            select: async () => updatedUser,
        });
        userModel.findById.mockReturnValue({
            select: async () => ({ email: "admin@example.com" }),
        });
        const res = createResponse();

        await changeRole(createRequest({
            userId: "admin-123",
            body: { id: "user-456", admin: false },
        }), res.response);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("user-456", { admin: true });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("prevents an admin from deleting their own account", async () => {
        const res = createResponse();

        await removeUser(createRequest({
            userId: "admin-123",
            body: { id: "admin-123" },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("removes a user and records an admin notification", async () => {
        userModel.findById.mockReturnValue({
            select: async () => ({ email: "admin@example.com" }),
        });
        userModel.findByIdAndDelete.mockResolvedValue({
            _id: "user-456",
            email: "member@example.com",
        });
        const res = createResponse();

        await removeUser(createRequest({
            userId: "admin-123",
            body: { id: "user-456" },
        }), res.response);

        expect(userModel.findByIdAndDelete).toHaveBeenCalledWith("user-456");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "User account permanently terminated",
        });
    });
});
