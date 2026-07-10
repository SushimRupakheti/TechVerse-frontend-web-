import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type JwtPayload = {
  role?: string;
};

const getRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const getCookieValue = (setCookie: string | null, name: string) => {
  if (!setCookie) return undefined;
  const match = setCookie.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

const getLoginToken = (
  result: Record<string, unknown>,
  setCookie: string | null
) => {
  const data = getRecord(result.data) || {};

  return (
    getString(result.token) ||
    getString(result.accessToken) ||
    getString(result.jwt) ||
    getString(data.token) ||
    getString(data.accessToken) ||
    getString(data.jwt) ||
    getCookieValue(setCookie, "auth_token") ||
    getCookieValue(setCookie, "token")
  );
};

const getUserData = (result: Record<string, unknown>, token: string) => {
  const data = getRecord(result.data) || {};
  const user = getRecord(data.user);
  const userData = user ? { ...user, token } : { ...data, token };

  const decodedRole = (() => {
    try {
      return jwtDecode<JwtPayload>(token).role?.toLowerCase();
    } catch {
      return undefined;
    }
  })();

  const role =
    getString(userData.role)?.toLowerCase() ||
    getString(data.role)?.toLowerCase() ||
    getString(user?.role)?.toLowerCase() ||
    decodedRole ||
    "user";

  return { ...userData, role };
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const contentType = req.headers.get("content-type") || "application/json";

    const backendResponse = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body,
    });

    const responseBody = await backendResponse.text();
    const responseType =
      backendResponse.headers.get("content-type") || "application/json";

    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "content-type": responseType,
      },
    });

    if (!backendResponse.ok || !responseType.includes("application/json")) {
      return response;
    }

    const result = JSON.parse(responseBody) as Record<string, unknown>;
    const token = getLoginToken(result, backendResponse.headers.get("set-cookie"));

    if (!token || result.twoFactorRequired) {
      return response;
    }

    const userData = getUserData(result, token);
    const role = getString(userData.role) || "user";

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("token", token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("role", role, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("user_data", JSON.stringify(userData), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Login proxy failed",
      },
      { status: 500 }
    );
  }
}
