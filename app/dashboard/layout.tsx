export const dynamic = 'force-dynamic';

import AdvertisementBar from "../components/AdvertisementBar";
import Navbar from "../components/Navbar";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth-action";
import { getOAuthUser } from "@/lib/actions/oauth-action";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  const oauthUser = authUser ? null : await getOAuthUser();
  if (!authUser && !oauthUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header stays the same */}
      <header className="sticky top-0 z-50 bg-white">
        <AdvertisementBar />
        <Navbar />
      </header>

      {/* Only this part changes on route change */}
      <main>{children}</main>
    </div>
  );
}
