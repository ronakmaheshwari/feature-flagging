import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { getAllContentController } from "../controller/contentController";

const contentRouter: Router = Router();

contentRouter.get("/", userMiddleware, getAllContentController);
contentRouter.post("/submit", userMiddleware, );
contentRouter.delete("/", userMiddleware, );

export default contentRouter;