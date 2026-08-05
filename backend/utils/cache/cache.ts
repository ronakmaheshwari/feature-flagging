import { createClient } from "redis";

const redisCache = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

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

export {redisCache, initRedis}