import { Router } from "express";
import { forgetPasswordController, forgetPasswordOTPController, logoutUser, otpVerificationController, userDetailsController, userLoginController, userSignupController, userVerificationController } from "../controller/userController";
import userMiddleware from "../utils/middleware/middleware";
import { otpLimiter } from "../utils/ratelimit/ratelimitConfig";

const userRouter: Router = Router();

userRouter.get("/me", userMiddleware, userDetailsController); 
userRouter.post("/signup", userSignupController);
userRouter.post("/login", userLoginController);
userRouter.patch("/logout", userMiddleware, logoutUser); 
userRouter.patch("/otp-verification", userVerificationController); //Query = {otp, email} Gives = {token} <- Main stuff for me
userRouter.patch("/forget-password/:email", forgetPasswordOTPController); // Param = {email}
userRouter.patch("/forget-password/:link", forgetPasswordController); // Param = {link} body = {newPassword}
userRouter.patch("/:email", otpLimiter, otpVerificationController); // Param = {email}

export default userRouter;