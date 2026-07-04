import React, { ReactNode } from "react";
import Link from "next/link";
import AdminLogoutButton from "./_components/AdminLogoutButton";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-950/95 px-6 py-8 lg:flex lg:flex-col">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Admin Panel</h2>
            <p className="mt-2 text-sm text-slate-400">
              Manage users, items, payments, and notifications.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            {[
              ["/admin/dashboard", "Dashboard"],
              ["/admin/users", "Users"],
              ["/admin/items", "Items"],
              ["/admin/payments", "Payments"],
              ["/admin/notifications", "Notifications"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-transparent px-4 py-3 text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6 text-sm text-slate-500 space-y-3">
            <AdminLogoutButton />
            <div>© {new Date().getFullYear()} Hireasy</div>
          </div>
        </aside>

        <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(180deg,_rgba(2,6,23,0)_0%,_rgba(2,6,23,0.35)_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
