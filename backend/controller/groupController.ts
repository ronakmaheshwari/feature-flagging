import type { Request, Response, NextFunction } from "express";
import { groupSearchValidation, groupFilterValidation } from "../validation/groupValidation";
import { getAllGroupService } from "../services/group/getAllGroup";

export const getAllGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services",
            });
        }

        if (role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "You are unauthorized to access these services",
            });
        }

        const parsedSearch = groupSearchValidation.safeParse(req.query);
        if (!parsedSearch.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid search parameters",
            });
        }

        const parsedFilter = groupFilterValidation.safeParse(req.query);
        if (!parsedFilter.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid filter parameters",
            });
        }

        const groups = await getAllGroupService(parsedSearch.data, parsedFilter.data);

        return res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};