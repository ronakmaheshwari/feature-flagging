import db from "../../utils/db/db"

export const getContentAuditLogService = async (
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
            message: "No content was found"
        }
    }

    if(findContent.userId !== userId) {
        return {
            errorCode: 401,
            success: false,
            message: "The given content doesnt belong to you"
        }
    }

    if(findContent.isDeleted) {
        return {
            errorCode: 404,
            success: false,
            message: "The given content was already deleted"
        }
    }

    const findAudit = await db.contentAudit.findMany({
        where: {
            contentId: findContent.id as string
        },
        orderBy: {
            changed_at: "desc"
        }
    })

    if(findAudit.length <= 0) {
        return {
            errorCode: 200,
            success: true,
            message: "No Audit logs collected"
        }
    }

    return {
        errorCode: 200,
        success: true,
        message: "Audits were successfully fetched",
        data: findAudit
    }
}