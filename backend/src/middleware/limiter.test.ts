import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { contactLimiter, loginLimiter } from "./limiter";

describe("request rate limiters", () => {
    let ipCounter = 1;

    beforeEach(() => {
        ipCounter = 1;
    });

    it("limits contact submissions to five requests per IP", async () => {
        const app = express();
        app.set("trust proxy", 1);
        app.use(contactLimiter);
        app.post("/contact", (_req, res) => res.status(201).json({ success: true }));
        const ip = `198.51.100.${ipCounter++}`;
        let response: request.Response | undefined;

        for (let attempt = 0; attempt < 6; attempt += 1) {
            response = await request(app)
                .post("/contact")
                .set("X-Forwarded-For", ip);
        }

        expect(response?.status).toBe(429);
        expect(response?.body).toEqual({
            success: false,
            message: "Too many messages. Please try again after 15 minutes.",
        });
    });

    it("limits login requests to ten per IP", async () => {
        const app = express();
        app.set("trust proxy", 1);
        app.use(loginLimiter);
        app.post("/login", (_req, res) => res.status(200).json({ success: true }));
        const ip = `198.51.100.${ipCounter++}`;
        let response: request.Response | undefined;

        for (let attempt = 0; attempt < 11; attempt += 1) {
            response = await request(app)
                .post("/login")
                .set("X-Forwarded-For", ip);
        }

        expect(response?.status).toBe(429);
        expect(response?.body).toEqual({
            success: false,
            message: "Too many login attempts. Please try again after 5 minutes.",
        });
    });
});
