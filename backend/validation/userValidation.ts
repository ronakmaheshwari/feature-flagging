import { ROLES } from "@prisma/client";
import z, { email } from "zod";

export const userSignupValidation = z.object({
    username: z.string().trim().min(2, {
        error: "Your Username must atleast be more than 2 characters"
    }).max(30, {
        error: "Your Username must be less than 30 characters"
    }),
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format."}).trim(),
    password: z.string().trim().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    {
        error: "Your password must be strong"
    }).min(8, "Your password must have atleast 8 characters"),
    role: z.enum(ROLES, {error: "Only allowed roles are User, Admin"}),
}).strict();

export const userLoginValidation = z.object({
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format." }),
    password: z.string().trim().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    {
        error: "Your password must be strong"
    }).min(8, "Your password must have atleast 8 characters"),
})

export const otpVerificationValidation = z.object({
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format."}).trim(),
})

export const otpCodeVerificationValidation = z.object({
    email: z.email({pattern: z.regexes.rfc5322Email, error: "Invalid email address format."}).trim(),
    otp: z.string({error: "Invalid OTP format was provided"}).trim()
})

export const linkVerificationValidation = z.object({
    link: z.string({error: "Invalid link datatype was provided"})
})

export const forgetPasswordOTPVerificationValidation = z.object({
    newPassword: z.string().trim().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/, {
        error: "Your password must be strong"
    }).min(8, "Your password must have atleast 8 characters")
})

export const searchUserNameValidation = z.string({error: "Invalid data was provided"}).optional();

export type userSignupValidationType = z.infer<typeof userSignupValidation>;
export type userLoginValidationType = z.infer<typeof userLoginValidation>;
export type otpVerificationType = z.infer<typeof otpVerificationValidation>;
export type otpCodeVerificationType = z.infer<typeof otpCodeVerificationValidation>;
export type linkVerificationValidationType = z.infer<typeof linkVerificationValidation>;
export type forgetPasswordOTPVerificationValidationType = z.infer<typeof forgetPasswordOTPVerificationValidation>;
export type searchUserNameValidationType = z.infer<typeof searchUserNameValidation>;