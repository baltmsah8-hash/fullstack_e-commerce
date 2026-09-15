"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderControllers_1 = require("../controllers/orderControllers");
const auth_1 = __importDefault(require("../middleware/auth"));
const orderRouter = express_1.default.Router();
orderRouter.post('/place', auth_1.default, orderControllers_1.placeOrder);
orderRouter.post('/webhook', orderControllers_1.stripeWebhook);
orderRouter.post('/user-orders', auth_1.default, orderControllers_1.userOrder);
orderRouter.post('/status', orderControllers_1.updataStatus);
orderRouter.get('/orders-list', orderControllers_1.listOrders);
exports.default = orderRouter;
