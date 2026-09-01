import { ENVIRONMENT_TYPE } from "@prisma/client";
import z from "zod";

export const toggleFlagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
    isEnabled: z.union([
        z.boolean(),
        z.string().transform((v) => v === "true" || v === "1")
    ])
});

export const evaluateUserFlagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
    userId: z.string({error: "You must provide the user Id"}),
})

export const flagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
})

export const listSchema = z.object({
    userId: z.string({error: "User Id must be string"}).min(1,{error: "User Id should have atleast one character"}),
    group: z.array(z.string()).optional().default([]),
});

export const changeRulesValidation = z.object({
    blacklist: z.array(listSchema).optional(),
    whitelist: z.array(listSchema).optional(),
    groups: z.array(z.string()).optional(),
    rollout: z.number().min(0).max(100)
})

export const flagRules = z.object({
    blacklist: z.array(listSchema).optional(),
    whitelist: z.array(listSchema).optional(),
    groups: z.array(z.string()).optional(),
})

export const createNewFlagValidation = z.object({
    name: z.string({error: "You must provide the name"}).min(3, {error: "Flag Name should have atleast one character"}).max(30, {error: "User Id should have at max thirty character"}),
    is_enabled: z.boolean(),
    environment: z.enum(ENVIRONMENT_TYPE, {error: `Environment can be ${ENVIRONMENT_TYPE.DEVELOPMENT} or ${ENVIRONMENT_TYPE.PRODUCTION}`}),
    rules: flagRules,
    rollout: z.number().min(0).max(100)
})

export const addGroupValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}).min(1),
    groupId: z.string({error: "You must provide the flag Id"}).min(1)
})

export type toggleFlagValidationType = z.infer<typeof toggleFlagValidation>;
export type evaluateUserFlagValidationType = z.infer<typeof evaluateUserFlagValidation>;
export type flagValidationType = z.infer<typeof flagValidation>;
export type changeRulesValidationType = z.infer<typeof changeRulesValidation>;
export type createNewFlagValidationType = z.infer<typeof createNewFlagValidation>;
export type flagRulesValidationType = z.infer<typeof flagRules>;
export type addGroupValidationType = z.infer<typeof addGroupValidation>;