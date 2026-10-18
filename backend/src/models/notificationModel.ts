import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    title: {type: String, enum: ["contact", "order", "stock", "users"], default: 'order' },
    message: {type: String, required: true},
    isRead: {type: Boolean, default: false},
    data: { type: Object, default: {} },
    orderId: { type: String, unique: true, sparse: true },
}, {timestamps: true});

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;