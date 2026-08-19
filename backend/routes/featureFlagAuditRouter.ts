import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { getFlagAuditController } from "../controller/featureFlagAuditController";

const featureFlagAuditRouter: Router = Router();

featureFlagAuditRouter.get("/:contentId", userMiddleware, getFlagAuditController);

export default featureFlagAuditRouter;