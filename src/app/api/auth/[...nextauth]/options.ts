// external imports
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// internal imports
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

type CredentialsInput = {
	identifier: string;
	password: string;
};

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "credentials",
			credentials: {
				identifier: {
					label: "Email or Username",
					type: "text",
					placeholder: "enter your email or username",
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "enter your password",
				},
			},
			async authorize(credentials): Promise<NextAuthUser | null> {
				await dbConnect();
				try {
					const typedCredentials = credentials as CredentialsInput | undefined;

					if (
						!typedCredentials?.identifier ||
						!typedCredentials.password
					) {
						throw new Error("missing credentials");
					}

					const user = await UserModel.findOne({
						$or: [
							{ email: typedCredentials.identifier },
							{ username: typedCredentials.identifier },
						],
					});

					if (!user) {
						throw new Error("user not found!");
					}

					if (!user.isVerified) {
						throw new Error(
							"please verify your account before login!",
						);
					}

					const isPasswordCorrect = await bcrypt.compare(
						typedCredentials.password,
						user.password,
					);

					if (isPasswordCorrect) {
						return {
							id: user._id.toString(),
							_id: user._id.toString(),
							email: user.email,
							username: user.username,
							isVerified: user.isVerified,
							isAcceptingMessage: user.isAcceptingMessage,
						};
					} else {
						throw new Error("invalid credential!");
					}
				} catch (err: unknown) {
					throw new Error(
						err instanceof Error ? err.message : "authentication failed",
					);
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id?.toString();
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessage;
				token.username = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user._id = token._id;
				session.user.isVerified = token.isVerified;
				session.user.isAcceptingMessages = token.isAcceptingMessages;
				session.user.username = token.username;
			}
			return session;
		},
	},

	pages: {
		signIn: "/sign-in",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXT_AUTH_SECRET,
}
