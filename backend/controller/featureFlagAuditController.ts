import type {Request, Response, NextFunction } from "express";
import { getFlagAuditService } from "../services/feature-flag-audit/getFlagAudit";

export const getFlagAuditController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role;
        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }
        const {flagId} = req.params;
        if(!flagId) {
            return res.status(401).json({
                success: false,
                message: "Please provide the flagId"
            })
        }

        const {errorCode, success, message, data} = await getFlagAuditService(flagId as string);
        return res.status(errorCode).json({
            success: success,
            message: message,
            data
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}