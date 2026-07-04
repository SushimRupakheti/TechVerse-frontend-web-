import AdminLayout from "../users/AdminLayout";
import { getAdminAuditLogs, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type AuditLogRow = {
  _id: string;
  adminId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  timestamp?: string;
  oldValue?: unknown;
  newValue?: unknown;
};

async function loadAuditLogs() {
  try {
    const response = await getAdminAuditLogs();
    const normalized = normalizeAdminList<AuditLogRow>(response);
    return {
      logs: normalized.items || [],
      error: null as string | null,
    };
  } catch (caughtError: unknown) {
    return {
      logs: [] as AuditLogRow[],
      error: caughtError instanceof Error ? caughtError.message : "Failed to load audit logs",
    };
  }
}

export default async function AuditLogsPage() {
  const { logs, error } = await loadAuditLogs();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Compliance</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Audit Logs</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No audit logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Admin</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {logs.map((log: AuditLogRow) => (
                      <tr key={log._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{log.adminId || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{log.action || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{log.targetType || "-"} {log.targetId ? `#${log.targetId}` : ""}</td>
                        <td className="px-6 py-4 text-slate-400">{log.reason || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{log.timestamp || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
