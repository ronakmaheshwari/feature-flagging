import db from "../../utils/db/db";
import type { getContentQueryValidationType } from "../../validation/contentValidation";

const searchWhereClause = (userId: string, query: getContentQueryValidationType) => {
    const whereClause: Record<string, any> = {
        userId: userId,
        isDeleted: false
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
    const page = parseInt(query.page as string) ?? 1;
    const limit = parseInt(query.limit as string) ?? 10;

    const skip = (page - 1) * limit;

    const [findContent, totalCount] = await Promise.all([
        db.content.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc"
            },
            skip: skip,
            take: limit
        }),
        db.content.count({
            where: whereClause,
            orderBy: {
                createdAt: "desc"
            },
        })
    ])

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
        data: findContent,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount
        }
    }
}