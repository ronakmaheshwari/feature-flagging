import type { Prisma } from "@prisma/client";
import type { FeatureFlagRules, flagRuleInterface } from "../../interface/feature-flag";
import db from "../../utils/db/db";
import type { changeRulesValidationType } from "../../validation/featureFlagValidation";

export const changeFlagRulesService = async (
    adminId: string,
    flagId: string,
    data: changeRulesValidationType
) => {
    const [findAdmin] = await Promise.all([
        db.user.findUnique({ where: { id: adminId } })
    ])

    if (!findAdmin) {
        return { errorCode: 404, success: false, message: "The given admin was not found" }
    }

    if (findAdmin.role !== "ADMIN") {
        return { errorCode: 401, success: false, message: "The given user is not an admin" }
    }

    const findFlag = await db.feature_Flag.findUnique({ where: { id: flagId } })

    if (!findFlag) {
        return { errorCode: 404, success: false, message: "The given flag was not found" }
    }

    if (findFlag.isDeleted) {
        return { errorCode: 404, success: false, message: "The given flag is deleted" }
    }

    const rules = (findFlag.rules ?? {}) as FeatureFlagRules;
    const blacklist = Array.isArray(rules.blacklist) ? rules.blacklist : rules.blacklist ? [rules.blacklist] : [];
    const whitelist = Array.isArray(rules.whitelist) ? rules.whitelist : rules.whitelist ? [rules.whitelist] : [];
    const group = Array.isArray(rules.groups) ? rules.groups : rules.groups ? [rules.groups] : [];

    const updatedBlacklist = [...blacklist, ...((Array.isArray(data.blacklist) ? data.blacklist : data.blacklist ? [data.blacklist] : []))];
    const updatedWhitelist = [...whitelist, ...((Array.isArray(data.whitelist) ? data.whitelist : data.whitelist ? [data.whitelist] : []))];
    const updatedGroup = [...group, ...((Array.isArray(data.groups) ? data.groups : data.groups ? [data.groups] : []))];
    
    const updatedRules: FeatureFlagRules = {
        blacklist: updatedBlacklist,
        whitelist: updatedWhitelist,
        groups: updatedGroup,
    };

    const updateFlagRules = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.update({
            where: {
                id: findFlag.id as string
            },
            data: {
                rules: updatedRules as unknown as Prisma.InputJsonValue,
                rollout: data.rollout
            }
        })

        await tx.feature_Flag_Audit.create({
            data: {
                flagId: findFlag.id as string,
                old_value: {
                    rules: findFlag.rules,
                    rollout: findFlag.rollout
                },
                new_value: {
                    rules: flag.rules,
                    rollout: findFlag.rollout
                },
                updatedBy: findAdmin.id as string
            }
        })

        return flag;
    })

    return { success: true, errorCode: 200, message: "Flag rules updated successfully", data: updateFlagRules };
}