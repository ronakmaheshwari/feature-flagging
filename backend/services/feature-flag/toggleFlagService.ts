import type { Prisma } from "@prisma/client"
import db from "../../utils/db/db"

export const toggleFlagService = async (
    adminId: string,
    flagId: string,
    isEnabled: boolean,
) => {
    const findFlag = await db.feature_Flag.findUnique({
        where: {
            id: flagId as string
        }
    })

    if(!findFlag) {
        return {
            errorCode: 404,
            success: false,
            message: "The flag was not found"
        }
    }

    if(findFlag.isDeleted) {
        return {
            errorCode: 401,
            success: false,
            message: "The flag was deleted"
        }
    }

    if(findFlag.is_enabled === isEnabled) {
        return {
            errorCode: 401,
            success: false,
            message: `The given flag is already ${findFlag.is_enabled}`
        }
    }

    const updateFlag = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const flag = await tx.feature_Flag.update({
            where: {
                id: findFlag.id as string
            },
            data: {
                is_enabled: isEnabled
            }
        });
        await tx.feature_Flag_Audit.create({
            data: {
                updatedBy: adminId as string,
                old_value: {
                    is_enabled: findFlag.is_enabled
                },
                new_value: {
                    is_enabled: flag.is_enabled
                },
                flagId: flag.id as string
            }
        })
        return flag
    })


    return {
        errorCode: 200,
        success: true,
        message: `The given flag is ${updateFlag.is_enabled}`
    }
}