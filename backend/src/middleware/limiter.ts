import rateLimit from "express-rate-limit";


const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 5 minutes."
    }
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: "Too many messages. Please try again after 15 minutes."
    }
});

export { loginLimiter, contactLimiter };