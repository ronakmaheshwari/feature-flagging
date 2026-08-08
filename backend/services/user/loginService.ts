import db from "../../utils/db/db"
import { jwtTokenGenerator } from "../../utils/jwtToken/token"
import { verifyPassword } from "../../utils/passwordHash/passwordHash"

const userLoginService = async (email: string, password: string) => {
    try{
        const checkEmail = await db.user.findUnique({
            where: {
                email: email as string,
                user_status: {
                    not: "DELETED"
                }
            }
        })

        if(!checkEmail) {
            return {
                success: false,
                message: `The given ${email} doesnt exist with our system`
            }
        }

        if(checkEmail.user_status === "UNVERIFIED") {
            return {
                success: false,
                message: `The account is ${checkEmail.user_status}`
            }
        }

        const checkPassword = await verifyPassword(password, checkEmail.password);
        if(!checkPassword) {
            return {
                success: false,
                message: `Invalid password was provided`
            }
        }

        const token = jwtTokenGenerator(checkEmail.id);
        await db.jWT_Token.upsert({
            where: {
                userId: checkEmail.id as string
            },
            update: {
                token: token,
                tokenExpire: new Date(Date.now() * 60 * 60 * 24 * 1000)
            },
            create: {
                userId: checkEmail.id as string,
                token: token,
                tokenExpire: new Date(Date.now() * 60 * 60 * 24 * 1000)
            }
        })

        return {
            success: true,
            message: "You are successfully signed in",
            token: token
        }
    } catch(error) {
        return error instanceof Error ? error.message : "An unexpected error occurred"
    }
}

export default userLoginService;