import type {Request, Response, NextFunction } from "express";
import { forgetPasswordOTPVerificationValidation, linkVerificationValidation, otpCodeVerificationValidation, otpVerificationValidation, userLoginValidation, userSignupValidation } from "../validation/userValidation";
import userSignupService from "../services/user/signupService";
import userLoginService from "../services/user/loginService";
import userDataService from "../services/user/getUserDataService";
import otpVerificationService from "../services/user/otpVerificationService";
import userVerificationService from "../services/user/userVerifcationService";
import forgetPasswordOTPService from "../services/user/forgetPasswordOTPService";
import forgetPasswordService from "../services/user/forgetPasswordService";
import logoutUserService from "../services/user/logoutUser";

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

        const { username, email, password, role } = parsed.data;
        const addUser = await userSignupService(username, email, password, role);

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

export const otpVerificationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = otpVerificationValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.flatten()
            });
        }
        const {email} = parsed.data
        const {errorCode, success, message} = await otpVerificationService(email);

        return res.status(errorCode).json({
            success: success,
            message: message
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal error occured`
        })
    }
}

export const userVerificationController = async (
    req: Request, 
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = otpCodeVerificationValidation.safeParse(req.query);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.flatten()
            })
        }

        const {email, otp} = parsed.data;

        const {errorCode, success, message, token} = await userVerificationService(email, otp);

        return res.status(errorCode).json({
            success: success,
            message: message,
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal error occured`
        })
    }
}

export const forgetPasswordOTPController = async (
    req: Request, 
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = otpVerificationValidation.safeParse(req.params)
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.flatten()
            }) 
        }

        const {email} = parsed.data;
        const {errorCode, success, message} = await forgetPasswordOTPService(email);
        return res.status(errorCode).json({
            success: success,
            message: message,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal error occured`
        })
    }
}

export const forgetPasswordController = async (
    req: Request, 
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = linkVerificationValidation.safeParse(req.params);
        if(!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.flatten()
            }) 
        }

        const {link} = parsed.data;
        const otpParsed = forgetPasswordOTPVerificationValidation.safeParse(req.body);
        if(!otpParsed.success) {
            return res.status(400).json({
                success: false,
                message: otpParsed.error.flatten()
            }) 
        }

        const {newPassword} = otpParsed.data;

        const {errorCode, success, message} = await forgetPasswordService(link, newPassword);
        return res.status(errorCode).json({
            success: success,
            message: message,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal error occured`
        })
    }
}

export const logoutUser = async (
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

        const {errorCode, success, message} = await logoutUserService(userId);
        
        return res.status(errorCode).json({
            success,
            message
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal error took place"
        });
    }
}