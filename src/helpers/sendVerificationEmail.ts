import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import verificationEmailTemplate from "../../emails/verificationEmailTemplate";

export async function sendVerificationEmail(
	email: string,
	username: string,
	verifyCode: string
): Promise<ApiResponse> {
	try {
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: email,
			subject: "mystery-message | verification email",
			react: verificationEmailTemplate({
				username: username,
				otp: verifyCode,
			}),
		});
		return {
			success: true,
			message: "verification email send successfully!",
		};
	} catch (emailError) {
		console.error("Error sending verification email", emailError);
		return {
			success: false,
			message: "Failed to send verification email!",
		};
	}
}
