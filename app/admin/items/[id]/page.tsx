import AdminLayout from "../../users/AdminLayout";
import Link from "next/link";
import { getAdminItem } from "@/lib/admin/api";
import ItemActions from "../_components/ItemActions";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSellerLabel(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "-";

  const firstName = typeof value.firstName === "string" ? value.firstName : "";
  const lastName = typeof value.lastName === "string" ? value.lastName : "";
  const email = typeof value.email === "string" ? value.email : "";
  const id = typeof value._id === "string" ? value._id : "";
  const name = `${firstName} ${lastName}`.trim();
  return name || email || id || "Seller";
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const response = await getAdminItem(id);
    const data = isRecord(response) && isRecord(response.data) ? response.data : response;
    item = isRecord(data) ? data : null;
  } catch (caughtError: unknown) {
    error = caughtError instanceof Error ? caughtError.message : "Failed to load item";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Item</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Item Detail</h1>
          </div>
          <Link href="/admin/items" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Back</Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : item ? (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{String(item.itemName ?? item.phoneModel ?? "Item")}</h2>
                <p className="mt-1 text-sm text-slate-400">{String(item.category ?? "Unknown category")}</p>
              </div>
              <ItemActions id={id} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Seller", getSellerLabel(item.sellerId)],
                ["Price", item.price ?? item.finalPrice],
                ["Status", item.status],
                ["Condition", item.deviceCondition],
                ["Year", item.year],
                ["Description", item.description],
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
