import z from "zod";

export const userSignupValidation = z.object({
    username: z.string().trim().min(3, {
        error: "Your Username must atleast be more than 3 characters"
    }).max(30, {
        error: "Your Username must be less than 30 characters"
    }),
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format."}).trim(),
    password: z.string().trim().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/, {
        error: "Your password must be strong"
    }).min(8, "Your password must have atleast 8 characters")
});

export const userLoginValidation = z.object({
    email: z.email({ pattern: z.regexes.rfc5322Email , error: "Invalid email address format." }),
    password: z.string().trim().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/, {
        error: "Your password must be strong"
    }).min(8, "Your password must have atleast 8 characters")
})

export type userSignupValidationType = z.infer<typeof userSignupValidation>;
export type userLoginValidationType = z.infer<typeof userLoginValidation>;