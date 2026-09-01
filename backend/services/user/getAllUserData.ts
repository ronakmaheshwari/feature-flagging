import db from "../../utils/db/db";
import type { searchUserNameValidationType } from "../../validation/userValidation";
import type { Prisma } from "@prisma/client";

const searchFilter = (username: string): Prisma.UserWhereInput => {
    return {
        user_status: {
            not: "UNVERIFIED",
        },
        username: {
            contains: username,
            mode: "insensitive" as const,
        },
    };
};

const getAllUserData = async (
    username?: searchUserNameValidationType
) => {
    const whereClause: Prisma.UserWhereInput = username
        ? searchFilter(username)
        : {
              user_status: {
                  not: "UNVERIFIED",
              },
          };

    const getAllUsers = await db.user.findMany({
        where: whereClause,
        select: {
            id: true,
            username: true,
        },
    });

    return {
        errorCode: 200,
        success: true,
        message: "Users were successfully fetched",
        data: getAllUsers,
    };
};

export default getAllUserData;