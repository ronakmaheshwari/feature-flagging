import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { addContentControlller, getContentCount, deleteContentController, editContentControlller, getAllContentController } from "../controller/contentController";

const contentRouter: Router = Router();

contentRouter.get("/", userMiddleware, getAllContentController);
contentRouter.get("/count", userMiddleware, getContentCount);
contentRouter.post("/submit", userMiddleware, addContentControlller);
contentRouter.put("/edit/:contentId", userMiddleware, editContentControlller);
contentRouter.delete("/:contentId", userMiddleware, deleteContentController);

export default contentRouter;