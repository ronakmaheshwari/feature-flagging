import { Router } from "express";
import userRouter from "./userRouter";
import contentRouter from "./contentRouter";

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
    }
]

allRouters.forEach((x) => {
    router.use(x.path, x.router);
})

export default router