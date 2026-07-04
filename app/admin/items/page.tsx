import AdminLayout from "../users/AdminLayout";
import ItemActions from "./_components/ItemActions";
import { getAdminItems, normalizeAdminList } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

type ItemRow = {
  _id: string;
  itemName?: string;
  phoneModel?: string;
  category?: string;
  sellerId?: string | { _id?: string; firstName?: string; lastName?: string; email?: string };
  status?: string;
  price?: number;
  finalPrice?: number;
};

function getSellerLabel(seller: ItemRow["sellerId"]) {
  if (!seller) return "-";
  if (typeof seller === "string") return seller;
  const firstName = seller.firstName || "";
  const lastName = seller.lastName || "";
  const name = `${firstName} ${lastName}`.trim();
  return name || seller.email || seller._id || "Seller";
}

export default async function ItemsPage({ searchParams }: { searchParams?: { page?: string | string[] } | Promise<{ page?: string | string[] }> }) {
  const resolved = typeof searchParams === "object" && searchParams !== null && "then" in searchParams ? await searchParams : searchParams || {};
  const pageValue = Array.isArray(resolved.page) ? resolved.page[0] : resolved.page || "1";
  const page = Math.max(1, parseInt(pageValue, 10) || 1);

  let items: ItemRow[] = [];
  let error: string | null = null;
  let totalPages = 1;
  let currentPage = page;

  try {
    const response = await getAdminItems({ page });
    const normalized = normalizeAdminList<ItemRow>(response);
    items = normalized.items || [];
    currentPage = normalized.meta?.currentPage ?? page;
    totalPages = normalized.meta?.totalPages ?? 1;
  } catch (caughtError: unknown) {
    error = caughtError instanceof Error ? caughtError.message : "Failed to load items";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Items</h1>
            <p className="mt-2 text-sm text-slate-400">Review and moderate marketplace items.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
            {items.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No items found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{item.itemName || item.phoneModel || item._id}</td>
                        <td className="px-6 py-4 text-slate-400">{item.category || "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{getSellerLabel(item.sellerId)}</td>
                        <td className="px-6 py-4 text-slate-400">{item.finalPrice ?? item.price ?? "-"}</td>
                        <td className="px-6 py-4 text-slate-400">{item.status || "pending"}</td>
                        <td className="px-6 py-4"><ItemActions id={item._id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && <div className="text-right text-sm text-slate-400">Page {currentPage} of {totalPages}</div>}
      </div>
    </AdminLayout>
  );
}
