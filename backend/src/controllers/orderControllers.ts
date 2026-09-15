import type { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import UserModel from "../models/userModel";
import Stripe from "stripe";
import productModel from "../models/productModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const placeOrder = async (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    try {
        const userId = req.userId;
        const { products, address } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        };

        let totalAmount: number = 0;
        let lineItems: any[] = [];

        for await (const item of products) {
            // we checked if item in DB or no
            const db_product = await productModel.findById(item._id);
            if (!db_product) {
                return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
            }

            const itemPrice: number = db_product.price * 100;
            totalAmount += itemPrice * item.quantity;

            lineItems.push({
                price_data: {
                    currency: "egp",
                    product_data: { name: db_product.name },
                    unit_amount: itemPrice,
                },
                quantity: item.quantity,
            });
        };

        // add shipping fee by cent
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

        const newOrder = new OrderModel({
            userId: userId,
            products: JSON.stringify(products),
            amount: totalAmount / 100,
            address: address,
            status: "pending",
            payment: false,
        });

        await newOrder.save();

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: "payment",
            success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId!,
            }
        });
        res.status(200).json({ success: true, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
    } catch (err: any) {
        console.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        if (orderId) {
            await OrderModel.findByIdAndUpdate(orderId, { payment: true });
            await UserModel.findByIdAndUpdate(userId, { cartData: {} });
        }
    }
    res.status(200).json({ received: true });
};

const userOrder = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find({ userId: req.userId as any });
        console.log("orders fetched from DB", JSON.stringify(orders));
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const listOrders = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find({});
        res.status(200).json({ success: true, data: orders });
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

        await OrderModel.findByIdAndUpdate(orderId, { status: req.body.status })
        res.status(200).json({ success: true, message: "Status updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { listOrders, updataStatus, userOrder, stripeWebhook, placeOrder };