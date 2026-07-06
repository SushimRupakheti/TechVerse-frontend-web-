import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/forget_password",
  "/reset-password",
];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Support local JWT auth and backend OAuth/session cookies.
  const token =
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("token")?.value ||
    req.cookies.get("jwt")?.value ||
    req.cookies.get("access_token")?.value ||
    req.cookies.get("connect.sid")?.value ||
    req.cookies.get("session")?.value;
  const role = req.cookies.get("role")?.value;

  const isPublicPath = publicPaths.some((p) => path.startsWith(p));
  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/user");

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminRoute && role && role !== "admin") {
    return NextResponse.redirect(new URL(role ? "/dashboard" : "/login", req.url));
  }

  if (isUserRoute && role !== "user" && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/user/:path*"],
};
// import { NextRequest, NextResponse } from "next/server";
// import { jwtDecode } from "jwt-decode";

// const publicPaths = [
//   "/login",
//   "/register",
//   "/forget_password",
//   "/reset-password",
// ];

// export default function proxy(req: NextRequest) {
//   const path = req.nextUrl.pathname;

//   const token = req.cookies.get("auth_token")?.value;

//   let role: string | null = null;

//   if (token) {
//     try {
//       const decoded: any = jwtDecode(token);
//       role = decoded.role;
//     } catch {
//       role = null;
//     }
//   }

//   const isPublicPath = publicPaths.some((p) => path.startsWith(p));
//   const isAdminRoute = path.startsWith("/admin");
//   const isUserRoute = path.startsWith("/user");

//   if (!token && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   if (token && isPublicPath) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (isAdminRoute && role !== "admin") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (isUserRoute && role !== "user" && role !== "admin") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/user/:path*"],
// };
