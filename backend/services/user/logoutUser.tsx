import db from "../../utils/db/db"

const logoutUserService = async (userId: string) => {
    const findUser = await db.jWT_Token.findUnique({
        where: {
            userId: userId as string
        }
    });

    if(!findUser) {
        return {
            errorCode: 404,
            success: false,
            message: "The given user was not found"
        }
    }

    const updateJwt = await db.jWT_Token.update({
        where: {
            userId: userId as string
        },
        data: {
            token: "",
            tokenExpire: ""
        }
    });

     return {
        errorCode: 200,
        success: true,
        message: "The given user jwt was revoked successfully"
    }
}

export default logoutUserService