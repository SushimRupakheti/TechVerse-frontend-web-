"use server";

import { cookies } from "next/headers";
import { BACKEND_URL, type MeResponse, type OAuthUser } from "@/lib/api/oauth";

export const getOAuthUser = async (): Promise<OAuthUser | null> => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as MeResponse;
    return payload.data || payload.user || null;
  } catch {
    return null;
  }
};
