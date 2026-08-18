import db from "../../utils/db/db"

export const getFlagAuditService = async (
    flagId: string
) => {
    const findFlag = await db.feature_Flag.findUnique({
        where: {
            id: flagId as string
        }
    })

    if (!findFlag) {
        return { errorCode: 404, success: false, message: "The given flag was not found" }
    }

    if (findFlag.isDeleted) {
        return { errorCode: 404, success: false, message: "The given flag is deleted" }
    }

    const getAllAudit = await db.feature_Flag_Audit.findMany({
        where: {
            flagId: findFlag.id as string
        },
        select: {
            id: true,
            old_value: true,
            new_value: true,
            feature_flag: {
                select: {
                    id: true,
                    name: true
                }
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                }
            }
        },
        orderBy: {
            changed_at: "desc"
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: `All the audit logs for the ${findFlag.name} were fetched`,
        data: getAllAudit
    }
}