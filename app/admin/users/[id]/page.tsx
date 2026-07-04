import AdminLayout from "../AdminLayout";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin/api";
import UserActions from "../_components/UserActions";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const response = await getAdminUser(id);
    const data = isRecord(response) && isRecord(response.data) ? response.data : response;
    user = isRecord(data) ? data : null;
  } catch (caughtError: unknown) {
    error = caughtError instanceof Error ? caughtError.message : "Failed to load user";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">User</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">User Detail</h1>
          </div>
          <Link href="/admin/users" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Back</Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : user ? (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{asString(user.firstName)} {asString(user.lastName)}</h2>
                <p className="mt-1 text-sm text-slate-400">{asString(user.email)}</p>
              </div>
              <UserActions id={id} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["First name", user.firstName],
                ["Last name", user.lastName],
                ["Email", user.email],
                ["Contact number", user.contactNo],
                ["Address", user.address],
                ["Role", user.role],
                ["Status", user.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm text-slate-200">{String(value ?? "-")}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
