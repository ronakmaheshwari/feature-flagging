import type { Prisma } from "@prisma/client"
import type { FeatureFlagRules } from "../../interface/feature-flag"
import db from "../../utils/db/db"

export const addGroupService = async (
    adminId: string,
    flagId: string,
    groupId: string,
) => {
    const [findGroup, findAdmin] = await Promise.all([
        db.group.findUnique({ where: { id: groupId } }),
        db.user.findUnique({ where: { id: adminId } })
    ])

    if (!findGroup) {
        return { errorCode: 404, success: false, message: "The given group was not found" }
    }

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
    const groups = rules.groups ?? [];

    const alreadyInGroup = groups.some((x) => x === findGroup.name);
    if (alreadyInGroup) {
        return { errorCode: 409, success: false, message: "The given group is already listed" }
    }

    const updatedRules: FeatureFlagRules = {
        ...rules,
        groups: [...groups, findGroup.name],
    };

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.update({
            where: { id: flagId },
            data: {
                rules: updatedRules as unknown as Prisma.InputJsonValue,
            }
        });

        await tx.feature_Flag_Audit.create({
            data: {
                flagId: flag.id,
                old_value: { groups: rules.groups ?? [] } as Prisma.InputJsonObject,
                new_value: { groups: updatedRules.groups } as Prisma.InputJsonObject,
                updatedBy: adminId
            }
        })
    })

    return {
        errorCode: 200,
        success: true,
        message: `Group "${findGroup.name}" was added to flag "${findFlag.name}"`
    }
}