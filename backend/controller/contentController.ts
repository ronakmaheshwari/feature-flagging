import type {Request, Response, NextFunction } from "express";
import { deleteContentValidation, getContentQueryValidation, postContentValidation } from "../validation/contentValidation";
import { getAllContentService } from "../services/content/getAllContentService";
import { postContentService } from "../services/content/postContentService";
import { deleteContentService } from "../services/content/deleteContentService";
import { editContentService } from "../services/content/editContentService";
import { getContentCountService } from "../services/content/getContentCountService";

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

        const parsedQuery = getContentQueryValidation.safeParse(req.query);
        if (!parsedQuery.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters"
            });
        }

        const { content, platform, status, isDeleted, skip, limit, page } = parsedQuery.data;

        const query: {
            content?: string;
            platform?: string;
            status?: "DRAFT" | "POSTED" | "DELETED";
            isDeleted?: boolean;
            skip?: number;
            limit?: string;
            page?: string;
        } = {
            content,
            platform,
            status,
            isDeleted,
            skip,
            limit,
            page
        };
        
        const {errorCode, success, message, data, pagination} = await getAllContentService(userId, query);

        return res.status(errorCode).json({
            success,
            message,
            data,
            pagination
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

export const getContentCount = async (
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
        
        const {errorCode, success, message, data} = await getContentCountService(userId);

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

        const {topic, content, platform, status} = parsed.data;

        const {success, errorCode, message, data} = await postContentService(userId, {topic, content, platform, status });

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

export const editContentControlller = async (
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
        
        const parsedId = deleteContentValidation.safeParse(req.params);
        if(!parsedId.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedId.error.flatten()
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
        
        const {contentId} = parsedId.data;
        const {topic, content, platform, status} = parsed.data;

        const {success, errorCode, message, data} = await editContentService(userId, contentId ,{topic, content, platform, status });

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

export const deleteContentController = async (
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

        const parsed = deleteContentValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data was provided",
                error: parsed.error.flatten()
            })
        }

        const {contentId} = parsed.data;

        const {errorCode, success, message} = await deleteContentService(userId, contentId);
        return res.status(errorCode).json({
            success,
            message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}