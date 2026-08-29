import { type Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

interface rateLimiterInterface {
    minutes: number, 
    limit: number, 
    message: string, 
    skipSuccessfulRequests?: boolean, 
    skipFailedRequests?: boolean, 
    skip?: () => boolean | Promise<boolean>, 
    statusCode?: number
}

const createRateLimit = (data: rateLimiterInterface) => {
    return rateLimit({
        keyGenerator: (req: Request) => {
            const email = req.params?.email || req.body?.email;
            return email ?? ipKeyGenerator(req.ip ?? "unknown");
        },
        legacyHeaders: false,
        windowMs: data.minutes * 60 * 1000,
        limit: data.limit,
        skipFailedRequests: data.skipFailedRequests,
        skipSuccessfulRequests: data.skipSuccessfulRequests,
        message: data.message,
        statusCode: data.statusCode ?? 429,
        standardHeaders: true,
        skip: data.skip,
    });
}

const otpLimiter = createRateLimit({
    minutes: 5,
    limit: 3,
    message: "Too many requests, please try again after 5 minutes",
});

export {otpLimiter, createRateLimit}