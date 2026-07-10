import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const SAFE_IMAGE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await params;

  if (!SAFE_IMAGE_NAME.test(fileName)) {
    return NextResponse.json(
      { success: false, message: "Image not found." },
      { status: 404 }
    );
  }

  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const backendResponse = await fetch(
    `${BACKEND_URL}/api/uploads/images/${fileName}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!backendResponse.ok || !backendResponse.body) {
    const message =
      backendResponse.status === 404 ? "Image not found." : "Image fetch failed.";
    return NextResponse.json(
      { success: false, message },
      { status: backendResponse.status }
    );
  }

  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  const contentLength = backendResponse.headers.get("content-length");

  if (contentType) headers.set("content-type", contentType);
  if (contentLength) headers.set("content-length", contentLength);
  headers.set("x-content-type-options", "nosniff");

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers,
  });
}
