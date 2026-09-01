import type { UserDataInterface } from "../../interface/user"
import db from "../../utils/db/db"

const userDataService = async (userId: string): Promise<boolean | UserDataInterface> => {
    const getData = await db.user.findUnique({
        where: {
            id: userId as string
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            user_status: true,
            group: {
                where: {
                    userId: userId as string
                },
                select: {
                    name: true
                }
            }
        },
    })

    if(!getData) {
        return false
    }

    return {
        id: getData.id,
        username: getData.username,
        role: getData.role,
        email: getData.email,
        createdAt: new Date(getData.createdAt),
        userStatus: getData.user_status,
        groups: getData.group.map(g => ({ name: g.name }))
    }
}

export default userDataService