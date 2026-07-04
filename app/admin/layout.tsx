import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth-action";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  if (authUser.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
