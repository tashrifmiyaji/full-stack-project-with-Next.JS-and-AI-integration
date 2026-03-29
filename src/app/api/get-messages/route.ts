import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";

export async function GET() {
	await dbConnect();
	const session = await getServerSession(authOptions);

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not Authenticated!",
			},
			{ status: 401 },
		);
	}
	const userId = new mongoose.Types.ObjectId(session.user._id);
	try {
		const messagesByUser = await UserModel.aggregate([
			{ $match: { _id: userId } },
			{ $unwind: "$messages" },
			{ $sort: { "messages.createdAt": -1 } },
			{ $group: { _id: "$_id", messages: { $push: "$messages" } } },
		]);

		if (!messagesByUser || messagesByUser.length === 0) {
			return Response.json(
				{
					success: true,
					messages: [],
				},
				{ status: 200 },
			);
		}
		return Response.json(
			{
				success: true,
				messages: messagesByUser[0].messages,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log("error adding messages: ", error);
		return Response.json(
			{
				success: false,
				message: "internal server error!",
			},
			{ status: 500 },
		);
	}
}
