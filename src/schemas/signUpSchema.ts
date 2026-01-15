import { z } from "zod";

const usernameValidation = z
	.string()
	.min(2, { message: "username must be at least 2 character!" })
	.max(20, { message: "username must be no more then 20 character!" })
	.regex(/^[a-zA-Z0-9_]+$/, {
		message: "username must not contain special character!",
	});

export const signUpSchema = z.object({
	username: usernameValidation,
	email: z.string().email({ message: "invalid email address!" }),
	password: z
		.string()
		.min(6, { message: "password must be at least 6 character!" }),
});
