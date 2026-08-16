import z, { email } from "zod";

export const groupSearchValidation = z.object({
    description: z.string().optional(),
});

export const groupFilterValidation = z.object({
    totalUser: z.coerce.number().optional(), 
    name: z.string().optional(),
});

export const newGroupValidation = z.object({
    name: z.string({error: "Name must be provided"}).min(3, {error: "Name must have atleast 3 character"}).max(20, {error: "Name must not be beyond 20 characters"}).trim()
}).strict()

export const groupIdValidation = z.object({
    groupId: z.string({error: "GroupId must be a string"})
}).strict()

export const addUserToGroupValidation = z.object({
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format."}).trim(),
}).strict()

export const groupQueryValidation = groupSearchValidation.merge(groupFilterValidation);

export type groupSearchValidationType = z.infer<typeof groupSearchValidation>;
export type groupFilterValidationType = z.infer<typeof groupFilterValidation>;
export type groupQueryValidationType = z.infer<typeof groupQueryValidation>;
export type newNameValidationType = z.infer<typeof newGroupValidation>;
export type groupIdValidationType = z.infer<typeof groupIdValidation>;
export type addUserToGroupValidationType = z.infer<typeof addUserToGroupValidation>;