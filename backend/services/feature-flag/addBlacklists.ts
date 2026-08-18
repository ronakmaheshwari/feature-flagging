import type { Prisma } from "@prisma/client"
import type { FeatureFlagRules } from "../../interface/feature-flag"
import db from "../../utils/db/db"

export const addBlacklistService = async (
    adminId: string,
    flagId: string,
    userId: string,
) => {
    const [findUser, findAdmin] = await Promise.all([
        db.user.findUnique({ where: { id: userId } }),
        db.user.findUnique({ where: { id: adminId } })
    ])

    if (!findUser) {
        return { errorCode: 404, success: false, message: "The given user was not found" }
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
    const blacklist = rules.blacklist ?? [];

    const alreadyBlacklisted = blacklist.some((x) => x.userId === userId);
    if (alreadyBlacklisted) {
        return { errorCode: 409, success: false, message: "The given user is already blacklisted" }
    }

    const updatedBlacklist = [...blacklist, { userId }];
    const updatedRules: FeatureFlagRules = {
        ...rules,
        blacklist: updatedBlacklist,
    };

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.update({
            where: { id: flagId },
            data: {
                rules: updatedRules as unknown as Prisma.InputJsonValue
            }
        });

        await tx.feature_Flag_Audit.create({
            data: {
                flagId: flag.id,
                old_value: { blacklist: blacklist as unknown as Prisma.InputJsonValue } as Prisma.InputJsonObject,
                new_value: { blacklist: updatedBlacklist as unknown as Prisma.InputJsonValue } as Prisma.InputJsonObject,
                updatedBy: adminId
            }
        })
    })

    return {
        errorCode: 200,
        success: true,
        message: `The given user ${findUser.email} was added in blacklist`
    }
}