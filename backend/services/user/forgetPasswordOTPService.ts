import db from "../../utils/db/db"
import sendEmailOtp from "../../utils/email/emailConfig";
import { AlphabeticOtpGenerator } from "../../utils/email/otpGenerator";

const forgetPasswordOTPService = async (
    email: string
) => {
    const findEmail = await db.user.findUnique({
        where: {
            email: email as string
        }
    })

    if(!findEmail) {
        return {
            errorCode: 404,
            success: false,
            message: `The given email ${email} doesn't exist in our system`,
        };
    }

    if(findEmail.user_status !== "ACTIVE") {
        return {
            errorCode: 409,
            success: false,
            message: `The given email ${email} is not active`,
        };
    }

    const token = AlphabeticOtpGenerator(6)
    const expire_time = new Date(Date.now() + 60 * 60 * 2 * 1000);
    const updateUser = await db.user.update({
        where: {
            id: findEmail.id as string
        },
        data: {
            resetPasswordToken: token,
            resetPasswordOtpExpire: expire_time
        }
    })

    await sendEmailOtp({email: findEmail.email, expire_time: expire_time.toString(), otp: updateUser.resetPasswordToken as string, reason: "forget-password"})

    return {
        errorCode: 200,
        success: true,
        message: `The given email ${email} will receive an email otp link`,
        token: token
    }
}

export default forgetPasswordOTPService;