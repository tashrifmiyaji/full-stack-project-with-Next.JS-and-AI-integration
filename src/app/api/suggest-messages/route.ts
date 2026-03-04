import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST() {
	try {
		const prompt =
			"Create a list of three open-ended and engaging  questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid Personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'what's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment";

		const messages: UIMessage[] = [
			{
				id: "1",
				role: "user",
				parts: [
					{
						type: "text",
						text: prompt,
					},
				],
			},
		];

		const result = streamText({
			model: "openai/gpt-5.3-chat",
			messages: await convertToModelMessages(messages),
			onError: (error) => {
				console.error("Stream error:", error);
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (error: any) {
		console.error("an unexpected error occurred!", error);
		return new Response(
			JSON.stringify({
				error: error?.message || "Internal Server Error",
			}),
			{ status: 500 },
		);
	}
}
