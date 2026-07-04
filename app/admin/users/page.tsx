import AdminLayout from "./AdminLayout";
import UserActions from "./_components/UserActions";
import Link from "next/link";
import { getAdminUsers, normalizeAdminList } from "@/lib/admin/api";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

type SearchParamsValue = string | string[] | undefined;
type SearchParamsInput =
  | Record<string, SearchParamsValue>
  | Promise<Record<string, SearchParamsValue>>;

function readParam(value: SearchParamsValue, fallback: string) {
  return Array.isArray(value) ? value[0] : value || fallback;
}

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const resolvedSearchParams =
    typeof searchParams === "object" && searchParams !== null && "then" in searchParams
      ? await searchParams
      : searchParams || {};

  const page = Math.max(1, parseInt(readParam(resolvedSearchParams?.page, "1"), 10) || 1);
  const limit = Math.max(1, parseInt(readParam(resolvedSearchParams?.limit, "10"), 10) || 10);
  const search = readParam(resolvedSearchParams?.search, "");
  const role = readParam(resolvedSearchParams?.role, "");
  const status = readParam(resolvedSearchParams?.status, "");
  const dateFrom = readParam(resolvedSearchParams?.dateFrom, "");
  const dateTo = readParam(resolvedSearchParams?.dateTo, "");

  const response = await getAdminUsers({ page, limit, search, role, status, dateFrom, dateTo });
  const normalized = normalizeAdminList<User>(response);
  const users = normalized.items || [];
  const meta = normalized.meta || {};
  const currentPage = meta.currentPage ?? page;
  const perPage = meta.perPage ?? limit;
  const total = meta.total ?? users.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / perPage));

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(perPage));
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/admin/users?${params.toString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Users</h1>
            <p className="mt-2 text-sm text-slate-400">
              Search and manage users from the admin API.
            </p>
          </div>

          <Link
            href="/admin/users/create"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Create User
          </Link>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Total: {total}</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Page: {currentPage} / {totalPages}</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Limit: {perPage}</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Role filter: {role || "all"}</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Status filter: {status || "all"}</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Search: {search || "-"}</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          {users.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-white">
                        {user.firstName || ""} {user.lastName || ""}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                          {user.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <UserActions id={user._id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3">
            <Link
              href={buildHref(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={`rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
            >
              Prev
            </Link>
            <div className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <Link
              href={buildHref(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className={`rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
