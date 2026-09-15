"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRouts_1 = __importDefault(require("./routes/orderRouts"));
const productRouts_1 = __importDefault(require("./routes/productRouts"));
const cartRouts_1 = __importDefault(require("./routes/cartRouts"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
(0, db_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
});
app.use("/images", express_1.default.static("uploads"));
app.use('/api/users', userRoutes_1.default);
app.use('/api/orders', orderRouts_1.default);
app.use('/api/products', productRouts_1.default);
app.use('/api/cart', cartRouts_1.default);
app.use('/api/admin', adminRoutes_1.default);
