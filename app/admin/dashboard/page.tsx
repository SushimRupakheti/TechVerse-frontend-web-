import AdminLayout from "../users/AdminLayout";
import Link from "next/link";
import { getAdminItems, getAdminPayments, getAdminUsers, normalizeAdminList } from "@/lib/admin/api";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type StatCardProps = {
  label: string;
  value: number;
  accent: string;
};

type RecentRow = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  status?: string;
  createdAt?: string;
  itemName?: string;
  phoneModel?: string;
  amount?: number;
  method?: string;
};

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <div className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRows(payload: unknown) {
  if (isRecord(payload)) {
    const data = payload.data;
    if (Array.isArray(data)) return data;
    const items = payload.items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

export default async function AdminDashboardPage() {
  const [usersRes, itemsRes, paymentsRes] = await Promise.all([
    getAdminUsers({ page: 1 }),
    getAdminItems({ page: 1 }),
    getAdminPayments({ page: 1, limit: 10 }),
  ]);

  const usersPayload = normalizeAdminList<RecentRow>(usersRes);
  const itemsPayload = normalizeAdminList<RecentRow>(itemsRes);
  const paymentsPayload = normalizeAdminList<RecentRow>(paymentsRes);

  const totalUsers = toNumber(usersPayload.meta?.total ?? usersPayload.items.length);
  const totalItems = toNumber(itemsPayload.meta?.total ?? itemsPayload.items.length);
  const totalPayments = toNumber(paymentsPayload.meta?.total ?? paymentsPayload.items.length);

  const recentUsers = asRows(usersRes).slice(0, 5) as RecentRow[];
  const recentItems = asRows(itemsRes).slice(0, 5) as RecentRow[];
  const recentPayments = asRows(paymentsRes).slice(0, 5) as RecentRow[];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Overview</p>
          <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Manage users, items, payments, and notifications from a single panel.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Users" value={totalUsers} accent="text-cyan-300" />
          <StatCard label="Total Items" value={totalItems} accent="text-emerald-300" />
          <StatCard label="Total Payments" value={totalPayments} accent="text-amber-300" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Recent users">
            <div className="space-y-3">
              {recentUsers.length ? recentUsers.map((user) => (
                <div key={user._id || user.id || user.email} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{user.name || user.email || "User"}</p>
                  <p className="text-sm text-slate-400">{user.status || user.createdAt || "recent"}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No users yet.</p>}
            </div>
          </SectionCard>

          <SectionCard title="Recent items">
            <div className="space-y-3">
              {recentItems.length ? recentItems.map((item) => (
                <div key={item._id || item.id || item.itemName || item.phoneModel} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{item.itemName || item.phoneModel || "Item"}</p>
                  <p className="text-sm text-slate-400">{item.status || item.createdAt || "recent"}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No items yet.</p>}
            </div>
          </SectionCard>

          <SectionCard title="Recent payments">
            <div className="space-y-3">
              {recentPayments.length ? recentPayments.map((payment) => (
                <div key={payment._id || payment.id || payment.createdAt} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{payment.amount != null ? `Rs ${payment.amount}` : "Payment"}</p>
                  <p className="text-sm text-slate-400">{payment.method || payment.createdAt || "recent"}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No payments yet.</p>}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Manage users</Link>
          <Link href="/admin/items" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Manage items</Link>
          <Link href="/admin/payments" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">View payments</Link>
          <Link href="/admin/notifications" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Send notification</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
