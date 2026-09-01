import db from "../../utils/db/db";

export const getAllRouterService = async () => {
    const allRoutes = await db.routeFlag.findMany({
        orderBy: {
            path: "asc"
        }
    });

    return {
        errorCode: 200,
        success: true,
        message: "Route flags were successfully fetched",
        data: allRoutes
    };
};
