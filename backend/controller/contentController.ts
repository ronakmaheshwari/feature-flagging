import type {Request, Response, NextFunction } from "express";
import { getContentQueryValidation, postContentValidation } from "../validation/contentValidation";
import { getAllContentService } from "../services/content/getAllContentService";

export const getAllContentController = async (
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

        let query = {};
        const parsedQuery = getContentQueryValidation.safeParse(req.query);
        if (!parsedQuery.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters"
            });
        }

        const { content, platform, status, isDeleted } = parsedQuery.data;

        query = {
            content, 
            platform, 
            status, 
            isDeleted
        }
        
        const {errorCode, success, message, data} = await getAllContentService(userId, query);

        return res.status(errorCode).json({
            success,
            message,
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

export const addContentControlller = async (
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

        const parsed = postContentValidation.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            })
        }

        const {content, platform, status} = parsed.data;

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}