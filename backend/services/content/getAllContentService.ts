import db from "../../utils/db/db";
import type { getContentQueryValidationType } from "../../validation/contentValidation";

const searchWhereClause = (userId: string, query: getContentQueryValidationType) => {
    const whereClause: Record<string, any> = {
        userId: userId
    }

    if(query.content) {
        whereClause.content = {
            contains: query.content,
            mode: "insensitive"
        }
    }

    if(query.platform) {
        whereClause.platform = {
            contains: query.platform,
            mode: "insensitive"
        }
    }

    if(query.status) {
        whereClause.status = query.status;
    }

    if(query.isDeleted !== undefined) {
        whereClause.isDeleted = query.isDeleted;
    }

    return whereClause
}

export const getAllContentService = async (
    userId: string,
    query: getContentQueryValidationType
) => {
    const whereClause = searchWhereClause(userId, query);

    const findContent = await db.content.findMany({
        where: whereClause,
        orderBy: {
            createdAt: "desc"
        }
    })

    if(findContent.length <= 0) {
        return {
            errorCode: 200,
            success: true,
            message: "Please create some content to see data",
            data: []
        }
    }

    return {
        errorCode: 200,
        success: true,
        message: "Please create some content to see data",
        data: findContent
    }
}