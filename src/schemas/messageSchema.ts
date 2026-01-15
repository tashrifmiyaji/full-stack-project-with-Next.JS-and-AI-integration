import { z } from "zod";

export const messageSchema = z.object({
	content: z
		.string()
		.max(300, { message: "message must be no longer than 300 character!" }),
});
