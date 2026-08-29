import type { Request, Response, NextFunction } from "express";
import { getFlagService } from "../services/feature-flag/getFlags";
import { getFlagNames } from "../services/feature-flag/getAllFlags";
import { evaluateUserFlagValidation, toggleFlagValidation, flagValidation, changeRulesValidation, createNewFlagValidation, addGroupValidation } from "../validation/featureFlagValidation";
import { toggleFlagService } from "../services/feature-flag/toggleFlagService";
import { evaluateUserFlag } from "../services/feature-flag/evaluateUserFlag";
import { deleteFlagService } from "../services/feature-flag/deleteFlag";
import { changeFlagRulesService } from "../services/feature-flag/changeFlagRules";
import { addWhitelistService } from "../services/feature-flag/addWhitelists";
import { addBlacklistService } from "../services/feature-flag/addBlacklists";
import { addNewFlagService } from "../services/feature-flag/addNewFlag";
import { addGroupService } from "../services/feature-flag/addGroupToFlag";
import { getFlagDetailsService } from "../services/feature-flag/getFlagDetails";

export const getAllFlagsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const role = req.role;
        const userId = req.userId
        if(!role || !userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services"
            })
        }
        const {errorCode, success, message, data} = await getFlagService(role, userId);
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

export const getFlagDetailsController = async (
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
        };

        const parsed = flagValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {flagId} = parsed.data;
        const {errorCode, success, message, data} = await getFlagDetailsService(flagId);
        
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
        });
    }
}

export const addNewFlagController = async (
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
        const parsed = createNewFlagValidation.safeParse(req.body);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }
        const {name, is_enabled, environment, rules, rollout} = parsed.data;
        const {errorCode, success, message} = await addNewFlagService(userId, name, is_enabled, environment, rules, rollout);
        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        });
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

export const changeFlagRulesController = async (
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

        const flagParsed = flagValidation.safeParse(req.params);
        if(!flagParsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: flagParsed.error.flatten()
            })
        }

        const parsed = changeRulesValidation.safeParse(req.body);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {flagId} = flagParsed.data;
        const {blacklist, whitelist, groups, rollout} = parsed.data;

        const {errorCode, success, message} = await changeFlagRulesService(userId, flagId, {blacklist, whitelist, groups, rollout});
        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        });
    }
}

export const addWhitelistFlagController = async (
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
        const {errorCode, success, message} = await addWhitelistService(adminId, flagId, userId);
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

export const addblacklistFlagController = async (
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
        const {errorCode, success, message} = await addBlacklistService(adminId, flagId, userId);
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

export const addGroupFlagController = async (
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

        const parsed = addGroupValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {flagId, groupId} = parsed.data;
        const {errorCode, success, message} = await addGroupService(adminId, flagId, groupId);
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