// middleware.ts
import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req });
	const url = req.nextUrl;

	if (
		token &&
		(url.pathname.startsWith("/sign-in") ||
			url.pathname.startsWith("/sign-up") ||
			url.pathname.startsWith("/verify") ||
			url.pathname.startsWith("/"))
	) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}
}

// Apply middleware only to certain paths
export const config = {
	matcher: [
		"/sign-in",
		"/sign-up",
		"/",
		"/dashboard/:path*",
		"/verify/:path*",
	],
};
