import type { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import UserModel from "../models/userModel";
import Stripe from "stripe";
import productModel from "../models/productModel";
import { Tracker } from "../utils/analytics";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const hydrateOrderProducts = async (orders: Array<InstanceType<typeof OrderModel>>) => {
    const legacyProductIds = new Set<string>();
    const parsedProducts: unknown[][] = orders.map((order) => {
        try {
            const products: unknown = JSON.parse(order.products);
            if (Array.isArray(products)) {
                return products;
            }
            if (isRecord(products)) {
                const entries = Object.entries(products);
                for (const [productId] of entries) {
                    if (mongoose.isValidObjectId(productId)) {
                        legacyProductIds.add(productId);
                    }
                }
                return entries.map(([productId, quantity]) => ({ productId, quantity }));
            }
        } catch (error) {
            console.error(`Unable to parse products for order ${order._id}:`, error);
        }
        return [];
    });

    const products = legacyProductIds.size
        ? await productModel.find({ _id: { $in: [...legacyProductIds] } })
        : [];
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));

    return orders.map((order, index) => {
        const orderProducts = parsedProducts[index] || [];
        const hydratedProducts = orderProducts.map((product) => {
            if (!isRecord(product) || typeof product.productId !== "string") {
                return product;
            }

            const dbProduct = productsById.get(product.productId);
            return dbProduct
                ? {
                    _id: dbProduct._id.toString(),
                    name: dbProduct.name,
                    price: dbProduct.price,
                    quantity: product.quantity,
                }
                : {
                    _id: product.productId,
                    name: "Product no longer available",
                    price: 0,
                    quantity: product.quantity,
                };
        });
        return { ...order.toObject(), products: JSON.stringify(hydratedProducts) };
    });
};

const placeOrder = async (req: Request, res: Response) => {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
    let newOrder: InstanceType<typeof OrderModel> | undefined;
    let session: Stripe.Checkout.Session | undefined;
    let stage = "loading cart";

    try {
        const userId = req.userId;
        const { address } = req.body;

        if (!address || typeof address !== "object" || Array.isArray(address)) {
            return res.status(400).json({ success: false, message: "A valid shipping address is required" });
        }

        const userData = await UserModel.findById(userId).select("cartData");

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        };

        const cartData: unknown = userData.cartData;
        if (!cartData || typeof cartData !== "object" || Array.isArray(cartData)) {
            return res.status(400).json({ success: false, message: "Cart data is invalid" });
        }

        const cartEntries = Object.entries(cartData as Record<string, unknown>);
        if (cartEntries.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        };

        if (cartEntries.some(([productId, quantity]) =>
            !mongoose.isValidObjectId(productId) ||
            !Number.isSafeInteger(quantity) ||
            (quantity as number) <= 0
        )) {
            return res.status(400).json({ success: false, message: "Cart contains invalid product quantities" });
        }

        stage = "loading products";
        const productIds = cartEntries.map(([productId]) => productId);
        const dbProducts = await productModel.find({ _id: { $in: productIds } });
        const productsById = new Map(dbProducts.map((product) => [product._id.toString(), product]));
        const missingProductId = productIds.find((productId) => !productsById.has(productId));
        if (missingProductId) {
            return res.status(404).json({ success: false, message: `Product ${missingProductId} not found` });
        }

        let totalAmount = 0;
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        for (const [productId, rawQuantity] of cartEntries) {
            const dbProduct = productsById.get(productId);
            if (!dbProduct) {
                throw new Error(`Product ${productId} disappeared while preparing the order`);
            }

            const itemPrice = Math.round(dbProduct.price * 100);
            const quantity = rawQuantity as number;
            if (!Number.isSafeInteger(itemPrice) || itemPrice <= 0) {
                throw new Error(`Product ${productId} has an invalid price`);
            }
            totalAmount += itemPrice * quantity;
            if (!Number.isSafeInteger(totalAmount)) {
                throw new Error("Order total exceeds the supported amount");
            }

            lineItems.push({
                price_data: {
                    currency: "egp",
                    product_data: { name: dbProduct.name },
                    unit_amount: itemPrice,
                },
                quantity,
            });
        }

        const shippingFee = 50 * 100;
        totalAmount += shippingFee;

        lineItems.push({
            price_data: {
                currency: "egp",
                product_data: { name: "shipping fee" },
                unit_amount: shippingFee,
            },
            quantity: 1,
        });

        stage = "creating order";
        newOrder = new OrderModel({
            userId,
            products: JSON.stringify(cartEntries.map(([productId, quantity]) => {
                const product = productsById.get(productId)!;
                return {
                    _id: product._id.toString(),
                    name: product.name,
                    price: product.price,
                    quantity,
                };
            })),
            amount: totalAmount / 100,
            address,
            status: "pending",
            payment: false,
        });
        await newOrder.save();

        stage = "creating Stripe session";
        session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: "payment",
            success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId!,
            }
        });
        if (!session.url) {
            throw new Error("Stripe did not return a checkout URL");
        }

        stage = "saving Stripe session ID";
        newOrder.sessionId = session.id;
        await newOrder.save();

        res.status(200).json({ success: true, url: session.url });
    } catch (err) {
        console.error(`Order checkout failed during ${stage}:`, err);

        if (stage === "creating Stripe session" && newOrder) {
            try {
                await OrderModel.findByIdAndDelete(newOrder._id);
            } catch (cleanupError) {
                console.error("Failed to remove the unpaid order after Stripe session creation failed:", cleanupError);
            }
            return res.status(502).json({ success: false, message: "Unable to create Stripe checkout session" });
        }

        if (stage === "saving Stripe session ID" && session?.url) {
            console.error("Stripe checkout is available, but its session ID could not be saved");
            return res.status(200).json({ success: true, url: session.url });
        }

        return res.status(500).json({ success: false, message: "Unable to place order" });
    }
};

