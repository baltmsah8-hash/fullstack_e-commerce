"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartControllers_1 = require("../controllers/cartControllers");
const auth_1 = __importDefault(require("../middleware/auth"));
const cartRouter = express_1.default.Router();
cartRouter.post('/add', cartControllers_1.addToCart);
cartRouter.post('/remove', cartControllers_1.removeItemFromCart);
cartRouter.post('/get', cartControllers_1.getCart);
cartRouter.post('/clear', auth_1.default, cartControllers_1.clearCart);
exports.default = cartRouter;
