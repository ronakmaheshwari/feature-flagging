import type { FeatureFlagRules } from "../../interface/feature-flag"
import db from "../../utils/db/db"
import { getUserBucket } from "../../utils/feature-flag-helper/flagHelper"

export const getFlagNames = async (
    userId: string,
    all: boolean
) => {
    if (all) {
        const findAllFlags = await db.feature_Flag.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        return {
            errorCode: 200,
            success: true,
            message: "All flags were successfully fetched",
            data: findAllFlags,
        }
    }

    const getGroupMemberships = await db.groupMember.findMany({
        where: {
            userId,
            group: {
                isDeleted: false,
            },
        },
        select: {
            group: {
                select: {
                    name: true,
                },
            },
        },
    })

    const userGroups = getGroupMemberships.map(
        (membership) => membership.group.name
    )

    const findFlags = await db.feature_Flag.findMany({
        select: {
            id: true,
            name: true,
            rules: true,
            rollout: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    const allowedFlags = findFlags.filter((flag) => {
        const rules = flag.rules as FeatureFlagRules

        const blacklist = rules.blacklist ?? []
        const whitelist = rules.whitelist ?? []
        const grouplist = rules.groups ?? []

        if (blacklist.includes({userId})) {
            return false
        }

        if (whitelist.length > 0) {
            return whitelist.includes({userId})
        }

        if (grouplist.length > 0) {
            return userGroups.some((groupName) =>
                grouplist.includes(groupName)
            )
        }

        if(flag.rollout === 100) {
            return true
        }

        if(flag.rollout === 0) {
            return false
        }

        const bucket = getUserBucket(userId, flag.name);

        if(bucket < flag.rollout) {
            return true;
        }

        return true
    })

    return {
        errorCode: 200,
        success: true,
        message: "Feature flags were successfully fetched",
        data: allowedFlags.map(({ id, name }) => ({
            id,
            name,
        })),
    }
}