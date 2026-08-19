import db from "../../utils/db/db";
import type { addRouterValidationType } from "../../validation/routerFlagValidation";

export const changeRouteFlag = async (
    data: addRouterValidationType
) => {
    const findFlag = await db.feature_Flag.findUnique({
        where: {
            name: data.flagName as string
        }
    })

    if (!findFlag) {
        return { errorCode: 404, success: false, message: "The given flag was not found" }
    }

    if (findFlag.isDeleted) {
        return { errorCode: 404, success: false, message: "The given flag is deleted" }
    }

    const findMethodPath = await db.routeFlag.findUnique({
        where: {
            method_path: {
                method: data.method,
                path: data.path
            }
        }
    })

    if(!findMethodPath) {
        return {
            errorCode: 404,
            success: false,
            message: `The given method: ${data.method} and path: ${data.path} was not found`
        }
    }

    const addRoute = await db.routeFlag.update({
        where: {
            method_path: {
                method: findMethodPath.method,
                path: findMethodPath.path
            }
        },
        data: {
            flagName: findFlag.name
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: `The given method: ${addRoute.method} and path: ${addRoute.path} is linked to this flag: ${addRoute.flagName}`
    }
}