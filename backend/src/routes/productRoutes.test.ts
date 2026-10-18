import express from "express";
import type { Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockImageBuffer = Buffer.from("converted-webp-image");
const mockSharpMetadata = jest.fn<() => Promise<{ format: string }>>();
const mockWriteFile = jest.fn<(...args: unknown[]) => Promise<void>>();
const mockMkdir = jest.fn<(...args: unknown[]) => Promise<void>>();
const mockProductController = jest.fn<(req: Request, res: Response) => unknown>();

const mockSharpChain = {
    rotate: jest.fn(),
    resize: jest.fn(),
    webp: jest.fn(),
    toBuffer: jest.fn<() => Promise<Buffer>>(),
};
mockSharpChain.rotate.mockReturnValue(mockSharpChain);
mockSharpChain.resize.mockReturnValue(mockSharpChain);
mockSharpChain.webp.mockReturnValue(mockSharpChain);

jest.mock("sharp", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        metadata: mockSharpMetadata,
        ...mockSharpChain,
    })),
}));
jest.mock("fs", () => ({
    __esModule: true,
    default: { promises: { mkdir: mockMkdir, writeFile: mockWriteFile } },
}));
jest.mock("../controllers/productControllers", () => ({
    addProduct: mockProductController,
    listProducts: mockProductController,
    removeProduct: mockProductController,
}));
jest.mock("../middleware/auth", () => ({
    authMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
    adminMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const productRouter = require("./productRoutes").default as express.Router;
const app = express();
app.use("/api/products", productRouter);

describe("product upload route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSharpMetadata.mockResolvedValue({ format: "png" });
        mockSharpChain.toBuffer.mockResolvedValue(mockImageBuffer);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);
        mockProductController.mockImplementation((_req, res) =>
            res.status(201).json({ success: true, message: "Product Added" }),
        );
    });

    it("converts and stores an uploaded image before dispatching product creation", async () => {
        const response = await request(app)
            .post("/api/products/add-product")
            .field("name", "Test product")
            .attach("image", Buffer.from("original-image"), {
                filename: "product.png",
                contentType: "image/png",
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ success: true, message: "Product Added" });
        expect(mockSharpMetadata).toHaveBeenCalledTimes(1);
        expect(mockSharpChain.rotate).toHaveBeenCalledTimes(1);
        expect(mockSharpChain.resize).toHaveBeenCalledWith({
            width: 1920,
            height: 1920,
            fit: "inside",
            withoutEnlargement: true,
        });
        expect(mockSharpChain.webp).toHaveBeenCalledWith({ quality: 80 });
        expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining("uploads"), { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(
            expect.stringMatching(/\.webp$/),
            mockImageBuffer,
            { flag: "wx" },
        );
        expect(mockProductController).toHaveBeenCalledTimes(1);
        expect(mockProductController.mock.calls[0]?.[0].file?.filename).toMatch(/\.webp$/);
    });

    it("rejects a non-image upload", async () => {
        const response = await request(app)
            .post("/api/products/add-product")
            .attach("image", Buffer.from("not an image"), {
                filename: "notes.txt",
                contentType: "text/plain",
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Please upload a valid image file",
        });
        expect(mockProductController).not.toHaveBeenCalled();
    });

    it("rejects an invalid image buffer", async () => {
        mockSharpMetadata.mockRejectedValue(new Error("invalid image"));

        const response = await request(app)
            .post("/api/products/add-product")
            .attach("image", Buffer.from("invalid"), {
                filename: "broken.png",
                contentType: "image/png",
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid or unsupported image",
        });
        expect(mockProductController).not.toHaveBeenCalled();
    });

    it("rejects images larger than five megabytes", async () => {
        const response = await request(app)
            .post("/api/products/add-product")
            .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
                filename: "large.png",
                contentType: "image/png",
            });

        expect(response.status).toBe(413);
        expect(response.body).toEqual({
            success: false,
            message: "Image must be 5MB or smaller",
        });
        expect(mockProductController).not.toHaveBeenCalled();
    });
});
