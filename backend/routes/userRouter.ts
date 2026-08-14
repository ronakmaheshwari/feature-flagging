import { Router } from "express";
import { forgetPasswordController, forgetPasswordOTPController, otpVerificationController, userDetailsController, userLoginController, userSignupController, userVerificationController } from "../controller/userController";
import userMiddleware from "../utils/middleware/middleware";

const userRouter: Router = Router();

userRouter.get("/data", userMiddleware, userDetailsController); 
userRouter.post("/signup", userSignupController);
userRouter.post("/login", userLoginController);
userRouter.patch("/otp-verification", userVerificationController); //Query = {otp, email} Gives = {token} <- Main stuff for me
userRouter.patch("/forget-password/:email", forgetPasswordOTPController); // Param = {email}
userRouter.patch("/forget-password/:link", forgetPasswordController); // Param = {link} body = {newPassword}
userRouter.patch("/:email", otpVerificationController); // Param = {email}

export default userRouter;