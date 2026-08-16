import type { Prisma } from "@prisma/client";
import db from "../../utils/db/db"

export const removeUserFromGroupService = async (
    email: string,
    groupId: string
) => {
    const findUser = await db.user.findUnique({
        where: {
            email: email
        }
    });

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

    if (!existingMembership) {
        return { 
            errorCode: 401,
            success: false, 
            message: "The user is not a member of this group" 
        };
    }

    const removeMembership = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: findUser.id as string,
                    groupId: findGroup.id as string
                }
            }
        });
        await tx.group.update({
            where: {
                id: findGroup.id as string
            },
            data: {
                total_users: {
                    decrement: 1
                }
            }
        })
    })

    return {
        errorCode: 200,
        success: true,
        message: `The ${email} was successfully removed from ${findGroup.name}`
    }
}