import type { Request, Response, NextFunction } from "express";

const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.headers["x-test-user"] as string | undefined;
    const role = req.headers["x-test-role"] as string | undefined;

    req.userId = user === "none" ? undefined : (user || "test-user-id");
    req.role = (role || "USER") as Request["role"];
    next();
};

export default userMiddleware;