const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured");
        return res.status(500).json({ success: false, message: "Webhook is not configured" });
    }

    if (typeof sig !== "string" || !Buffer.isBuffer(req.rawBody)) {
        return res.status(400).json({ success: false, message: "Missing webhook signature or raw request body" });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error("Stripe webhook signature verification failed:", err);
        return res.status(400).json({ success: false, message: "Invalid webhook signature or payload" });
    }

    const isPaidSessionEvent =
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded";
    if (!isPaidSessionEvent) {
        return res.status(200).json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "payment") {
        return res.status(400).json({ success: false, message: "Unexpected checkout session mode" });
    }

    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
        return res.status(200).json({ received: true, paymentPending: true });
    }

    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    if (
        typeof session.id !== "string" ||
        !session.id.startsWith("cs_") ||
        !orderId ||
        !mongoose.isValidObjectId(orderId) ||
        !userId ||
        !mongoose.isValidObjectId(userId) ||
        session.payment_status !== "paid" ||
        typeof session.amount_total !== "number" ||
        session.currency !== "egp"
    ) {
        return res.status(400).json({ success: false, message: "Invalid checkout session data" });
    }

    try {
        const orderObjectId = new mongoose.Types.ObjectId(orderId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const order = await OrderModel.findOne({ _id: orderObjectId, userId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found for this checkout session" });
        }

        if (order.sessionId && order.sessionId !== session.id) {
            console.error("Stripe session ID mismatch", {
                orderId,
                receivedSessionId: session.id,
                savedSessionId: order.sessionId,
            });
            return res.status(409).json({ success: false, message: "Checkout session does not match the order" });
        }

        if (session.amount_total !== Math.round(order.amount * 100)) {
            return res.status(400).json({ success: false, message: "Checkout amount does not match the order" });
        }

        const paidOrder = await OrderModel.findOneAndUpdate(
            {
                _id: orderObjectId,
                userId,
                payment: false,
                $or: [{ sessionId: session.id }, { sessionId: null }],
            },
            { $set: { payment: true, sessionId: session.id } },
            { new: true }
        );

        if (!paidOrder) {
            const currentOrder = await OrderModel.findOne({ _id: orderObjectId, userId });
            if (!currentOrder) {
                return res.status(404).json({ success: false, message: "Order not found for this checkout session" });
            }
            if (currentOrder.sessionId !== session.id) {
                return res.status(409).json({ success: false, message: "Checkout session does not match the order" });
            }
            if (!currentOrder.payment) {
                throw new Error("Order payment could not be claimed for processing");
            }
        }

        const storedProducts: unknown = JSON.parse(order.products);
        const orderProducts = Array.isArray(storedProducts)
            ? Object.fromEntries(storedProducts.map((product: { _id: string; quantity: number }) => [product._id, product.quantity]))
            : storedProducts as Record<string, number>;

        const tracker = new Tracker("order", "Successfully processed payment", orderId);
        await tracker.postNotification({ orderId, amount: order.amount });

        await UserModel.updateOne(
            {
                _id: userObjectId,
                $expr: { $eq: ["$cartData", { $literal: orderProducts }] },
            },
            { $set: { cartData: {} } }
        );

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("Stripe webhook processing failed:", err);
        return res.status(500).json({ success: false, message: "Unable to process payment webhook" });
    }
};


const userOrder = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find({ userId: req.userId as any });
        res.status(200).json({ success: true, data: await hydrateOrderProducts(orders) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const listOrders = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: await hydrateOrderProducts(orders) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updataStatus = async (req: Request, res: Response) => {
    try {
        const { orderId, status } = req.body;
        const allowedStatus = ['pending', 'on the way', 'delivered'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, { status: req.body.status });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" })
        };

        res.status(200).json({ success: true, message: "Status updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { listOrders, updataStatus, userOrder, stripeWebhook, placeOrder };