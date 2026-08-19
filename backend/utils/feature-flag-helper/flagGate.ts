import dotenv from "dotenv"
import db from "../db/db";
import { match, type MatchFunction } from "path-to-regexp";
import type { Feature_Flag } from "@prisma/client";

dotenv.config();

type CompiledRoute = {
    method: string;
    path: string;
    matcher: MatchFunction<Record<string, string>>;
    flag: any;
};

let compiledRoutes: CompiledRoute[] = [];
let lastLoaded: number = 0;
let loadingPromise: Promise<void> | null = null;

const parsedTTL = parseInt(process.env.ROUTE_CACHE_TTL as string, 10);
const ROUTE_CACHE_TTL: number = Number.isNaN(parsedTTL) ? 60_000 : parsedTTL;

if(!ROUTE_CACHE_TTL) {
    throw new Error(`ROUTE_CACHE_TTL must be provided: ${ROUTE_CACHE_TTL}`);
}

const loadRouteMap = async () => {
    const now = Date.now();
    if(now - lastLoaded < ROUTE_CACHE_TTL) {
        return
    };

    if (loadingPromise){
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        const routes = await db.routeFlag.findMany({include: {feature_flag: true}});
        compiledRoutes = routes.map(x => ({
            method: x.method.toUpperCase(),
            path: x.path,
            matcher: match(x.path, {decode: decodeURIComponent}),
            flag: x.feature_flag
        }))
        lastLoaded = Date.now();
    })()

    try {
        await loadingPromise;
    } finally {
        loadingPromise = null;
    }
};

const resolveRoute = (method: string, path: string):  { flag: Feature_Flag; params: Record<string, string> } | null => {
    const upperCaseMethod = method.toUpperCase();
    for (const route of compiledRoutes) {
        if (route.method !== upperCaseMethod && route.method !== "*") continue;

        const result = route.matcher(path);
        if (result) {
            return { flag: route.flag, params: result.params };
        }
    }
    return null;
}

export {loadRouteMap, resolveRoute}