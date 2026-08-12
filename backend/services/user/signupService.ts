import type { Prisma } from "@prisma/client"
import db from "../../utils/db/db"
import { hashPassword } from "../../utils/passwordHash/passwordHash"
import type { SignupInterface } from "../../interface/user"

const userSignupService = async (username: string, email: string, password: string): Promise<string | SignupInterface> => {
    try {
        const checkEmail = await db.user.findUnique({
            where: {
                email: email as string
            }
        })

        if(checkEmail) {
            return {
                success: false,
                message: `The given ${email} already exist with our system`
            }
        }

        const hashedPassword = await hashPassword(password);
        

        const addUser = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    username: username as string,
                    email: email as string,
                    password: hashedPassword,
                    user_status: "UNVERIFIED"
                }
            });

            return user;
        })
        return {
            success: true,
            message: "User was successfully created",
        }
    } catch (error) {
        return error instanceof Error ? error.message : "An unexpected error occurred"
    }
}

export default userSignupService;