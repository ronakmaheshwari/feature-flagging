import { CACHE_KEY, OTP_EXPIRE_MINUTES, redisCache, TTL_TIME } from "../../utils/cache/cache"
import db from "../../utils/db/db"
import sendEmailOtp from "../../utils/email/emailConfig"
import { AlphaNumbericOtpGenerator } from "../../utils/email/otpGenerator"

const otpVerificationService = async (
    email: string
) => {
    const findEmail = await db.user.findUnique({
        where: { 
            email: email
        }
    })

    if(!findEmail) {
        return {
            errorCode: 404,
            success: false,
            message: `The given email ${email} doesnt exist with our system`
        }
    }

    const otp = AlphaNumbericOtpGenerator(6);
    const expire_time = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000)

    const storeOtp = await db.otp.upsert({
        where: {
            userId: findEmail.id as string
        },
        update: {
            otp: otp as string,
            otpExpireTime: expire_time
        },
        create: {
            userId: findEmail.id as string,
            otp: otp as string,
            otpExpireTime: expire_time
        }
    })

    const otpCache = await redisCache.set(CACHE_KEY(findEmail.email, findEmail.id), JSON.stringify({
        email: findEmail.email,
        otp: storeOtp.otp,
        expire_time: storeOtp.otpExpireTime,
        type: storeOtp.type,
        userId: storeOtp.userId,
        id: storeOtp.id,
        createdAt: storeOtp.createdAt
    }),{expiration: {type: "EX", value: TTL_TIME}})

    await sendEmailOtp({email: findEmail.email, otp: storeOtp.otp as string, expire_time: storeOtp.otpExpireTime.toString()});

    return {
        errorCode: 200,
        success: true,
        message: `An otp was successfully patched for ${email}`
    }
}

export default otpVerificationService;