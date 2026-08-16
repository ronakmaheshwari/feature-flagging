import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { addContentControlller, deleteContentController, getAllContentController } from "../controller/contentController";

const contentRouter: Router = Router();

contentRouter.get("/", userMiddleware, getAllContentController);
contentRouter.post("/submit", userMiddleware, addContentControlller);
contentRouter.delete("/:contentId", userMiddleware, deleteContentController);

export default contentRouter;