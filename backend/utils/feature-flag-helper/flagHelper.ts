import type { Feature_Flag } from "@prisma/client";
import crypto from "crypto"
import type { FeatureFlagRules, userInterface } from "../../interface/feature-flag";
import db from "../db/db";

export const getUserBucket = (
    userId: string,
    flagName: string
) => {
    const hash = crypto.createHash('md5').update(`${userId}:${flagName}`).digest();
    const thirtyTwoBitInt = hash.readUInt32BE(0);

    return thirtyTwoBitInt % 101;
}

export const evaluateFlag = async (
    userId: string,
    flag: Feature_Flag
): Promise<{ success: boolean; message: string }> => {
    if (!flag.is_enabled) {
        return { success: false, message: "The given flag is off" };
    }

    const findUser = await db.user.findUnique({
        where: {
            id: userId as string
        },
        include: {
            group: true
        }
    });

    if(!findUser) {
        return { success: false, message: "The given user was not found" };
    }

    const rules = (flag.rules as FeatureFlagRules) || {};
    const blacklist = rules.blacklist ?? [];
    const whitelist = rules.whitelist ?? [];
    const grouplist = rules.groups ?? [];

    if (blacklist.length > 0 && blacklist.some(b => b.userId === findUser.id)) {
        return { success: false, message: "User is blacklisted for this flag" };
    }

    if (whitelist.length > 0) {
        const allowed = whitelist.some(w => w.userId === findUser.id);
        return {
            success: allowed,
            message: allowed ? "User is whitelisted for this flag" : "User is not whitelisted for this flag"
        };
    }

    if (grouplist.length > 0) {
        const inTarget = findUser.group.some(x => rules.groups?.includes(x.name));
        if (inTarget) {
            return { success: true, message: "User is in a targeted group for this flag" };
        }
    }

    if (flag.rollout === 100) {
        return { success: true, message: "Flag is fully rolled out" };
    }

    if (flag.rollout === 0) {
        return { success: false, message: "Flag rollout is 0%" };
    }

    const bucket = getUserBucket(findUser.id, flag.name);
    const inRollout = bucket < flag.rollout;

    return {
        success: inRollout,
        message: inRollout ? "User is within rollout percentage" : "User is outside rollout percentage"
    };
};