import AdminLayout from "../users/AdminLayout";
import Link from "next/link";
import { getAdminPayments, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type PaymentRow = {
  _id: string;
  amount?: number;
  status?: string;
  method?: string;
  createdAt?: string;
  userId?: string;
  itemId?: string;
};

export default async function PaymentsPage({ searchParams }: { searchParams?: { page?: string | string[]; limit?: string | string[] } | Promise<{ page?: string | string[]; limit?: string | string[] }> }) {
  const resolved = typeof searchParams === "object" && searchParams !== null && "then" in searchParams ? await searchParams : searchParams || {};
  const page = Math.max(1, parseInt(Array.isArray(resolved.page) ? resolved.page[0] : resolved.page || "1", 10) || 1);
  const limit = Math.max(1, parseInt(Array.isArray(resolved.limit) ? resolved.limit[0] : resolved.limit || "10", 10) || 10);

  let payments: PaymentRow[] = [];
  let error: string | null = null;

  try {
    const response = await getAdminPayments({ page, limit });
    payments = normalizeAdminList<PaymentRow>(response).items || [];
  } catch (caughtError: unknown) {
    error = caughtError instanceof Error ? caughtError.message : "Failed to load payments";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Finance</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Payments</h1>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{payment._id}</td>
                      <td className="px-6 py-4 text-slate-400">{payment.amount ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-400">{payment.status ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-400">{payment.method ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-400">{payment.createdAt ?? "-"}</td>
                      <td className="px-6 py-4 text-right"><Link href={`/admin/payments/${payment._id}`} className="text-cyan-300 hover:text-cyan-200">Details</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
