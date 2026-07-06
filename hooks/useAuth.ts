"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthMe, logoutOAuth, type OAuthUser } from "@/lib/api/oauth";
import { handleLogout } from "@/lib/actions/auth-action";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<OAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const authUser = await fetchAuthMe();
      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(
    async (redirectTo = "/login") => {
      await logoutOAuth().catch(() => undefined);
      await handleLogout().catch(() => undefined);
      setUser(null);
      router.push(redirectTo);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    checkAuth,
    logout,
  };
}
