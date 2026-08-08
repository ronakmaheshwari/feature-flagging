import { createClient } from "redis";

const redisCache = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

const TTL_TIME = 60;
const FLAG_KEY = (name: string, env: string) => `flag:${env}:${name}`;
const ALL_FLAG_KEY = (env:string) => `flag:all:${env}`;

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

const getCachedFlag = async (name: string, env: string) => {
    const raw = await redisCache.get(FLAG_KEY(name, env));
    return raw ? JSON.parse(raw) : null;
}

const setCachedFlag = async (name: string, env: string, flagData: any) => {
    await redisCache.setEx(
        FLAG_KEY(name, env),
        TTL_TIME,
        JSON.stringify(flagData)
    )
}

const invalidateCache = async (name: string, env: string) => {
    await redisCache.del(FLAG_KEY(name, env));
    await redisCache.del(ALL_FLAG_KEY(env));
}

export {redisCache, initRedis, getCachedFlag, setCachedFlag, invalidateCache}