import AdminLayout from "../../users/AdminLayout";
import { getAdminPayment } from "@/lib/admin/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let payment: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const response = await getAdminPayment(id);
    const data = isRecord(response) && isRecord(response.data) ? response.data : response;
    payment = isRecord(data) ? data : null;
  } catch (caughtError: unknown) {
    error = caughtError instanceof Error ? caughtError.message : "Failed to load payment";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Payment Detail</h1>
          <Link href="/admin/payments" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Back</Link>
        </div>
        {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div> : null}
        {payment ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-sm text-slate-200">
            <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(payment, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
