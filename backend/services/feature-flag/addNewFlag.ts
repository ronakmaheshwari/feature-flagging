import type { ENVIRONMENT_TYPE, Prisma } from "@prisma/client";
import type { FeatureFlagRules } from "../../interface/feature-flag";
import { getCachedFlag } from "../../utils/cache/cache";
import db from "../../utils/db/db";

export const addNewFlag = async (
    userId: string,
    name: string,
    is_enabled: boolean,
    environment: ENVIRONMENT_TYPE,
    rules: FeatureFlagRules,
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
        const addFlag =await tx.feature_Flag.create({
            data: {
                name: name,
                is_enabled: is_enabled,
                environment: environment,
                rules: JSON.stringify(rules),
                rollout: rollout
            }
        });
        await tx.feature_Flag_Audit.create({
            data: {
                flagId: addFlag.id,
                old_value: {},
                new_value: {
                    userId: userId,
                    name: addFlag.name,
                    is_enabled: addFlag.is_enabled,
                    environment: addFlag.environment,
                    rules: addFlag.rules,
                    rollout: addFlag.rollout
                },
                updatedBy: userId as string,
            }
        })
    })

    return {
        errorCode: 200,
        success: false,
        message: `The given flag ${name} is created`
    }
}