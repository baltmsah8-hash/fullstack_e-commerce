"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    products: { type: String, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
        type: String,
        enum: ['pending', 'on the way', 'delivered'],
        default: 'pending',
    },
    date: { type: String, default: Date.now() },
    payment: { type: Boolean, default: false },
});
const orderModel = mongoose_1.default.model('Order', orderSchema);
exports.default = orderModel;
