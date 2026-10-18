import cookieParser from "cookie-parser";
import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../controllers/userController", () => ({
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    profile: jest.fn(),
    allUsers: jest.fn(),
    changeRole: jest.fn(),
    removeUser: jest.fn(),
}));

jest.mock("../models/userModel", () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    },
}));

type ControllerName =
    | "login"
    | "logout"
    | "register"
    | "profile"
    | "allUsers"
    | "changeRole"
    | "removeUser";
type ControllerMock = jest.Mock<(req: Request, res: Response) => Promise<unknown>>;

const userController = require("../controllers/userController") as Record<ControllerName, ControllerMock>;
const userModel = require("../models/userModel").default as {
    findById: jest.Mock;
};
const userRouter = require("./userRoutes").default as express.Router;

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(userRouter);

const jwtSecret = "user-routes-test-secret";
let ipCounter = 1;

const uniqueIp = () => `198.51.100.${ipCounter++}`;

const tokenCookie = (userId: string, admin = false) =>
    `token=${jwt.sign({ id: userId, admin }, jwtSecret, { expiresIn: "5m" })}`;

const setAdminLookup = (
    admin: boolean | null,
    error?: Error,
) => {
    const select = jest.fn().mockImplementation(async () => {
        if (error) {
            throw error;
        }
        return admin === null ? null : { admin };
    });

    userModel.findById.mockReturnValue({ select } as never);
};

const setResponse = (
    handler: ControllerMock,
    status: number,
    body: object,
) => {
    handler.mockImplementation(async (_req, res) => {
        res.status(status).json(body);
    });
};

