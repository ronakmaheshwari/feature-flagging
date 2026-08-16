import type { Prisma } from "@prisma/client"
import db from "../../utils/db/db"

export const deleteContentService = async (
    userId: string,
    contentId: string
) => {
    const findContent = await db.content.findUnique({
        where: {
            id: contentId as string
        }
    })

    if(!findContent) {
        return {
            errorCode: 404,
            success: false,
            message: "Invalid Content Id was provided"
        }
    }

    if(findContent.isDeleted) {
        return {
            errorCode: 401,
            success: false,
            message: "The given content is already deleted"
        }
    }

    if(findContent.userId !== userId) {
        return {
            errorCode: 401,
            success: false,
            message: "The content doesnt belong to you"
        }
    }

    const deleteContent = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const contentDeleted = await tx.content.update({
            where: {
                id: contentId
            },
            data: {
                isDeleted: true
            }
        });
        await tx.contentAudit.create({
            data: {
                contentId: contentDeleted.id as string,
                old_value: {
                    isDeleted: findContent.isDeleted
                },
                new_value: {
                    isDeleted: contentDeleted.isDeleted
                }
            }
        })
    })

    return {
        errorCode: 200,
        success: true,
        message: "The content was successfully deleted"
    }
}