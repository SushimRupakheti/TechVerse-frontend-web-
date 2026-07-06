import { BACKEND_URL } from "./oauth";

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: "APPROVED" | "REJECTED" | "SOLD" | "ADMIN_CUSTOM";
  item?: unknown;
  isRead: boolean;
  createdAt?: string;
};

type NotificationsResponse = {
  success?: boolean;
  data?: NotificationItem[];
  message?: string;
};

const getReadableCookie = (name: string) => {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
};

const authHeaders = (): HeadersInit => {
  const token = getReadableCookie("token");
  return token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {};
};

const parseResponse = async <T>(response: Response, fallback: string) => {
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || fallback);
  }

  return payload;
};

export const getNotifications = async () => {
  const response = await fetch(`${BACKEND_URL}/api/notifications`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: authHeaders(),
  });

  const payload = await parseResponse<NotificationsResponse>(
    response,
    "Failed to load notifications"
  );

  return payload?.data || [];
};

export const markNotificationAsRead = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
    method: "PUT",
    credentials: "include",
    headers: authHeaders(),
  });

  await parseResponse(response, "Failed to mark notification as read");
};

export const deleteNotification = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });

  await parseResponse(response, "Failed to delete notification");
};
