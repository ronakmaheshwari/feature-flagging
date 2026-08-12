import dotenv from "dotenv"
import nodemailer, { type Transporter } from "nodemailer"
import forgetPasswordEmailTemplate from "./templates/forgot-password"
import otpEmailTemplate from "./templates/otp-verification"

dotenv.config()

const fromAddress = process.env.EMAIL_FROM //"GateKeep <no-reply@gatekeep.com>"
if (!fromAddress) {
    throw new Error("You must provide EMAIL_FROM as a full sender address")
}

type ReasonType = "forget-password" | "signup"

interface OtpInterface {
    email: string
    otp: number | string
    expire_time: string | number
    reason?: ReasonType
}

let transporter: Transporter

const getTransporter = () => {
    if (transporter) return transporter

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })

    return transporter
}

const sendEmailOtp = async (data: OtpInterface): Promise<void> => {
    const isForgetPassword = data.reason === "forget-password"

    const html = isForgetPassword
        ? forgetPasswordEmailTemplate("GateKeep", data.email, data.expire_time.toString(), data.otp.toString())
        : otpEmailTemplate("GateKeep", data.email, data.expire_time.toString(), data.otp.toString())

    const subject = isForgetPassword ? "Reset Your Password – OTP Code" : "Your OTP Code has arrived"

    const message = {
        from: fromAddress,
        to: data.email,
        subject,
        html,
    }

    try {
        const info = await getTransporter().sendMail(message)
        console.log("Message sent:", info.messageId)
    } catch (error) {
        console.error("Failed to send OTP email:", error)
        throw error
    }
}

export default sendEmailOtp