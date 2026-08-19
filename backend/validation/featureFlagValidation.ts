import z from "zod";

export const toggleFlagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
    isEnabled: z.boolean({error: "It must either be true or false only"})
});

export const evaluateUserFlagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
    userId: z.string({error: "You must provide the user Id"}),
})


export const flagValidation = z.object({
    flagId: z.string({error: "You must provide the flag Id"}),
})

export type toggleFlagValidationType = z.infer<typeof toggleFlagValidation>;
export type evaluateUserFlagValidationType = z.infer<typeof evaluateUserFlagValidation>;
export type flagValidationType = z.infer<typeof flagValidation>;