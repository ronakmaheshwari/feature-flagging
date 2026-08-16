import db from "../../utils/db/db"

export const addNewGroupService = async (
    userId: string,
    name: string,
    totalUser: number
) => {
    const findGroup = await db.group.findUnique({
        where: {
            name: name
        }
    })

    if(findGroup) {
        return {
            errorCode: 400,
            success: false,
            message: "The group name already exist"
        }
    }

    const addGroup = await db.group.create({
        data: {
            total_users: totalUser,
            name: name,
            userId: userId
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "The group was successfully added"
    }
}