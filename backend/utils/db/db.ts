import { Prisma, PrismaClient, ROLES, USER_STATUS, STATUS_TYPE, ENVIRONMENT_TYPE, OTP_TYPE } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined
}

const db = global.prisma ?? new PrismaClient()
if(process.env.NODE_ENV !== "production") global.prisma = db

export {ROLES, USER_STATUS, STATUS_TYPE, ENVIRONMENT_TYPE, OTP_TYPE};

export default db;