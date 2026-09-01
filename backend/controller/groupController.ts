import type { Request, Response, NextFunction } from "express";
import { groupSearchValidation, groupFilterValidation, newGroupValidation, groupIdValidation, addUserToGroupValidation } from "../validation/groupValidation";
import { getAllGroupService } from "../services/group/getAllGroup";
import { addNewGroupService } from "../services/group/addNewGroupService";
import { addUserGroupService } from "../services/group/addUsertoGroupService";
import { changeGroupNameService } from "../services/group/changeGroupNameService";
import { removeUserFromGroupService } from "../services/group/removeUserFromGroupService";
import { deleteGroupService } from "../services/group/deleteGroupService";
import type { ROLES } from "@prisma/client";

export const getAllGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const role = req.role as ROLES;

        if (!userId) {
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

        const groups = await getAllGroupService(userId, role, parsedSearch.data, parsedFilter.data);

        return res.status(groups.errorCode).json({
            success: groups.success,
            message: groups.message,
            data: groups.data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
};

export const addNewGroupController = async (
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

        const parsed = newGroupValidation.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            });
        }

        const {name} = parsed.data
        const {errorCode, success, message} = await addNewGroupService(userId, name);

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

export const addUserToGroupController = async (
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

        const parsedGroupId = groupIdValidation.safeParse(req.params)
        if(!parsedGroupId.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedGroupId.error.flatten()
            });
        }

        const parsedQuery = addUserToGroupValidation.safeParse(req.query);
        if(!parsedQuery.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedQuery.error.flatten()
            });
        }

        const {email} = parsedQuery.data

        const {errorCode, success, message} = await addUserGroupService(email, parsedGroupId.data.groupId)
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

export const changeNameController = async (
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

        const parsedGroupId = groupIdValidation.safeParse(req.params)
        if(!parsedGroupId.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedGroupId.error.flatten()
            });
        }

        const parsed = newGroupValidation.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsed.error.flatten()
            });
        }

        const {name} = parsed.data

        const {errorCode, success, message} = await changeGroupNameService(name, parsedGroupId.data.groupId)
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

export const removeUserFromGroupController = async (
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

        const parsedGroupId = groupIdValidation.safeParse(req.params)
        if(!parsedGroupId.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedGroupId.error.flatten()
            });
        }

        const parsedQuery = addUserToGroupValidation.safeParse(req.query);
        if(!parsedQuery.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedQuery.error.flatten()
            });
        }

        const {email} = parsedQuery.data

        const {errorCode, success, message} = await removeUserFromGroupService(email, parsedGroupId.data.groupId);
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

export const deleteGroupController = async (
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

        const parsedGroupId = groupIdValidation.safeParse(req.params)
        if(!parsedGroupId.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data format was provided",
                error: parsedGroupId.error.flatten()
            });
        }

        const {errorCode, success, message} = await deleteGroupService(parsedGroupId.data.groupId);
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