import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    title: {type: String, enum: ["contact", "order", "stock"], default: 'order' },
    message: {type: String, required: true},
    isRead: {type: Boolean, default: false},
    data: {type: Object, default: {}}
}, {timestamps: true});

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;