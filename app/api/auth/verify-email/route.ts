import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Verification token is required." },
      { status: 400 }
    );
  }

  try {
    const url = new URL("/api/auth/verify-email", BASE);
    url.searchParams.set("token", token);
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Email verification proxy failed",
      },
      { status: 500 }
    );
  }
}
