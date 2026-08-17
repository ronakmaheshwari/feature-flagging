import type { Feature_Flag } from "@prisma/client";
import crypto from "crypto"
import type { FeatureFlagRules, userInterface } from "../../interface/feature-flag";

export const getUserBucket = (
    userId: string,
    flagName: string
) => {
    const hash = crypto.createHash('md5').update(`${userId}:${flagName}`).digest();
    const thirtyTwoBitInt = hash.readUInt32BE(0);

    return thirtyTwoBitInt % 101;
}


export const evaluateFlag = (
    user: userInterface,
    flag: Feature_Flag 
) => {
    if(!flag.is_enabled) {
        return {
            success: false,
            message: "The given flag is off"
        }
    }

    const rules = flag.rules as FeatureFlagRules || {};
    const blacklist = rules.blacklist ?? []
    const whitelist = rules.whitelist ?? []
    const grouplist = rules.groups ?? []

    if(blacklist.length > 0 && rules.blacklist?.includes({userId: user.userId})) {
        return false
    }

    if(whitelist.length > 0) {
        return rules.whitelist?.includes({userId: user.userId});
    }

    if(grouplist.length > 0) {
        const inTarget = user.group.some(x => rules.groups?.includes(x));
        if(inTarget) {
            return true
        }
    }

    if(flag.rollout === 100) {
            return true
    }

    if(flag.rollout === 0) {
        return false
    }

    const bucket = getUserBucket(user.userId, flag.name);

    return bucket < flag.rollout;
}