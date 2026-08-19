import { PrismaClient, ROLES, USER_STATUS, STATUS_TYPE, ENVIRONMENT_TYPE, OTP_TYPE, Method } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const db = global.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") global.prisma = db;

export { ROLES, USER_STATUS, STATUS_TYPE, ENVIRONMENT_TYPE, OTP_TYPE, Method };

export default db;