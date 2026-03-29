import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-secret";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: authSecret });
	const url = req.nextUrl;
	const isAuthPage =
		url.pathname.startsWith("/sign-in") ||
		url.pathname.startsWith("/sign-up") ||
		url.pathname.startsWith("/verify");
	const isDashboardPage = url.pathname.startsWith("/dashboard");
	const isHomePage = url.pathname === "/";

	if (token && (isAuthPage || isHomePage)) {
		console.log(`[middleware] token found, redirecting to /dashboard from ${url.pathname}`);
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (!token && isDashboardPage) {
		console.log(`[middleware] token missing, redirecting to /sign-in from ${url.pathname}`);
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
