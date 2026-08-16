import type { ROLES } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import type { JwtPayload, SignOptions } from "jsonwebtoken"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? "Pass@123"
const JWT_EXPIRE = process.env.JWT_EXPIRE ?? "1d"

if(!JWT_SECRET || !JWT_EXPIRE) {
    throw new Error("You must provide JWT_SECRET or JWT_EXPIRE")
}

const jwtTokenGenerator = (userId: string, role: ROLES) => {
    return jwt.sign({userId: userId, role: role}, JWT_SECRET ,{
        expiresIn: JWT_EXPIRE as SignOptions["expiresIn"]
    })
}

const jwtTokenVerifier = (token: string): {userId: string; role: ROLES} | boolean => {
    let decoded: JwtPayload;

    try {
        decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        return false
    }

    return {userId: decoded.userId, role: decoded.role}
}

export {jwtTokenGenerator, jwtTokenVerifier}