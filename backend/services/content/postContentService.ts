import type { Prisma } from "@prisma/client";
import db from "../../utils/db/db";
import generateWithOllama from "../../utils/ollama/ollama";
import templateGenerator from "../../utils/ollama/promptGenerator";
import type { postContentValidationType } from "../../validation/contentValidation";

export const postContentService = async (
    userId: string,
    data: postContentValidationType
) => {
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
        const contentAdded = await tx.content.create({
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
                old_value: {},
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