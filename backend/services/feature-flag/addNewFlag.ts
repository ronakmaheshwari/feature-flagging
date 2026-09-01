import type { ENVIRONMENT_TYPE, Prisma } from "@prisma/client";
import type { FeatureFlagRules } from "../../interface/feature-flag";
import { getCachedFlag } from "../../utils/cache/cache";
import db from "../../utils/db/db";
import type { flagRulesValidationType } from "../../validation/featureFlagValidation";

export const addNewFlagService = async (
    userId: string,
    name: string,
    is_enabled: boolean,
    environment: ENVIRONMENT_TYPE,
    rules: flagRulesValidationType,
    rollout: number
) => {
    const cachedFlag = await getCachedFlag(name, environment);
    if(cachedFlag) {
        return {
            errorCode: 401,
            success: false,
            message: `The given flag ${name} already exists`
        }
    }

    const findFlag = await db.feature_Flag.findUnique({
        where: {
            name: name
        }
    })

    if(findFlag) {
        return {
            errorCode: 401,
            success: false,
            message: `The given flag ${name} already exists`
        }
    }

    const addFlag = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.create({
            data: {
                name: name,
                is_enabled: is_enabled,
                environment: environment,
                rules: (typeof rules === "string" ? JSON.parse(rules) : (rules || {})) as Prisma.InputJsonValue,
                rollout: rollout
            }
        });
        await tx.feature_Flag_Audit.create({
            data: {
                flagId: flag.id,
                old_value: {},
                new_value: {
                    userId: userId,
                    name: flag.name,
                    is_enabled: flag.is_enabled,
                    environment: flag.environment,
                    rules: flag.rules,
                    rollout: flag.rollout
                },
                updatedBy: userId as string,
            }
        });
        return flag;
    });

    return {
        errorCode: 200,
        success: true,
        message: `The given flag ${name} is created`,
        data: addFlag
    };
}