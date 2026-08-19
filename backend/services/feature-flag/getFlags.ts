import db from "../../utils/db/db"

export const getFlagService = async () => {
    const findAllFlags = await db.feature_Flag.findMany({
        select: {
            id: true,
            name: true,
            is_enabled: true,
            isDeleted: true,
            environment: true,
            rules: true,
            rollout: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            name: "asc"
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "All the flags were successfully fetched",
        data: findAllFlags
    }
}