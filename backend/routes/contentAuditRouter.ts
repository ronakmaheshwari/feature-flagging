import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { getContentAuditController } from "../controller/contentAuditController";

const contentAuditRouter: Router = Router();

contentAuditRouter.get("/:contentId", userMiddleware, getContentAuditController);

export default contentAuditRouter;