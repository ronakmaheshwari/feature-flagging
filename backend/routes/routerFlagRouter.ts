import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { addNewRouterController, changeRouterFlagController, deleteRouterFlagController } from "../controller/routeFlagController";

const routerFlagRouter: Router = Router();

routerFlagRouter.post("/add", userMiddleware, addNewRouterController);
routerFlagRouter.post("/change", userMiddleware, changeRouterFlagController);
routerFlagRouter.delete("/remove", userMiddleware, deleteRouterFlagController);

export default routerFlagRouter;