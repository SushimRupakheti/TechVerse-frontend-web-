import AdminLayout from "../users/AdminLayout";
import { getAdminJobs, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type Job = {
  _id: string;
  roleType?: string[];
  location?: string[];
  companyId?: string;
  companyName?: string;
  status?: string;
  pay?: number;
  job_date?: string;
};

type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] : value || fallback;
}

export default async function JobsPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const resolvedSearchParams =
    typeof searchParams === "object" && searchParams !== null && "then" in searchParams
      ? await searchParams
      : searchParams || {};

  const params = resolvedSearchParams as Record<string, string | string[] | undefined>;

  const page = Math.max(1, parseInt(readParam(params.page, "1"), 10) || 1);
  const limit = Math.max(1, parseInt(readParam(params.limit, "10"), 10) || 10);
  const search = readParam(params.search, "");
  const companyId = readParam(params.companyId, "");
  const status = readParam(params.status, "");
  const location = readParam(params.location, "");
  const roleType = readParam(params.roleType, "");
  const jobDateFrom = readParam(params.jobDateFrom, "");
  const jobDateTo = readParam(params.jobDateTo, "");

  const { jobs, error, meta } = await (async () => {
    try {
      const response = await getAdminJobs({
        page,
        limit,
        search,
        companyId,
        status,
        location,
        roleType,
        jobDateFrom,
        jobDateTo,
      });
      const normalized = normalizeAdminList<Job>(response);
      return {
        jobs: normalized.items || [],
        error: null as string | null,
        meta: normalized.meta || {} as { currentPage?: number; perPage?: number; total?: number; totalPages?: number },
      };
    } catch (caughtError: unknown) {
      return {
        jobs: [] as Job[],
        error: caughtError instanceof Error ? caughtError.message : "Failed to load jobs",
        meta: {} as { currentPage?: number; perPage?: number; total?: number; totalPages?: number },
      };
    }
  })();

  const currentPage = meta.currentPage ?? page;
  const perPage = meta.perPage ?? limit;
  const total = meta.total ?? jobs.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / perPage));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Management</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Jobs</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {jobs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No jobs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Pay</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {jobs.map((job: Job) => (
                      <tr key={job._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{job.roleType?.[0] || "Job"}</td>
                        <td className="px-6 py-4 text-slate-400">{job.location?.[0] || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{job.companyName || job.companyId || "-"}</td>
                        <td className="px-6 py-4">{job.status || "unknown"}</td>
                        <td className="px-6 py-4 text-slate-400">{job.pay ?? "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{job.job_date || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
