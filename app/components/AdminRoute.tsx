"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAdmin, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || !isAdmin) return null;

  return <>{children}</>;
}
