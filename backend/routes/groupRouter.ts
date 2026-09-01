import { Router } from "express";
import userMiddleware from "../utils/middleware/middleware";
import { addNewGroupController, addUserToGroupController, changeNameController, getAllGroup, removeUserFromGroupController, deleteGroupController } from "../controller/groupController";

const groupRouter: Router = Router();

groupRouter.get("/", userMiddleware, getAllGroup);
groupRouter.post("/create", userMiddleware, addNewGroupController);
groupRouter.patch("/add/:groupId", userMiddleware, addUserToGroupController);
groupRouter.patch("/change/:groupId", userMiddleware, changeNameController);
groupRouter.patch("/remove/:groupId", userMiddleware, removeUserFromGroupController);
groupRouter.delete("/:groupId", userMiddleware, deleteGroupController);

export default groupRouter;