"use server";
import { getAuthUser } from "./auth-action";
import { getOAuthUser } from "./oauth-action";
import { getUserById, updateUserById } from "../api/users";
import { clearAuthCookies } from "../cookie";
import { logoutUserApi } from "../api/users";
import axios from "@/lib/api/axios";
import { getAuthToken } from "../cookie";

const getUserId = (user: { id?: string; _id?: string } | null) =>
  user?.id || user?._id || "";

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiErrorShape;
  return apiError.response?.data?.message || apiError.message || fallback;
};

const getStringField = (value: unknown) => (typeof value === "string" ? value : "");

const normalizeProfileData = (user: Record<string, unknown>) => {
  const [firstName = "", ...lastNameParts] =
    typeof user.name === "string" ? user.name.split(" ") : [];

  return {
    ...user,
    firstName: getStringField(user.firstName) || firstName,
    lastName: getStringField(user.lastName) || lastNameParts.join(" "),
    email: getStringField(user.email),
    address: getStringField(user.address),
    contactNo: getStringField(user.contactNo) || getStringField(user.phone),
  };
};

export const fetchMyProfile = async () => {
  const authUser = await getAuthUser();
  if (authUser?.id) {
    try {
      const res = await getUserById(authUser.id);
      if (res?.success && res.data) return res; // { success, data }
    } catch {
      // OAuth logins may set a token cookie whose id is not accepted by /api/users/:id.
      // Fall through to /api/auth/me before reporting an error.
    }
  }

  const oauthUser = await getOAuthUser();
  const oauthUserId = getUserId(oauthUser);

  if (!oauthUser) return { success: false, message: "Not logged in" };

  if (oauthUserId) {
    try {
      const res = await getUserById(oauthUserId);
      if (res?.success && res.data) return res;
    } catch {
      // Fall back to /api/auth/me data when the user lookup needs local JWT auth.
    }
  }

  return { success: true, data: normalizeProfileData(oauthUser) };
};

export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  address?: string;
  // add more if your backend accepts
}) => {
  const authUser = await getAuthUser();
  const oauthUser = authUser ? null : await getOAuthUser();
  const userId = authUser?.id || getUserId(oauthUser);

  if (!userId) return { success: false, message: "Not logged in" };

  const res = await updateUserById(userId, payload);
  return res;
};


export const logoutUser = async () => {
  try {
    // Call backend logout
    await logoutUserApi();

    // Clear frontend cookies
    await clearAuthCookies();

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Logout failed"),
    };
  }
};

// Server-side admin helpers
export const fetchAdminUsersServer = async (opts?: { page?: number; limit?: number }) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const params = new URLSearchParams();
    if (opts?.page) params.append("page", String(opts.page));
    if (opts?.limit) params.append("limit", String(opts.limit));

    const url = `/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await axios.get(url, { headers });
    return res.data; // expects { success, data, meta }
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err, "Failed to fetch admin users") };
  }
};

export const deleteAdminUserServer = async (id: string) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.delete(`/api/admin/users/${id}`, { headers });
    return res.data;
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err, "Failed to delete admin user") };
  }
};


