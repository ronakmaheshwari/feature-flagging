import { createClient } from "redis";
import dotenv from "dotenv"
import type { ENVIRONMENT_TYPE } from "@prisma/client";

dotenv.config()

const redisCache = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

const FLAG_TTL_TIME = 60;
const FLAG_KEY = (name: string, env: string) => `flag:${env}:${name}`;
const ALL_FLAG_KEY = (env:string) => `flag:all:${env}`;
export const OTP_EXPIRE_MINUTES = parseInt(process.env.OTP_EXPIRE_MINUTES as string) ?? 2
export const CACHE_KEY = (email: string, id: string) => `OTP:${id}:${email}`
export const TTL_TIME = 120

redisCache.on("error",(e) => {
    console.log(`Redis client couldnt get connected: ${e}`);
});

const initRedis = async () => {
    try {
        if(!redisCache.isOpen) {
            await redisCache.connect();
        }
    } catch (error) {
        console.log(`Error took place at redis setup: ${error}`);
    }
}

const getCachedFlag = async (name: string, env: ENVIRONMENT_TYPE) => {
    const raw = await redisCache.get(FLAG_KEY(name, env));
    return raw ? JSON.parse(raw) : null;
}

const setCachedFlag = async (name: string, env: ENVIRONMENT_TYPE, flagData: any) => {
    await redisCache.setEx(
        FLAG_KEY(name, env),
        TTL_TIME,
        JSON.stringify(flagData)
    )
}

const invalidateCache = async (name: string, env: ENVIRONMENT_TYPE) => {
    await redisCache.del(FLAG_KEY(name, env));
    await redisCache.del(ALL_FLAG_KEY(env));
}

export {redisCache, initRedis, getCachedFlag, setCachedFlag, invalidateCache}