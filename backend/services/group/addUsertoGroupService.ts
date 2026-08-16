import type { Prisma } from "@prisma/client"
import db from "../../utils/db/db"

export const addUserGroupService = async (
    email: string,
    groupId: string
) => {
    const findUser = await db.user.findUnique({
        where: {
            email: email
        },
        select: {
            id: true,
            email: true,
            user_status: true,
            group: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    })

    if(!findUser) {
        return {
            errorCode: 404,
            success: false,
            message: "No user was found"
        }
    }

    if(findUser.user_status !== "ACTIVE") {
        return {
            errorCode: 404,
            success: false,
            message: "The given user is not active"
        }
    }

    const findGroup = await db.group.findUnique({
        where: {
            id: groupId as string
        }
    })

    if(!findGroup) {
        return {
            errorCode: 404,
            success: false,
            message: "The group was not found"
        }
    }

    if(findGroup.isDeleted) {
        return {
            errorCode: 404,
            success: false,
            message: "The group is deleted"
        }
    }

    const existingMembership = await db.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId: findUser.id as string,
                groupId: findGroup.id as string
            }
        }
    })

    if (existingMembership) {
        return { 
            errorCode: 401,
            success: false, 
            message: "The user is already a member of this group" 
        };
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.groupMember.create({
            data: {
                userId: findUser.id,
                groupId: findGroup.id,
            },
        });
        await tx.group.update({
            where: { id: findGroup.id },
            data: {
                total_users: { increment: 1 },
            },
        });
    })

    return {
        errorCode: 200,
        success: true,
        message: "User added to group successfully"
    }
}