describe("userRoutes", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = jwtSecret;
        process.env.AUTH_TOKEN = "token";
        jest.clearAllMocks();

        setResponse(userController.login, 200, {
            success: true,
            message: "Login Successful",
            user: { name: "Test User", email: "user@example.com" },
        });
        setResponse(userController.logout, 200, {
            success: true,
            message: "Logged out successully",
        });
        setResponse(userController.register, 201, {
            success: true,
            message: "User Registered Successfully",
        });
        setResponse(userController.profile, 200, {
            success: true,
            user: { _id: "user-123", name: "Test User" },
        });
        setResponse(userController.allUsers, 200, {
            success: true,
            users: [{ _id: "user-123", email: "user@example.com" }],
        });
        setResponse(userController.changeRole, 200, {
            success: true,
            message: "User updated successfully",
        });
        setResponse(userController.removeUser, 200, {
            success: true,
            message: "User account permanently terminated",
        });
    });

    describe("POST /login", () => {
        it("routes a valid login request to the controller", async () => {
            const payload = { email: "user@example.com", password: "StrongPass123" };

            const response = await request(app)
                .post("/login")
                .set("X-Forwarded-For", uniqueIp())
                .send(payload);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Login Successful",
                user: { name: "Test User", email: "user@example.com" },
            });
            expect(userController.login).toHaveBeenCalledTimes(1);
            expect(userController.login.mock.calls[0]?.[0].body).toEqual(payload);
        });

        it("returns 429 when the per-IP login limit is exceeded", async () => {
            const ip = uniqueIp();
            let response: request.Response | undefined;

            for (let attempt = 0; attempt < 11; attempt += 1) {
                response = await request(app)
                    .post("/login")
                    .set("X-Forwarded-For", ip)
                    .send({ email: "user@example.com", password: "wrong" });
            }

            expect(response?.status).toBe(429);
            expect(response?.body).toEqual({
                success: false,
                message: "Too many login attempts. Please try again after 5 minutes.",
            });
            expect(userController.login).toHaveBeenCalledTimes(10);
        });
    });

    describe("POST /logout", () => {
        it("routes logout and returns its success response", async () => {
            const response = await request(app)
                .post("/logout")
                .set("X-Forwarded-For", uniqueIp());

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Logged out successully",
            });
            expect(userController.logout).toHaveBeenCalledTimes(1);
        });
    });

    describe("POST /register", () => {
        it("routes a valid registration payload to the controller", async () => {
            const payload = {
                name: "Test User",
                email: "user@example.com",
                password: "StrongPass123",
            };

            const response = await request(app)
                .post("/register")
                .set("X-Forwarded-For", uniqueIp())
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "User Registered Successfully",
            });
            expect(userController.register).toHaveBeenCalledTimes(1);
            expect(userController.register.mock.calls[0]?.[0].body).toEqual(payload);
        });

        it("rejects malformed JSON before reaching the controller", async () => {
            const response = await request(app)
                .post("/register")
                .set("X-Forwarded-For", uniqueIp())
                .set("Content-Type", "application/json")
                .send("{");

            expect(response.status).toBe(400);
            expect(userController.register).not.toHaveBeenCalled();
        });
    });

    describe("GET /profile", () => {
        it("rejects requests without an authentication token", async () => {
            const response = await request(app)
                .get("/profile")
                .set("X-Forwarded-For", uniqueIp());

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ success: false, message: "Token missing" });
            expect(userController.profile).not.toHaveBeenCalled();
        });

        it("rejects invalid or expired authentication tokens", async () => {
            const response = await request(app)
                .get("/profile")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", "token=invalid-token");

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: "Invalid or expired token",
            });
            expect(userController.profile).not.toHaveBeenCalled();
        });

        it("routes an authenticated request to the profile controller", async () => {
            const response = await request(app)
                .get("/profile")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", tokenCookie("user-123"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                user: { _id: "user-123", name: "Test User" },
            });
            expect(userController.profile).toHaveBeenCalledTimes(1);
        });
    });

    describe("admin-only routes", () => {
        it("returns 401 for an unauthenticated all-users request", async () => {
            const response = await request(app)
                .get("/all-users")
                .set("X-Forwarded-For", uniqueIp());

            expect(response.status).toBe(401);
            expect(userController.allUsers).not.toHaveBeenCalled();
        });

        it("returns 404 when the authenticated account no longer exists", async () => {
            setAdminLookup(null);

            const response = await request(app)
                .get("/all-users")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", tokenCookie("deleted-user"));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "User session account not found",
            });
            expect(userController.allUsers).not.toHaveBeenCalled();
        });

        it("returns 403 for an authenticated non-admin", async () => {
            setAdminLookup(false);

            const response = await request(app)
                .get("/all-users")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", tokenCookie("user-123"));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                message: "You are not an admin",
            });
            expect(userController.allUsers).not.toHaveBeenCalled();
        });

        it("returns 500 when the admin account lookup fails", async () => {
            setAdminLookup(null, new Error("database unavailable"));

            const response = await request(app)
                .get("/all-users")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", tokenCookie("admin-123", true));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: "Server error during admin validation",
            });
            expect(userController.allUsers).not.toHaveBeenCalled();
        });

        it("allows an admin to list users", async () => {
            setAdminLookup(true);

            const response = await request(app)
                .get("/all-users")
                .set("X-Forwarded-For", uniqueIp())
                .set("Cookie", tokenCookie("admin-123", true));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                users: [{ _id: "user-123", email: "user@example.com" }],
            });
            expect(userController.allUsers).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["PUT", "/change-role", { id: "user-456", admin: true }, "changeRole"],
            ["DELETE", "/remove-user", { id: "user-456" }, "removeUser"],
        ] as const)(
            "%s %s is available only to admins and forwards its body",
            async (method, route, payload, handlerName) => {
                setAdminLookup(false);

                const deniedResponse = await request(app)
                    [method.toLowerCase() as "put" | "delete"](route)
                    .set("X-Forwarded-For", uniqueIp())
                    .set("Cookie", tokenCookie("user-123"))
                    .send(payload);

                expect(deniedResponse.status).toBe(403);
                expect(userController[handlerName]).not.toHaveBeenCalled();

                userModel.findById.mockReturnValue({
                    select: async () => ({ admin: true }),
                } as never);

                const successResponse = await request(app)
                    [method.toLowerCase() as "put" | "delete"](route)
                    .set("X-Forwarded-For", uniqueIp())
                    .set("Cookie", tokenCookie("admin-123", true))
                    .send(payload);

                expect(successResponse.status).toBe(200);
                expect(userController[handlerName]).toHaveBeenCalledTimes(1);
                expect(userController[handlerName].mock.calls[0]?.[0].body).toEqual(payload);
            },
        );
    });
});
