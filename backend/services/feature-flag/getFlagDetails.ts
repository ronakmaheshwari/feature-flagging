import db from "../../utils/db/db"

export const getFlagDetailsService = async (flagId: string) => {
    const findFlagDetails = await db.feature_Flag.findUnique({
        where: {
            id: flagId as string
        },
        select: {
            id: true,
            name: true,
            is_enabled: true,
            isDeleted: true,
            environment: true,
            rules: true,
            rollout: true,
            createdAt: true,
            updatedAt: true,
            routes: {
                select: {
                    id: true,
                    method: true,
                    path: true
                }
            }
        },
    })

    if(!findFlagDetails) {
        return {
            errorCode: 404,
            success: false,
            message: "The given flag Id doesnt exist with our services",
        }
    }

    return {
        errorCode: 200,
        success: true,
        message: "All the flags were successfully fetched",
        data: findFlagDetails
    }
}