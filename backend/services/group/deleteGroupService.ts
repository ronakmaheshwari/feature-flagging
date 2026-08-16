import db from "../../utils/db/db"

export const deleteGroupService = async (
    groupId: string
) => {
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

    const updateGroup = await db.group.update({
        where: {
            id: groupId as string,
        },
        data: {
            isDeleted: true
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "The group was successfully deleted"
    }
}