import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req });
	const url = req.nextUrl;
	const isAuthPage =
		url.pathname.startsWith("/sign-in") ||
		url.pathname.startsWith("/sign-up") ||
		url.pathname.startsWith("/verify");
	const isDashboardPage = url.pathname.startsWith("/dashboard");
	const isHomePage = url.pathname === "/";

	if (token && (isAuthPage || isHomePage)) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (!token && isDashboardPage) {
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	return NextResponse.next();
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
