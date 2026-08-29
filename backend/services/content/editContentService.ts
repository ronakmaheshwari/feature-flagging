import type { Prisma } from "@prisma/client";
import db from "../../utils/db/db";
import generateWithOllama from "../../utils/ollama/ollama";
import templateGenerator from "../../utils/ollama/promptGenerator";
import type { postContentValidationType } from "../../validation/contentValidation";

export const editContentService = async (
    userId: string,
    contentId: string,
    data: postContentValidationType
) => {
    const findContent = await db.content.findUnique({
        where: {
            id: contentId as string
        }
    })

    if(!findContent) {
        return {
            errorCode: 404,
            success: false,
            message: "The given content doesnt exist with our system",
        }
    }

    if(findContent.userId !== userId) {
        return {
            errorCode: 401,
            success: false,
            message: "The given content doesnt belong to you",
        }
    }

    if(findContent.isDeleted) {
        return {
            errorCode: 404,
            success: false,
            message: "The given content is deleted",
        }
    }

    const template = templateGenerator(data.platform, {
        topic: data.topic
    })

    let prompt = `${template} ${data.content}`;

    const getResponse = await generateWithOllama(prompt);
    if(!getResponse) {
        return {
            errorCode: 409,
            success: false,
            message: getResponse,
            data: null
        }
    }

    const addContent = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const contentAdded = await tx.content.update({
            where: {
                id: findContent.id as string
            },
            data: {
                userId: userId as string,
                topic: data.topic,
                content: getResponse,
                platform: data.platform,
                status: data.status,
            }
        });
        await tx.contentAudit.create({
            data: {
                contentId: contentAdded.id,
                old_value: {
                    userContent: findContent.content,
                    topic: findContent.topic,
                    status: findContent.status,
                    platform: findContent.platform,
                },
                new_value: { 
                    userContent: data.content,
                    promptContent: getResponse,
                    topic: data.topic,
                    status: data.status,
                    platform: data.platform,
                    prompt: prompt
                },
            }
        });
    })

    return {
        errorCode: 200,
        success: true,
        message: "Data was successfully generated",
        data: getResponse
    }
}