import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function getCookieValue(cookieHeader: string, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split("; ");
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

function buildAuthorizationHeader(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const authorization = req.headers.get("authorization") || "";
  const tokenFromCookie = getCookieValue(cookie, "auth_token") || getCookieValue(cookie, "token");
  return {
    cookie,
    authorization: authorization || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : ""),
  };
}

export async function forwardAdminRequest(req: Request, path: string, init?: RequestInit) {
  const { cookie, authorization } = buildAuthorizationHeader(req);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(cookie ? { cookie } : {}),
      ...(authorization ? { authorization } : {}),
    },
  });

  const contentType = response.headers.get("content-type") || "application/json";
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": contentType },
  });
}

export async function forwardAdminJson(req: Request, path: string, method: string) {
  const { cookie, authorization } = buildAuthorizationHeader(req);
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "content-type": req.headers.get("content-type") || "application/json",
      ...(cookie ? { cookie } : {}),
      ...(authorization ? { authorization } : {}),
    },
    body: await req.arrayBuffer(),
  });

  const contentType = response.headers.get("content-type") || "application/json";
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": contentType },
  });
}

export async function forwardAdminLogout(req: Request, path: string) {
  const response = await forwardAdminRequest(req, path, { method: "POST" });
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("user_data", "", { maxAge: 0, path: "/" });
  response.cookies.set("role", "", { maxAge: 0, path: "/" });
  return response;
}
