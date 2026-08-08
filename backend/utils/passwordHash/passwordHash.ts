import dotenv from "dotenv";
import bcrypt from "bcrypt"
dotenv.config()

const SALT_ROUND = process.env.SALT_ROUND ?? 10

if(!SALT_ROUND) {
    throw new Error("No salt round was provided")
}

const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashPassword = await bcrypt.hash(password, SALT_ROUND);
        return hashPassword
    } catch (error) {
        console.log(error);
        throw error
    }
}

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const checkPassword = await bcrypt.compare(password, hash);
    return checkPassword
}

export {hashPassword, verifyPassword}