import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth-action";
import { getOAuthUser } from "@/lib/actions/oauth-action";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getAuthUser();
  const oauthUser = authUser ? null : await getOAuthUser();
  const user = authUser || oauthUser;

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
