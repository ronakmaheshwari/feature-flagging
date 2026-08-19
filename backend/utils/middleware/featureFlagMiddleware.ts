import type { Request, Response, NextFunction } from "express";
import { loadRouteMap, resolveRoute } from "../feature-flag-helper/flagGate";
import { evaluateFlag } from "../feature-flag-helper/flagHelper";

const featureFlagMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await loadRouteMap();
        const matched = resolveRoute(req.method, req.path);
        if(!matched) {
            return next();
        }

        const { flag } = matched;

        if(flag.isDeleted || !flag.is_enabled) {
            return res.status(403).json({ error: `Feature '${flag.name}' is disabled` });
        }

        const user = req.userId;
        if (!user) {
            if (flag.rollout === 100) return next();
            if (flag.rollout === 0) {
                return res.status(403).json({ error: `Feature '${flag.name}' is disabled` });
            }
            return res.status(403).json({ error: `Feature '${flag.name}' requires authentication` });
        }
        const result = await evaluateFlag(user, flag);
        if (!result.success) {
            return res.status(403).json({ error: result.message });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export default featureFlagMiddleware;