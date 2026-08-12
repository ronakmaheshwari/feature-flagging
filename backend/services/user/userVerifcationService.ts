import type { Prisma } from "@prisma/client";
import db from "../../utils/db/db";
import { jwtTokenGenerator } from "../../utils/jwtToken/token";

const userVerificationService = async (
    email: string,
    otp: string
) => {
    const result = await db.$transaction(
        async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.findUnique({
                where: {
                    email,
                },
            });

            if (!user) {
                return {
                    errorCode: 404,
                    success: false,
                    message: `The given email ${email} doesn't exist in our system`,
                };
            }

            if (user.user_status === "DELETED") {
                return {
                    errorCode: 404,
                    success: false,
                    message: `The given email ${email} doesn't exist in our system`,
                };
            }

            if (user.user_status !== "UNVERIFIED") {
                return {
                    errorCode: 409,
                    success: false,
                    message: `The given user is already active`,
                };
            }

            const userOtp = await tx.otp.findUnique({
                where: {
                    userId: user.id,
                },
            });

            if (!userOtp) {
                return {
                    errorCode: 404,
                    success: false,
                    message: `The OTP is expired or does not exist`,
                };
            }

            if (userOtp.type !== "VERIFICATION") {
                return {
                    errorCode: 409,
                    success: false,
                    message: `The OTP provided is invalid`,
                };
            }

            if (userOtp.isUsed) {
                return {
                    errorCode: 409,
                    success: false,
                    message: `The OTP provided is already used`,
                };
            }

            if (userOtp.otp !== otp) {
                return {
                    errorCode: 409,
                    success: false,
                    message: `The OTP provided was invalid`,
                };
            }

            if (userOtp.otpExpireTime <= new Date()) {
                return {
                    errorCode: 409,
                    success: false,
                    message: `The OTP provided is expired`,
                };
            }

            await tx.otp.update({
                where: {
                    id: userOtp.id,
                },
                data: {
                    isUsed: true,
                },
            });

            await tx.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    user_status: "ACTIVE",
                },
            });

            const token = jwtTokenGenerator(user.id);

            await tx.jWT_Token.upsert({
                where: {
                    userId: user.id,
                },
                update: {
                    token,
                    tokenExpire: new Date(
                        Date.now() + 60 * 60 * 24 * 1000
                    ),
                },
                create: {
                    userId: user.id,
                    token,
                    tokenExpire: new Date(
                        Date.now() + 60 * 60 * 24 * 1000
                    ),
                },
            });

            return {
                errorCode: 200,
                success: true,
                message: "The OTP was successfully verified",
                token,
            };
        }
    );

    return result;
};

export default userVerificationService;