import db from "../../utils/db/db"

export const addNewGroupService = async (
    userId: string,
    name: string,
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
            name: name,
            userId: userId,
            total_users: 0
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "The group was successfully added"
    }
}