import mongoose from "mongoose";
import dotenv from "dotenv";
import { createHttpTerminator } from "http-terminator";

dotenv.config();

let isConnected: boolean = false;
let reconnectionTimer: NodeJS.Timeout | null = null;
let serverActive: any | null = null;

const mongooseConnection = async () => {
    const db_url: string = process.env.MONGO_URL || "";

    if (!db_url.trim()) {
        console.error("MONGO_URL is missing or empty");
        process.exit(1);
    };

    mongoose.connection.on("connected", () => {
        isConnected = true;
        console.log("MongoDB connected successfully");

        if (reconnectionTimer) {
            clearTimeout(reconnectionTimer);
            reconnectionTimer = null;
            console.log("Reconnection timer cleared. Server is stable.");
        };
    });

    mongoose.connection.on("disconnected", () => {
        isConnected = false;
        console.error("MongoDB connection lost! Trying to reconnect...");

                if (!reconnectionTimer) {
            reconnectionTimer = setTimeout(async () => {
                console.error("Could not reconnect to MongoDB within 30s. Initiating Graceful Shutdown...");
                await gracefulShutdown(serverActive);
            }, 30000);
        }
    });

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB error:", err);
    });

    try {
        await mongoose.connect(db_url, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (err) {
        console.error("Initial Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

const gracefulShutdown = async (server: any) => {
    if (server) {
        console.log("Initiating http-terminator to safely clear pending requests...");
        
        try {
            const httpTerminator = createHttpTerminator({ server });

            await httpTerminator.terminate();
            console.log("HTTP server and all pending connections closed completely.");
        } catch (error) {
            console.error("Error during HTTP server termination:", error);
        } finally {
            console.log("Closing MongoDB connection...");
            await mongoose.connection.close();
            console.log("Process exiting safely.");
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
};

let isShutdown: boolean = false;

const handleSignal = async (signal: string) => {
    if (isShutdown) return;
    isShutdown = true;

    console.log(`\n Received ${signal}. Starting Graceful Shutdown...`);

    if (serverActive) {
        await gracefulShutdown(serverActive);
    } else {
        console.log("Server wasn't started yet. Closing MongoDB connection directly...");
        await mongoose.connection.close();
        process.exit(0);
    }
};

process.on("SIGTERM", () => handleSignal("SIGTERM"));
process.on("SIGINT", () => handleSignal("SIGINT"));


const updateServer = (server: any) => {
    serverActive = server;
};

export { mongooseConnection, isConnected, updateServer };