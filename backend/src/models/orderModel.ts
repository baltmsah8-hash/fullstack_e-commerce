import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    products: {type: String, required: true},
    amount: {type: Number, required: true},
    address: {type: Object, required: true},
    status: {
        type: String,
        enum: ['pending', 'on the way', 'delivered'],
        default: 'pending',
    },
    date: {type: String, default: Date.now()},
    payment: {type: Boolean, default: false},
});

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;