import type { Request, Response, NextFunction } from "express";
import { addRouterValidation, deleteRouterValidation } from "../validation/routerFlagValidation";
import { addNewRouterService } from "../services/router-flag/addNewRouterService";
import { changeRouteFlag } from "../services/router-flag/changeRouteFlagService";
import { deletRouterService } from "../services/router-flag/deleteRouterService";

export const addNewRouterController = async (
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

        const parsed = addRouterValidation.safeParse(req.body);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {method, path, flagName} = parsed.data;
        const {errorCode, success, message} = await addNewRouterService({method, path, flagName});
        
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


export const changeRouterFlagController = async (
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

        const parsed = addRouterValidation.safeParse(req.body);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {method, path, flagName} = parsed.data;
        const {errorCode, success, message} = await changeRouteFlag({method, path, flagName});
        
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

export const deleteRouterFlagController = async (
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

        const parsed = deleteRouterValidation.safeParse(req.query);
        if(!parsed.success) {
            return res.status(409).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {method, path} = parsed.data;
        const {errorCode, success, message} = await deletRouterService({method, path});
        
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