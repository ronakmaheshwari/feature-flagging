import type { Prisma } from "@prisma/client";
import db from "../../utils/db/db"

export const deleteFlagService = async (
    userId: string,
    flagId: string
) => {
    const getFlag = await db.feature_Flag.findUnique({
        where: {
            id: flagId as string
        }
    });

    if(!getFlag) {
        return {
            errorCode: 404,
            success: false,
            message: "No flag was found"
        }
    }

    const deleteFlag = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.update({
            where: {
                id: flagId as string
            },
            data: {
                isDeleted: true
            }
        });
        await tx.feature_Flag_Audit.create({
            data: {
                flagId: getFlag.id,
                old_value: {
                    isDeleted: getFlag.isDeleted
                },
                new_value: {
                    isDeleted: flag.isDeleted
                },
                updatedBy: userId as string
            }
        })
    });

    return {
        errorCode: 200,
        success: true,
        message: "The flag was successfully deleted"
    }
}