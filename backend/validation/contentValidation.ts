import z from "zod";

export const getContentQueryValidation = z.object({
    content: z.string().optional(),
    platform: z.string().optional(),
    status: z.enum(["DRAFT", "POSTED", "DELETED"]).optional(),
    isDeleted: z.boolean().optional()
})

export const postContentValidation = z.object({
    topic: z.string(),
    content: z.string(),
    platform: z.enum(["LinkedIn" ,"X" ,"Instagram" ,"Threads" ,"Facebook" , "Blog"]),
    status: z.enum(["DRAFT", "POSTED", "DELETED"]),
})

export const deleteContentValidation = z.object({
    contentId: z.string({error: "Content Id must be provided for deletion"})
}).strict()

export type getContentQueryValidationType = z.infer<typeof getContentQueryValidation>;
export type postContentValidationType = z.infer<typeof postContentValidation>;
export type deleteContentValidationType = z.infer<typeof deleteContentValidation>;