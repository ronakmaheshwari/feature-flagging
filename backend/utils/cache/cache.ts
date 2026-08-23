import { createClient } from "redis";
import dotenv from "dotenv";
import type { ENVIRONMENT_TYPE } from "@prisma/client";

dotenv.config();

const redisCache = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

const FLAG_TTL_TIME = 60;

const FLAG_KEY = (name: string, env: ENVIRONMENT_TYPE) =>
    `flag:${env}:${name}`;

const ALL_FLAG_KEY = (env: ENVIRONMENT_TYPE) =>
    `flag:all:${env}`;

export const OTP_EXPIRE_MINUTES =
    Number(process.env.OTP_EXPIRE_MINUTES) || 2;

export const CACHE_KEY = (email: string, id: string) =>
    `OTP:${id}:${email}`;

export const TTL_TIME = 120;

redisCache.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

redisCache.on("connect", () => {
    console.log("Redis connecting...");
});

redisCache.on("ready", () => {
    console.log("Redis client ready");
});

redisCache.on("end", () => {
    console.log("Redis connection closed");
});

const initRedis = async () => {
    if (redisCache.isOpen) {
        console.log("Redis client is already open");
        return;
    }

    try {
        await redisCache.connect();

        console.log(
            "Redis connected:",
            redisCache.isOpen,
            redisCache.isReady
        );
    } catch (error) {
        console.error("Redis connection failed:", error);
        throw error;
    }
};

const getCachedFlag = async (
    name: string,
    env: ENVIRONMENT_TYPE
) => {
    const raw = await redisCache.get(FLAG_KEY(name, env));

    return raw ? JSON.parse(raw) : null;
};

const setCachedFlag = async (
    name: string,
    env: ENVIRONMENT_TYPE,
    flagData: any
) => {
    await redisCache.setEx(
        FLAG_KEY(name, env),
        FLAG_TTL_TIME,
        JSON.stringify(flagData)
    );
};

const invalidateCache = async (
    name: string,
    env: ENVIRONMENT_TYPE
) => {
    await redisCache.del(FLAG_KEY(name, env));
    await redisCache.del(ALL_FLAG_KEY(env));
};

export {
    redisCache,
    initRedis,
    getCachedFlag,
    setCachedFlag,
    invalidateCache,
};