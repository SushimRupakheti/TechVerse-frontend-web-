import AdminLayout from "../users/AdminLayout";
import { getAdminDocuments, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type DocumentRow = {
  _id: string;
  userId?: string;
  email?: string;
  status?: string;
  createdAt?: string;
  documentType?: string;
};

async function loadDocuments() {
  try {
    const response = await getAdminDocuments();
    const normalized = normalizeAdminList<DocumentRow>(response);
    return {
      documents: normalized.items || [],
      error: null as string | null,
    };
  } catch (caughtError: unknown) {
    return {
      documents: [] as DocumentRow[],
      error: caughtError instanceof Error ? caughtError.message : "Failed to load pending documents",
    };
  }
}

export default async function DocumentsPage() {
  const { documents, error } = await loadDocuments();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Verification</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Documents</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {documents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No pending documents found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Document</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {documents.map((document: DocumentRow) => (
                      <tr key={document._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{document.email || document.userId || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{document.documentType || "Identity document"}</td>
                        <td className="px-6 py-4">{document.status || "pending"}</td>
                        <td className="px-6 py-4 text-slate-400">{document.createdAt || "-"}</td>
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
