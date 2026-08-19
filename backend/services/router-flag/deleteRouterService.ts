import db from "../../utils/db/db";
import type { deleteRouterValidationType } from "../../validation/routerFlagValidation";

export const deletRouterService = async (
    data: deleteRouterValidationType
) => {
    const findMethodPath = await db.routeFlag.findUnique({
        where: {
            method_path: {
                method: data.method,
                path: data.path
            }
        }
    });

    if(!findMethodPath) {
        return {
            errorCode: 404,
            success: false,
            message: `The given method: ${data.method} and path: ${data.path} was not found`
        }
    }

    await db.routeFlag.delete({
        where: {
            method_path: {
                method: data.method,
                path: data.path
            }
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: `The given method: ${data.method} and path: ${data.path} is deleted`
    }
}