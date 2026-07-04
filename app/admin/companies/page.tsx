import AdminLayout from "../users/AdminLayout";
import { getAdminCompanies, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type Company = {
  _id: string;
  companyName?: string;
  email?: string;
  contactNo?: string;
  status?: string;
  createdAt?: string;
};

type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] : value || fallback;
}

export default async function CompaniesPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const resolvedSearchParams =
    typeof searchParams === "object" && searchParams !== null && "then" in searchParams
      ? await searchParams
      : searchParams || {};

  const params = resolvedSearchParams as Record<string, string | string[] | undefined>;
  const page = Math.max(1, parseInt(readParam(params.page, "1"), 10) || 1);
  const limit = Math.max(1, parseInt(readParam(params.limit, "10"), 10) || 10);
  const search = readParam(params.search, "");
  const status = readParam(params.status, "");

  const { companies, error, meta } = await (async () => {
    try {
      const response = await getAdminCompanies({ page, limit, search, status });
      const normalized = normalizeAdminList<Company>(response);
      return {
        companies: normalized.items || [],
        error: null as string | null,
        meta: normalized.meta || {} as { currentPage?: number; perPage?: number; total?: number; totalPages?: number },
      };
    } catch (caughtError: unknown) {
      return {
        companies: [] as Company[],
        error: caughtError instanceof Error ? caughtError.message : "Failed to load companies",
        meta: {} as { currentPage?: number; perPage?: number; total?: number; totalPages?: number },
      };
    }
  })();

  const currentPage = meta.currentPage ?? page;
  const perPage = meta.perPage ?? limit;
  const total = meta.total ?? companies.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / perPage));

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(perPage));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return `/admin/companies?${params.toString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Management</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Companies</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {companies.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No companies found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {companies.map((company: Company) => (
                      <tr key={company._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{company.companyName || "Company"}</td>
                        <td className="px-6 py-4 text-slate-400">{company.email || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{company.contactNo || "-"}</td>
                        <td className="px-6 py-4">{company.status || "unknown"}</td>
                        <td className="px-6 py-4 text-slate-400">{company.createdAt || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3">
            <a href={buildHref(Math.max(1, currentPage - 1))} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">Prev</a>
            <div className="text-sm text-slate-400">Page {currentPage} of {totalPages}</div>
            <a href={buildHref(Math.min(totalPages, currentPage + 1))} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">Next</a>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
