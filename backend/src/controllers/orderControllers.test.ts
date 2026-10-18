import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import mongoose from "mongoose";
import { createRequest, createResponse } from "../utils/testUtils";

const mockOrderId = "507f1f77bcf86cd799439011";
const mockUserId = "507f191e810c19729de860ea";
const mockStripeCreate = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockConstructEvent = jest.fn<(...args: unknown[]) => unknown>();
const mockOrderSave = jest.fn<() => Promise<unknown>>();
const mockNotification = jest.fn<(...args: unknown[]) => unknown>();
const mockTrackerPost = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock("../models/orderModel", () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn().mockImplementation(function (this: Record<string, unknown>, data: unknown) {
            Object.assign(this, data);
            this._id = { toString: () => mockOrderId };
            this.save = mockOrderSave;
        }),
        {
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
        },
    ),
}));
jest.mock("../models/userModel", () => ({
    __esModule: true,
    default: { findById: jest.fn(), updateOne: jest.fn() },
}));
jest.mock("../models/productModel", () => ({
    __esModule: true,
    default: { find: jest.fn() },
}));
jest.mock("../utils/analytics", () => ({
    Tracker: jest.fn().mockImplementation((...args: unknown[]) => {
        mockNotification(...args);
        return { postNotification: mockTrackerPost };
    }),
}));
jest.mock("stripe", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        checkout: { sessions: { create: mockStripeCreate } },
        webhooks: { constructEvent: mockConstructEvent },
    })),
}));

process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock_secret";

const OrderModel = require("../models/orderModel").default as jest.Mock & {
    findByIdAndDelete: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    findOne: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    findOneAndUpdate: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    find: jest.Mock<(...args: unknown[]) => unknown>;
    findByIdAndUpdate: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
};
const UserModel = require("../models/userModel").default as {
    findById: jest.Mock<(id: string) => unknown>;
    updateOne: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
};
const productModel = require("../models/productModel").default as {
    find: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
};
const {
    listOrders,
    placeOrder,
    stripeWebhook,
    updataStatus,
    userOrder,
} = require("./orderControllers") as typeof import("./orderControllers");

const productId = "507f1f77bcf86cd799439012";
const dbProduct = {
    _id: { toString: () => productId },
    name: "Test product",
    price: 25,
};

const setCart = (cartData: Record<string, number> | null) => {
    UserModel.findById.mockReturnValue({
        select: jest.fn(async () => cartData === null ? null : { cartData }),
    });
};

