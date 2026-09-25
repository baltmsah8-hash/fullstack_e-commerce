import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongooseConnection from './config/db';
import userRoutes from './routes/userRoutes';
import orderRouter from './routes/orderRouts';
import productRouter from './routes/productRouts';
import cartRouter from './routes/cartRouts';
import adminRouter from './routes/adminRoutes';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'status' in err && err.message.includes('JSON')) {
        return res.status(400).json({ 
            success: false, 
            message: "The sent data is not in a valid JSON format; please check the quotation marks and spaces"
        });
    }
    next();
});

app.use("/images", express.static("uploads"));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);


mongooseConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
});