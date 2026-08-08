import { Router } from "express";

const userRouter: Router = Router()

userRouter.post("/signup");
userRouter.post("login");

export default userRouter;