import { Router } from "express";
import userRouter from "./userRouter";
import contentRouter from "./contentRouter";
import contentAuditRouter from "./contentAuditRouter";
import routerFlagRouter from "./routerFlagRouter";
import featureFlagAuditRouter from "./featureFlagAuditRouter";
import featureFlagRouter from "./featureRouter";
import groupRouter from "./groupRouter";

interface RouterInterface {
    path: string;
    router: Router;
}

const router: Router = Router();

const allRouters: RouterInterface[] = [
    {
        path: "/user",
        router: userRouter
    }, 
    {
        path: "/content",
        router: contentRouter
    },
    {
        path: "/content/audit",
        router: contentAuditRouter
    },
    {
        path: "/router",
        router: routerFlagRouter
    },
    {
        path: "/group",
        router: groupRouter
    },
    {
        path: "/feature",
        router: featureFlagRouter
    },
    {
        path: "/feature/audit",
        router: featureFlagAuditRouter
    },
]

allRouters.forEach((x) => {
    router.use(x.path, x.router);
})

export default router