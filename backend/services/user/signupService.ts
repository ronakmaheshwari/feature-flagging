import type { Prisma, ROLES } from "@prisma/client"
import db from "../../utils/db/db"
import { hashPassword } from "../../utils/passwordHash/passwordHash"
import type { SignupInterface } from "../../interface/user"

const userSignupService = async (username: string, email: string, password: string, role: ROLES): Promise<string | SignupInterface> => {
    try {
        const checkEmail = await db.user.findUnique({
            where: {
                email: email as string
            }
        })

        if(checkEmail && (checkEmail.user_status !== "ACTIVE" && checkEmail.user_status !== "DELETED" && checkEmail.user_status !== "LOCKED" )) {
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
                    user_status: "UNVERIFIED",
                    role: role
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