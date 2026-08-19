import db from "../../utils/db/db";
import type { addRouterValidationType } from "../../validation/routerFlagValidation";

export const addNewRouterService = async (
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

    if(findMethodPath) {
        if(findMethodPath.flagName === data.flagName) {
            return {
                errorCode: 409,
                success: false,
                message: `The given method: ${data.method} and path: ${data.path} is already linked to this flag: ${data.flagName}`
            }
        }

        return {
            errorCode: 409,
            success: false,
            message: `The given method: ${data.method} and path: ${data.path} is already linked to a different flag: ${findMethodPath.flagName}`
        };
    }

    const addRoute = await db.routeFlag.create({
        data: {
            method: data.method,
            path: data.path,
            flagName: findFlag.name
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: `The given method: ${addRoute.method} and path: ${addRoute.path} is linked to this flag: ${addRoute.flagName}`
    }
}