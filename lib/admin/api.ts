import "server-only";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type AdminRequestInit = RequestInit & {
  cache?: RequestCache;
};

function buildSearchParams(params?: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  if (!params) return "";

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function getAdminHeaders(extraHeaders?: HeadersInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const headers = new Headers(extraHeaders);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function adminFetch(path: string, init: AdminRequestInit = {}) {
  const headers = await getAdminHeaders(init.headers);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  const contentType = response.headers.get("content-type") || "application/json";
  const raw = await response.text();

  let body: unknown = raw;
  if (contentType.includes("application/json") && raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  }

  if (!response.ok) {
    const message = getMessageFromPayload(body) || raw || "Request failed";
    throw new Error(message);
  }

  return body;
}

function getMessageFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const message = record.message;
  const error = record.error;

  if (typeof message === "string" && message) return message;
  if (typeof error === "string" && error) return error;

  return null;
}

export type AdminListResponse<T> = {
  data?: T[];
  meta?: {
    total?: number;
    totalPages?: number;
    currentPage?: number;
    perPage?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function normalizeAdminList<T>(payload: unknown): AdminListResponse<T> & { items: T[] } {
  const items = Array.isArray(payload)
    ? payload
    : isRecord(payload) && (Array.isArray(payload.data) ? payload.data : Array.isArray(payload.items) ? payload.items : []);
  return {
    ...(isRecord(payload) ? payload : {}),
    items,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getAdminDashboard() {
  return adminFetch("/api/admin/dashboard");
}

export async function getAdminUsers(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/users${buildSearchParams(params)}`);
}

export async function createAdminUser(payload: Record<string, unknown>) {
  return adminFetch("/api/admin/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminUser(id: string) {
  return adminFetch(`/api/admin/users/${id}`);
}

export async function updateAdminUser(id: string, payload: Record<string, unknown>) {
  return adminFetch(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string) {
  return adminFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export async function logoutAdminUser() {
  return adminFetch("/api/admin/users/logout", {
    method: "POST",
  });
}

export async function getAdminItems(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/items${buildSearchParams(params)}`);
}

export async function getAdminItem(id: string) {
  return adminFetch(`/api/admin/items/${id}`);
}

export async function updateAdminItem(id: string, payload: Record<string, unknown>) {
  return adminFetch(`/api/admin/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminItemStatus(id: string, payload: { status: string; reason?: string }) {
  return adminFetch(`/api/admin/items/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminItem(id: string) {
  return adminFetch(`/api/admin/items/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminPayments(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/payments${buildSearchParams(params)}`);
}

export async function getAdminPayment(id: string) {
  return adminFetch(`/api/admin/payments/${id}`);
}

export async function sendAdminNotification(payload: { title: string; message: string }) {
  return adminFetch("/api/admin/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminCompanies(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/companies${buildSearchParams(params)}`);
}

export async function getAdminJobs(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/jobs${buildSearchParams(params)}`);
}

export async function getAdminApplications(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/applications${buildSearchParams(params)}`);
}

export async function getAdminDocuments(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/documents/pending${buildSearchParams(params)}`);
}

export async function getAdminAuditLogs(params?: Record<string, string | number | undefined | null>) {
  return adminFetch(`/api/admin/audit-logs${buildSearchParams(params)}`);
}
