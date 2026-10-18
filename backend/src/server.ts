import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { mongooseConnection, isConnected, updateServer } from './config/db'; 
import userRoutes from './routes/userRoutes';
import orderRouter from './routes/orderRoutes';
import productRouter from './routes/productRoutes';
import cartRouter from './routes/cartRoutes';
import adminRouter from './routes/adminRoutes';
import notificationRouter from './routes/notificationRoutes';
import adminSeeder from './database/seeders/adminSeeder';
const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));

app.set('trust proxy', 1);

app.use(express.json({
    verify: (req: any, res, buf) => {
        if (req.originalUrl.includes('/webhook')) {
            req.rawBody = buf;
        }
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(
    "/images",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static("uploads")
);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
        return next();
    }

    if (!isConnected) {
        return res.status(503).json({
            success: false,
            message: "The service is temporarily unavailable due to database maintenance, Please try again later."
        });
    }
    
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);


const appStart = async () => {
    try {
        await mongooseConnection();

        await adminSeeder();
        
        const server = app.listen(PORT, () => {
            console.log(`server is active in port ${PORT}`)
        });

        updateServer(server);

    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
};

appStart();