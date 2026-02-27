import UserModel from "@/model/User.model";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User.model";

export async function POST(req: Request) {
	await dbConnect();

	const { username, content } = await req.json();

	try {
		const user = await UserModel.findOne({ username });
		if (!user) {
			return Response.json(
				{
					success: false,
					message: "user not found!",
				},
				{ status: 404 },
			);
		}

		// if user accepting the messages
		if (!user.isAcceptingMessage) {
			return Response.json(
				{
					success: false,
					message: "user is not accepting the messages",
				},
				{ status: 403 },
			);
		}
		const newMessage = { content, createdAt: new Date() };
		user.messages.push(newMessage as Message);
		await user.save();
		return Response.json(
			{
				success: true,
				message: "message sent successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log("An unexpected error occurred: ", error);
		return Response.json(
			{
				success: false,
				message: "An unexpected error occurred!",
			},
			{ status: 500 },
		);
	}
}
