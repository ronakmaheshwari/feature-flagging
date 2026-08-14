import z from "zod";

export const getContentQueryValidation = z.object({
    content: z.string().optional(),
    platform: z.string().optional(),
    status: z.enum(["DRAFT", "POSTED", "DELETED"]).optional(),
    isDeleted: z.boolean().optional()
})

export const postContentValidation = z.object({
    content: z.string(),
    platform: z.string(),
    status: z.enum(["DRAFT", "POSTED", "DELETED"]),
})

export type getContentQueryValidationType = z.infer<typeof getContentQueryValidation>;
export type postContentValidationType = z.infer<typeof postContentValidation>;