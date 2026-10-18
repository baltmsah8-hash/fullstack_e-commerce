import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "../utils/testUtils";

const saveProduct = jest.fn<() => Promise<unknown>>();

jest.mock("../models/productModel", () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn().mockImplementation(function (this: Record<string, unknown>, data: unknown) {
            Object.assign(this, data);
            this.save = saveProduct;
        }),
        { find: jest.fn(), findById: jest.fn(), findByIdAndDelete: jest.fn() },
    ),
}));

jest.mock("fs", () => ({
    __esModule: true,
    default: { promises: { unlink: jest.fn(async () => undefined) } },
}));

const productModel = require("../models/productModel").default as typeof import("../models/productModel").default;
const { addProduct, listProducts, removeProduct } = require("./productControllers") as typeof import("./productControllers");
const productConstructor = productModel as unknown as jest.Mock;
const productStatics = productModel as unknown as {
    find: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    findById: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    findByIdAndDelete: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
};

describe("product controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        saveProduct.mockResolvedValue(undefined);
    });

    it("creates a product with normalized fields", async () => {
        const req = createRequest({
            body: {
                name: "  Product Name ",
                description: "  A sufficiently detailed description ",
                price: "19.5",
                category: "  Men ",
            },
            file: { filename: "image.webp" } as Express.Multer.File,
        });
        const res = createResponse();

        await addProduct(req, res.response);

        expect(productConstructor).toHaveBeenCalledWith({
            name: "Product Name",
            description: "A sufficiently detailed description",
            price: 19.5,
            category: "Men",
            image: "image.webp",
        });
        expect(saveProduct).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("rejects a missing image", async () => {
        const res = createResponse();

        await addProduct(createRequest(), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Please upload an image",
        });
    });

    it("rejects a non-positive product price", async () => {
        const req = createRequest({
            body: { name: "Product", description: "Detailed product description", price: "-1", category: "Men" },
            file: { filename: "image.webp" } as Express.Multer.File,
        });
        const res = createResponse();

        await addProduct(req, res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Please write a real price greater than 0",
        });
        expect(saveProduct).not.toHaveBeenCalled();
    });

    it("returns the product list", async () => {
        const products = [{ _id: "product-1", name: "Product" }];
        productStatics.find.mockResolvedValue(products);
        const res = createResponse();

        await listProducts(createRequest(), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: products });
    });

    it("removes a product and its image", async () => {
        productStatics.findById.mockResolvedValue({
            _id: "product-1",
            image: "image.webp",
        });
        productStatics.findByIdAndDelete.mockResolvedValue({ _id: "product-1" });
        const res = createResponse();

        await removeProduct(createRequest({ body: { id: "product-1" } }), res.response);

        expect(productStatics.findByIdAndDelete).toHaveBeenCalledWith("product-1");
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
