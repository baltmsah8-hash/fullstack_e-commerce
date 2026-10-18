import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "../utils/testUtils";

jest.mock("../models/userModel", () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock("../models/productModel", () => ({ __esModule: true, default: { exists: jest.fn() } }));

const userModel = require("../models/userModel").default as typeof import("../models/userModel").default;
const productModel = require("../models/productModel").default as typeof import("../models/productModel").default;
const { addToCart, clearCart, getCart, removeItemFromCart } = require("./cartControllers") as typeof import("./cartControllers");
const findUser = userModel.findById as unknown as jest.Mock<(...args: unknown[]) => unknown>;
const productExists = productModel.exists as unknown as jest.Mock<(...args: unknown[]) => Promise<unknown>>;

describe("cart controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("adds an existing product to the user's cart", async () => {
        const user = {
            cartData: { "product-1": 2 },
            markModified: jest.fn(),
            save: jest.fn(async () => undefined),
        };
        findUser.mockReturnValue({ select: jest.fn(async () => user) });
        productExists.mockResolvedValue({ _id: "product-1" });
        const req = createRequest({ userId: "user-1", body: { id: "product-1" } });
        const res = createResponse();

        await addToCart(req, res.response);

        expect(user.cartData).toEqual({ "product-1": 3 });
        expect(user.markModified).toHaveBeenCalledWith("cartData");
        expect(user.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Product Added To cart" });
    });

    it("does not add a product that does not exist", async () => {
        findUser.mockReturnValue({ select: jest.fn(async () => ({ cartData: {} })) });
        productExists.mockResolvedValue(null);
        const res = createResponse();

        await addToCart(createRequest({ userId: "user-1", body: { id: "missing" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Product Not Found" });
    });

    it("decreases quantity and removes an item when it reaches zero", async () => {
        const user = {
            cartData: { "product-1": 1 },
            markModified: jest.fn(),
            save: jest.fn(async () => undefined),
        };
        findUser.mockReturnValue(user);
        const res = createResponse();

        await removeItemFromCart(
            createRequest({ userId: "user-1", body: { id: "product-1", type: "decrease" } }),
            res.response,
        );

        expect(user.cartData).toEqual({});
        expect(user.markModified).toHaveBeenCalledWith("cartData");
        expect(user.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns the user's cart", async () => {
        findUser.mockReturnValue({ cartData: { "product-1": 2 } });
        const res = createResponse();

        await getCart(createRequest({ userId: "user-1" }), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "successful operation",
            cart: { "product-1": 2 },
        });
    });

    it("clears the user's cart", async () => {
        const user = {
            cartData: { "product-1": 2 },
            markModified: jest.fn(),
            save: jest.fn(async () => undefined),
        };
        findUser.mockReturnValue(user);
        const res = createResponse();

        await clearCart(createRequest({ userId: "user-1" }), res.response);

        expect(user.cartData).toEqual({});
        expect(user.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Cart Clear Successfully",
            cartData: {},
        });
    });
});
