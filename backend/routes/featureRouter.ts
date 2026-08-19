import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { addblacklistFlagController, addGroupFlagController, addNewFlagController, addWhitelistFlagController, changeFlagRulesController, deleteFlagController, evaluateUserController, getAllFlagsController, getFlagDetailsController, getFlagFilterController, toggleFlagController } from "../controller/featureFlagController";

const featureFlagRouter: Router = Router();

featureFlagRouter.get("/", userMiddleware, getAllFlagsController);
featureFlagRouter.get("/filter", userMiddleware, getFlagFilterController);
featureFlagRouter.get("/details/:flagId", userMiddleware, getFlagDetailsController);

featureFlagRouter.post("/new", userMiddleware, addNewFlagController);

featureFlagRouter.patch("/toggle", userMiddleware, toggleFlagController);
featureFlagRouter.patch("/evaluate/:flagId/:userId", userMiddleware, evaluateUserController);
featureFlagRouter.patch("/whitelist/:flagId/:userId", userMiddleware, addWhitelistFlagController);
featureFlagRouter.patch("/blacklist/:flagId/:userId", userMiddleware, addblacklistFlagController);
featureFlagRouter.patch("/group/:flagId/:groupId", userMiddleware, addGroupFlagController);
featureFlagRouter.patch("/change/:flagId", userMiddleware, changeFlagRulesController);

featureFlagRouter.delete("/:flagId", userMiddleware, deleteFlagController);

export default featureFlagRouter;