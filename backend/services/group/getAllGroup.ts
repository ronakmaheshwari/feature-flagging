import db, { ROLES } from "../../utils/db/db";
import type { groupFilterValidationType, groupSearchValidationType } from "../../validation/groupValidation";

export const whereSearchClause = (description: string) => {
    return {
        isDeleted: false,
        ...(description
            ? {
                name: {
                    contains: description,
                    mode: "insensitive" as const,
                },
            }
            : {}),
    };
};

export const filterClause = (totalUser?: number, name?: string) => {
    return {
        isDeleted: false,
        ...(name
            ? {
                name: {
                    contains: name,
                    mode: "insensitive" as const,
                },
            }
            : {}),
        ...(totalUser !== undefined ? { total_users: totalUser } : {}),
    };
};

export const getAllGroupService = async (
    userId: string,
    role: ROLES,
    searchParams?: groupSearchValidationType,
    filterParams?: groupFilterValidationType,
) => {
    const whereClause = searchParams?.description ? whereSearchClause(searchParams.description) : filterClause(filterParams?.totalUser, filterParams?.name);

    let where = {
        ...whereClause,
        ...(role === ROLES.ADMIN ? {} : {userId: userId})
    }

    const allGroups = await db.group.findMany({
        where,
        select: {
            id: true,
            name: true,
            total_users: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
        },
        orderBy: {
            name: "asc"
        }
    })

    return {
        errorCode: 200,
        success: true,
        message: "Groups were successfully fetched",
        data: allGroups
    }
}