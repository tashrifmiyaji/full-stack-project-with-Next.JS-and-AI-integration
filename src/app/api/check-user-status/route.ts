import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(req: Request) {
	await dbConnect();

	try {
		const { identifier } = await req.json();

		if (!identifier) {
			return Response.json(
				{
					success: false,
					message: "identifier is required",
				},
				{ status: 400 },
			);
		}

		const user = await UserModel.findOne({
			$or: [{ email: identifier }, { username: identifier }],
		});

		if (!user) {
			return Response.json(
				{
					success: false,
					message: "user not found",
				},
				{ status: 404 },
			);
		}

		console.log(
			`[check-user-status] identifier=${identifier}, username=${user.username}, isVerified=${user.isVerified}, isAcceptingMessage=${user.isAcceptingMessage}`,
		);

		return Response.json(
			{
				success: true,
				message: user.isVerified
					? "user is verified"
					: "user is not verified",
				username: user.username,
				isVerified: user.isVerified,
				isAcceptingMessage: user.isAcceptingMessage,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error checking user status", error);
		return Response.json(
			{
				success: false,
				message: "Error checking user status",
			},
			{ status: 500 },
		);
	}
}
