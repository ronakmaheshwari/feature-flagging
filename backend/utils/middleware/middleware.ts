import type {Request, Response, NextFunction } from "express";
import { jwtTokenVerifier } from "../jwtToken/token";
import db from "../db/db";

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }
        const token = authHeader.split(" ")[1] as string;
        const decoded = jwtTokenVerifier(token);

        if(decoded === false) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }

        const checkUser = await db.user.findUnique({
            where: {
                id: decoded as string
            }
        })

        if(!checkUser || checkUser.user_status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }

        const storedToken = await db.jWT_Token.findUnique({ where: { userId: checkUser.id } });
        if(!storedToken || storedToken.token !== token) {
            return res.status(401).json({ success: false, message: "Session expired, please log in again" });
        }

        req.userId = decoded as string;
        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export default userMiddleware;