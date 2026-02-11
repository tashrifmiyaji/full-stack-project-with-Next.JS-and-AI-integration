import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import verificationEmailTemplate from "../../emails/verificationEmailTemplate";

export async function sendVerificationEmail(
	email: string,
	username: string,
	verifyCode: string
): Promise<ApiResponse> {
	try {
		const { error } = await resend.emails.send({
			from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
			// to: email,
			// todo for test!
			to: "sadiyaislamhenten@gmail.com",
			subject: "mystery-message | verification email",
			react: verificationEmailTemplate({
				username: username,
				otp: verifyCode,
			}),
		});
		if (error) {
			console.error("Resend error:", error);
			return {
				success: false,
				message: error.message ?? "Failed to send verification email!",
			};
		}
		return {
			success: true,
			message: "verification email sent successfully!",
		};
	} catch (emailError) {
		console.error("Error sending verification email", emailError);
		return {
			success: false,
			message: "Failed to send verification email!",
		};
	}
}
