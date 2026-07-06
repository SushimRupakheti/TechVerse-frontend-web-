export type OAuthUser = {
  id?: string;
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: "admin" | "user" | string;
  [key: string]: unknown;
};

export type MeResponse = {
  success?: boolean;
  data?: OAuthUser;
  user?: OAuthUser;
  message?: string;
};

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5050";

export const getGoogleLoginUrl = () => `${BACKEND_URL}/api/auth/google`;

export const fetchAuthMe = async () => {
  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as MeResponse;
  return payload.data || payload.user || null;
};

export const logoutOAuth = async () => {
  const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Logout failed";
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message || message;
    } catch {
      // Keep fallback message when the backend returns no JSON body.
    }
    throw new Error(message);
  }
};
