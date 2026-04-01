import { streamText } from "ai";

const FALLBACK_SUGGESTIONS =
	"আজকাল কোন ছোট জিনিসটা তোমাকে সবচেয়ে বেশি খুশি করে?||এই সপ্তাহে নতুন কী শিখেছ?||তোমার স্বপ্নের একটা দিন কেমন হবে?";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const userPrompt =
			typeof body?.prompt === "string" ? body.prompt.trim() : "";

		const prompt = [
			"Generate exactly 3 short, open-ended, friendly questions for an anonymous social messaging app.",
			"Return only one plain string.",
			"Separate each question with '||'.",
			"Do not add numbering, bullets, markdown, quotes, or extra explanation.",
			userPrompt ? `User preference: ${userPrompt}` : "",
		]
			.filter(Boolean)
			.join(" ");

		const result = streamText({
			model: "openai/gpt-5.3-chat",
			prompt,
			onError: (error) => {
				console.error("Stream error:", error);
			},
		});

		const encoder = new TextEncoder();
		let hasReceivedText = false;

		const safeTextStream = new ReadableStream<Uint8Array>({
			async start(controller) {
				try {
					for await (const chunk of result.textStream) {
						if (!chunk) continue;
						hasReceivedText = true;
						controller.enqueue(encoder.encode(chunk));
					}

					if (!hasReceivedText) {
						controller.enqueue(encoder.encode(FALLBACK_SUGGESTIONS));
					}
				} catch (error) {
					console.error("suggest-messages stream failed:", error);
					controller.enqueue(encoder.encode(FALLBACK_SUGGESTIONS));
				} finally {
					controller.close();
				}
			},
		});

		return new Response(safeTextStream, {
			status: 200,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	} catch (error: unknown) {
		console.error("an unexpected error occurred in suggest-messages!", error);
		return new Response(FALLBACK_SUGGESTIONS, {
			status: 200,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	}
}
