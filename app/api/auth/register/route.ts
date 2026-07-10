import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Registration proxy failed";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const contentType = req.headers.get("content-type") || "application/json";

    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body,
    });

    const responseBody = await res.text();
    const responseType = res.headers.get("content-type") || "application/json";

    return new NextResponse(responseBody, {
      status: res.status,
      headers: {
        "content-type": responseType,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
