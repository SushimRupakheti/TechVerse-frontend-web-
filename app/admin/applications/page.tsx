import AdminLayout from "../users/AdminLayout";
import { getAdminApplications, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  _id: string;
  jobId?: string;
  workerId?: string;
  status?: string;
  createdAt?: string;
};

async function loadApplications() {
  try {
    const response = await getAdminApplications();
    const normalized = normalizeAdminList<ApplicationRow>(response);
    return {
      applications: normalized.items || [],
      error: null as string | null,
    };
  } catch (caughtError: unknown) {
    return {
      applications: [] as ApplicationRow[],
      error: caughtError instanceof Error ? caughtError.message : "Failed to load applications",
    };
  }
}

export default async function ApplicationsPage() {
  const { applications, error } = await loadApplications();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Review</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Applications</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {applications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Job</th>
                      <th className="px-6 py-4">Worker</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {applications.map((application: ApplicationRow) => (
                      <tr key={application._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{application.jobId || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{application.workerId || "-"}</td>
                        <td className="px-6 py-4">{application.status || "pending"}</td>
                        <td className="px-6 py-4 text-slate-400">{application.createdAt || "-"}</td>
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
