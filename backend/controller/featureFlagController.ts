import type { Request, Response, NextFunction } from "express";
import { getFlagService } from "../services/feature-flag/getFlags";
import { getFlagNames } from "../services/feature-flag/getAllFlags";
import { evaluateUserFlagValidation, toggleFlagValidation, flagValidation } from "../validation/featureFlagValidation";
import { toggleFlagService } from "../services/feature-flag/toggleFlagService";
import { evaluateUserFlag } from "../services/feature-flag/evaluateUserFlag";
import { deleteFlagService } from "../services/feature-flag/deleteFlag";

export const getAllFlagsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const role = req.role;
        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }
        const {errorCode, success, message, data} = await getFlagService();
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

export const getFlagFilterController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }
        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }
        const {all} = req.query;
        const isAll = all === "true";
        const {errorCode, success, message, data} = await getFlagNames(userId, isAll);
        return res.status(errorCode).json({
            success: success,
            message: message,
            data: data
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

export const toggleFlagController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }
        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }

        const parsed = toggleFlagValidation.safeParse(req.query);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }
        const {flagId, isEnabled} = parsed.data;
        const {errorCode, success, message} = await toggleFlagService(userId, flagId, isEnabled);
        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

export const evaluateUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = req.userId;
        const role = req.role;
        if(!adminId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }

        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }

        const parsed = evaluateUserFlagValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }
        const {flagId, userId} = parsed.data;
        const {errorCode, success, message} = await evaluateUserFlag(flagId, userId);
        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

export const deleteFlagController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }

        if(role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Only admin can access these services"
            })
        }

        const parsed = flagValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }
        const {flagId} = parsed.data;
        const {errorCode, success, message} = await deleteFlagService(flagId, userId);
        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}