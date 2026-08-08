import type {Request, Response, NextFunction } from "express";
import { userLoginValidation, userSignupValidation } from "../validation/userValidation";
import userSignupService from "../services/user/signupService";
import userLoginService from "../services/user/loginService";
import db from "../utils/db/db";
import userDataService from "../services/user/getUserDataService";

export const userSignupController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = userSignupValidation.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({          
                success: false,
                message: parsed.error.flatten()  
            });
        }

        const { username, email, password } = parsed.data;
        const addUser = await userSignupService(username, email, password);

        if (typeof addUser === "string") {       
            return res.status(500).json({ success: false, message: addUser });
        }
        if (!addUser.success) {                       
            return res.status(409).json(addUser);     
        }

        return res.status(201).json(addUser);          
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal error took place"
        });
    }
};

export const userLoginController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = userLoginValidation.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.flatten()
            });
        }

        const { email, password } = parsed.data;
        const loginUser = await userLoginService(email, password);

        if (typeof loginUser === "string") {
            return res.status(500).json({ success: false, message: loginUser });
        }
        if (!loginUser.success) {
            return res.status(401).json(loginUser);     
        }

        return res.status(200).json(loginUser);         
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal error took place"
        });
    }
};

export const userDetailsController = async (
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

        const getUserData = await userDataService(userId);
        if(getUserData === false) {
            return res.status(401).json({
                success: false,
                message: "Invalid user id was provided"
            })
        }

        return res.status(200).json(getUserData)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal error took place"
        });
    }
}