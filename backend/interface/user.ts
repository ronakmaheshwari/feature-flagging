import type { ROLES } from "@prisma/client"

export interface SignupInterface {
    success: boolean,
    message: string,
    user?: string
}

export interface UserDataInterface {
    id: string,
    username: string,
    role: ROLES,
    email: string,
    createdAt: Date,
    userStatus: string,
    groups: Array<{
        name: string
    }>
}