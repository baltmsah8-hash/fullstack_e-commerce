"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = exports.stripeWebhook = exports.userOrder = exports.updataStatus = exports.listOrders = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const stripe_1 = __importDefault(require("stripe"));
const productModel_1 = __importDefault(require("../models/productModel"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
const placeOrder = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    try {
        const userId = req.userId;
        const { products, address } = req.body;
        if (!products || products.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        ;
        let totalAmount = 0;
        let lineItems = [];
        for await (const item of products) {
            // we checked if item in DB or no
            const db_product = await productModel_1.default.findById(item._id);
            if (!db_product) {
                return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
            }
            const itemPrice = db_product.price * 100;
            totalAmount += itemPrice * item.quantity;
            lineItems.push({
                price_data: {
                    currency: "egp",
                    product_data: { name: db_product.name },
                    unit_amount: itemPrice,
                },
                quantity: item.quantity,
            });
        }
        ;
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
        const newOrder = new orderModel_1.default({
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
                userId: userId,
            }
        });
        res.status(200).json({ success: true, url: session.url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.placeOrder = placeOrder;
const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        if (orderId) {
            await orderModel_1.default.findByIdAndUpdate(orderId, { payment: true });
            await userModel_1.default.findByIdAndUpdate(userId, { cartData: {} });
        }
    }
    res.status(200).json({ received: true });
};
exports.stripeWebhook = stripeWebhook;
const userOrder = async (req, res) => {
    try {
        const orders = await orderModel_1.default.find({ userId: req.userId });
        console.log("orders fetched from DB", JSON.stringify(orders));
        res.status(200).json({ success: true, data: orders });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.userOrder = userOrder;
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel_1.default.find({});
        res.status(200).json({ success: true, data: orders });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.listOrders = listOrders;
const updataStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const allowedStatus = ['pending', 'on the way', 'delivered'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        await orderModel_1.default.findByIdAndUpdate(orderId, { status: req.body.status });
        res.status(200).json({ success: true, message: "Status updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updataStatus = updataStatus;
