import db from "../../utils/db/db"

export const getContentCountService = async(userId: string) => {
    const findUser = await db.user.findUnique({
        where: {
            id: userId as string
        }
    });

    if(!findUser) {
        return {
            errorCode: 404,
            success: false,
            message: "Invalid User Id was provided"
        }
    }

    const [getCount, draftedCount, publishedCount, deletedCount, platformCount] = await Promise.all([
        db.content.count({
            where: {
                userId: userId as string
            },
            orderBy: {
                id: "asc"
            }
        }),
        db.content.count({
            where: {
                userId: userId as string,
                status: "DRAFT",
                isDeleted: false
            }
        }),
        db.content.count({
            where: {
                userId: userId as string,
                status: "POSTED",
                isDeleted: false
            }
        }),
        db.content.count({
            where: {
                userId: userId as string,
                status: "DELETED",
                isDeleted: true
            }
        }),
        db.content.groupBy({ by: ["platform"], where: { userId, }, _count: { platform: true, }, }),
    ]);

    const platformCnt = platformCount.reduce( (acc: Record<string, number>, item) => { if(item.platform) acc[item.platform] = item._count.platform; return acc; }, {} );
    
    return {
        errorCode: 200,
        success: true,
        message: "The content count was successfully fetched",
        data: {
            total: getCount,
            draft: draftedCount,
            published: publishedCount,
            deleted: deletedCount,
            platformCount: platformCnt
        }
    }
}