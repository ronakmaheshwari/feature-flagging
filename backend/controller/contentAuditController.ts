import type {Request, Response,  NextFunction } from "express";
import { deleteContentValidation } from "../validation/contentValidation";
import { getContentAuditLogService } from "../services/contentAudit/getContentAuditLog";

export const getContentAuditController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }

        const parsed = await deleteContentValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data was provided",
                error: parsed.error.flatten()
            })
        }

        const {contentId} = parsed.data;
        const {errorCode, success, message, data} = await getContentAuditLogService(userId, contentId);
        return res.status(errorCode).json({
            success,
            message,
            data
        })
    } catch (error) {
        console.error(error) 
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}