describe("order controllers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.FRONTEND_URL = "http://localhost:3000";
        mockOrderSave.mockResolvedValue(undefined);
        mockStripeCreate.mockResolvedValue({
            id: "cs_test_session",
            url: "https://checkout.stripe.test/session",
        });
        mockTrackerPost.mockResolvedValue(undefined);
        productModel.find.mockResolvedValue([dbProduct]);
        OrderModel.findByIdAndDelete.mockResolvedValue({ _id: mockOrderId });
        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("creates an order snapshot from the saved cart and returns a Stripe URL", async () => {
        setCart({ [productId]: 2 });
        const address = { city: "Cairo", full_address: "12 Main Street" };
        const res = createResponse();

        await placeOrder(createRequest({
            userId: mockUserId,
            body: { address, products: [{ id: "ignored-client-product" }] },
        }), res.response);

        expect(OrderModel).toHaveBeenCalledWith(expect.objectContaining({
            userId: mockUserId,
            products: JSON.stringify([{ _id: productId, name: "Test product", price: 25, quantity: 2 }]),
            amount: 100,
            address,
            payment: false,
        }));
        expect(mockStripeCreate).toHaveBeenCalledWith(expect.objectContaining({
            mode: "payment",
            line_items: expect.arrayContaining([
                expect.objectContaining({ quantity: 2 }),
                expect.objectContaining({ quantity: 1 }),
            ]),
        }));
        expect(mockOrderSave).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            url: "https://checkout.stripe.test/session",
        });
    });

    it("rejects a missing shipping address before reading the cart", async () => {
        const res = createResponse();

        await placeOrder(createRequest({ userId: mockUserId, body: {} }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "A valid shipping address is required",
        });
        expect(UserModel.findById).not.toHaveBeenCalled();
    });

    it("returns 400 when the saved cart is empty", async () => {
        setCart({});
        const res = createResponse();

        await placeOrder(createRequest({
            userId: mockUserId,
            body: { address: { city: "Cairo" } },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Cart is empty" });
    });

    it("rejects invalid product IDs or non-positive quantities", async () => {
        setCart({ "invalid-id": -1 });
        const res = createResponse();

        await placeOrder(createRequest({
            userId: mockUserId,
            body: { address: { city: "Cairo" } },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Cart contains invalid product quantities",
        });
        expect(productModel.find).not.toHaveBeenCalled();
    });

    it("rejects products that have been removed from the catalogue", async () => {
        setCart({ [productId]: 1 });
        productModel.find.mockResolvedValue([]);
        const res = createResponse();

        await placeOrder(createRequest({
            userId: mockUserId,
            body: { address: { city: "Cairo" } },
        }), res.response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: `Product ${productId} not found`,
        });
    });

    it("removes the unpaid order if Stripe session creation fails", async () => {
        setCart({ [productId]: 1 });
        mockStripeCreate.mockRejectedValue(new Error("Stripe unavailable"));
        const res = createResponse();

        await placeOrder(createRequest({
            userId: mockUserId,
            body: { address: { city: "Cairo" } },
        }), res.response);

        expect(OrderModel.findByIdAndDelete).toHaveBeenCalledWith({ toString: expect.any(Function) });
        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Unable to create Stripe checkout session",
        });
    });

    it("rejects webhook requests without a signature or raw body", async () => {
        const res = createResponse();

        await stripeWebhook(createRequest({ headers: {} }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Missing webhook signature or raw request body",
        });
    });

    it("marks a matching order paid for a valid Stripe webhook", async () => {
        const products = [{ _id: productId, quantity: 1 }];
        const order = {
            amount: 75,
            products: JSON.stringify(products),
            sessionId: "cs_test_session",
        };
        mockConstructEvent.mockReturnValue({
            type: "checkout.session.completed",
            data: {
                object: {
                    id: "cs_test_session",
                    mode: "payment",
                    payment_status: "paid",
                    amount_total: 7500,
                    currency: "egp",
                    metadata: { orderId: mockOrderId, userId: mockUserId },
                },
            },
        });
        OrderModel.findOne.mockResolvedValue(order);
        OrderModel.findOneAndUpdate.mockResolvedValue({ ...order, payment: true });
        const res = createResponse();

        await stripeWebhook(createRequest({
            headers: { "stripe-signature": "valid-signature" },
            rawBody: Buffer.from("stripe-payload"),
        }), res.response);

        expect(OrderModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ payment: false }),
            { $set: { payment: true, sessionId: "cs_test_session" } },
            { new: true },
        );
        expect(mockNotification).toHaveBeenCalledWith(
            "order",
            "Successfully processed payment",
            mockOrderId,
        );
        expect(mockTrackerPost).toHaveBeenCalledWith({ orderId: mockOrderId, amount: 75 });
        expect(UserModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ _id: expect.any(mongoose.Types.ObjectId) }),
            { $set: { cartData: {} } },
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it("rejects an invalid delivery status", async () => {
        const res = createResponse();

        await updataStatus(createRequest({ body: { orderId: mockOrderId, status: "cancelled" } }), res.response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid status value" });
    });

    it("lists the authenticated user's orders", async () => {
        const order = {
            products: JSON.stringify([{ _id: productId, name: "Test product", price: 25, quantity: 1 }]),
            toObject: () => ({ _id: mockOrderId, products: "[]" }),
        };
        OrderModel.find.mockReturnValue({
            then: (resolve: (orders: typeof order[]) => unknown) => resolve([order]),
        });
        const res = createResponse();

        await userOrder(createRequest({ userId: mockUserId }), res.response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{ _id: mockOrderId, products: order.products }],
        });
    });
});
