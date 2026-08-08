import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import type { JwtPayload, SignOptions } from "jsonwebtoken"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? "Pass@123"
const JWT_EXPIRE = process.env.JWT_EXPIRE ?? "1d"

if(!JWT_SECRET || !JWT_EXPIRE) {
    throw new Error("You must provide JWT_SECRET or JWT_EXPIRE")
}

const jwtTokenGenerator = (userId: string) => {
    return jwt.sign({userId: userId}, JWT_SECRET ,{
        expiresIn: JWT_EXPIRE as SignOptions["expiresIn"]
    })
}

const jwtTokenVerifier = (token: string): string | Boolean => {
    let decoded: JwtPayload;

    try {
        decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        return false
    }

    return decoded.userId
}

export {jwtTokenGenerator, jwtTokenVerifier}