import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongooseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

export default mongooseConnection;