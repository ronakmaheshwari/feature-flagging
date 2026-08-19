import { Method } from "@prisma/client";
import z from "zod";

export const addRouterValidation = z.object({
    method: z.enum(Method, {error: "Method can only be GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"}),
    path: z.string({error: "Path must be a string"}).min(1, {error: "Path should have atleast one character"}),
    flagName: z.string({error: "Flag name must be string"}).min(1, {error: "Flag name should have atleast one character"}).max(30),
});

export const deleteRouterValidation = z.object({
    method: z.enum(Method, {error: "Method can only be GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"}),
    path: z.string({error: "Path must be a string"}).min(1, {error: "Path should have atleast one character"}),
})

export type addRouterValidationType = z.infer<typeof addRouterValidation>;
export type deleteRouterValidationType = z.infer<typeof deleteRouterValidation>;