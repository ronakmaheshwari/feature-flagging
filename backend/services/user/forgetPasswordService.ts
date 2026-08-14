import { CACHE_KEY, redisCache } from "../../utils/cache/cache"
import db from "../../utils/db/db"
import { hashPassword } from "../../utils/passwordHash/passwordHash"

const forgetPasswordService = async (
    link: string,
    newPassword: string
) => {
    const findUser = await db.user.findUnique({
        where: {
            resetPasswordToken: link
        }
    })

    if(!findUser) {
        return {
            errorCode: 404,
            success: false,
            message: "The given link doesnt exist with our systems"
        }
    }

    if(!findUser.resetPasswordOtpExpire || findUser.resetPasswordOtpExpire.getTime() <= Date.now()) {
        return {
            errorCode: 400,
            success: false,
            message: "The reset password link has expired"
        }
    }

    let userCache: 
        | 
            {
                userId: string,
                email: string,
                resetPasswordToken: string,
                resetPasswordOtpExpire: string
            }
        | null = null

    const otpCache = await redisCache.get(CACHE_KEY(findUser.email, findUser.id))
    if(otpCache) {
        userCache = JSON.parse(otpCache);
    } else {
        userCache = {
            userId: findUser.id,
            email: findUser.email,
            resetPasswordToken: findUser.resetPasswordToken ?? "",
            resetPasswordOtpExpire: findUser.resetPasswordOtpExpire?.toISOString() ?? ""
        }
    }

    const hashedPassword = await hashPassword(newPassword);
    const updateUser = await db.user.update({
        where: {
            id: findUser.id
        },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordOtpExpire: null
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "The password was successfully updated"
    }
}

export default forgetPasswordService