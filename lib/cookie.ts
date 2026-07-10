"use server";
import { cookies } from "next/headers";

type UserData = Record<string, unknown>;

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

}
export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value;
      if (!token || token === "undefined" || token === "null") return null;
    return token;
}

export const setUserData = async (userData: UserData) => {
    const cookieStore = await cookies();
    // cookie can only store string values
    // convert object to string -> JSON.stringify
    cookieStore.set({
        name: "user_data",
        value: JSON.stringify(userData),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })
}
export const getUserData = async () => {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;
    // convert string back to object -> JSON.parse
    if (userDataStr) {
        return JSON.parse(userDataStr);
    }
    return null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
    cookieStore.set("token", "", { maxAge: 0, path: "/" });
    cookieStore.set("user_data", "", { maxAge: 0, path: "/" });
    cookieStore.set("role", "", { maxAge: 0, path: "/" });
}

