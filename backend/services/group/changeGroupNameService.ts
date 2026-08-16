import db from "../../utils/db/db"

export const changeGroupNameService = async (
    userId: string,
    newName: string,
    groupId: string,
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

    const findName = await db.group.findUnique({
        where: {
            name: newName
        }
    })

    if(findName) {
        return {
            errorCode: 409,
            success: false,
            message: "The group name already exists"
        }
    }

    const updateGroupName = await db.group.update({
        where: {
            id: groupId as string
        },
        data: {
            name: newName
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "The group name was changed"
    }
}