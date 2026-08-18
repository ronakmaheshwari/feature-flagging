import db from "../../utils/db/db"
import { evaluateFlag } from "../../utils/feature-flag-helper/flagHelper"

export const evaluateUserFlag = async (
    flagId: string,
    userId: string
) => {
    const [findUser, membership] = await Promise.all([
        db.user.findUnique({ 
        where: { id: userId }, 
        include: {
            memberships: {
                include: {
                    group: true
                }
            }
        } }),
        db.groupMember.findMany({
            where: {
                userId: userId as string
            },
            select: {
                group: {
                    select: {
                        name: true
                    }
                }
            }
        })
    ])

    if (!findUser) {
        return { errorCode: 404, success: false, message: "The given user was not found" }
    }

    if(findUser.user_status !== "ACTIVE") {
        return { errorCode: 404, success: false, message: "The given user is not active" }
    }

    const findFlag = await db.feature_Flag.findUnique({ where: { id: flagId } })

    if (!findFlag) {
        return { errorCode: 404, success: false, message: "The given flag was not found" }
    }

    if (findFlag.isDeleted) {
        return { errorCode: 404, success: false, message: "The given flag is deleted" }
    }

    if(!findFlag.is_enabled) {
        return { errorCode: 404, success: false, message: "The given flag is not enabled" }
    }

    const userGroup = membership.map((x) => x.group.name)

    const evaludateUser = evaluateFlag(
        {userId: findUser.id, group: userGroup},
        findFlag
    )
    
    if(evaludateUser) {
        return {
            errorCode: 200,
            success: true,
            message: "You are allowed to access the flag",
        }
    } else {
        return {
            errorCode: 401,
            success: false,
            message: "You are not allowed to access the flag",
        }
    }
}