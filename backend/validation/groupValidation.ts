import z from "zod";

export const groupSearchValidation = z.object({
    description: z.string().optional(),
});

export const groupFilterValidation = z.object({
    totalUser: z.coerce.number().optional(), 
    name: z.string().optional(),
});

export const groupQueryValidation = groupSearchValidation.merge(groupFilterValidation);

export type groupSearchValidationType = z.infer<typeof groupSearchValidation>;
export type groupFilterValidationType = z.infer<typeof groupFilterValidation>;
export type groupQueryValidationType = z.infer<typeof groupQueryValidation>;