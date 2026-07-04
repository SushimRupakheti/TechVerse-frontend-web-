"use client";

import AdminLayout from "../../../users/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

export default function ItemEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [form, setForm] = useState<Record<string, string>>({
    itemName: "",
    phoneModel: "",
    category: "",
    price: "",
    finalPrice: "",
    status: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`/api/admin/items/${id}`, { credentials: "include" });
      const data = await res.json().catch(() => null);
      const item = data?.data || data;
      setForm({
        itemName: item?.itemName || "",
        phoneModel: item?.phoneModel || "",
        category: item?.category || "",
        price: item?.price != null ? String(item.price) : "",
        finalPrice: item?.finalPrice != null ? String(item.finalPrice) : "",
        status: item?.status || "",
        description: item?.description || "",
      });
    };
    load();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        itemName: form.itemName || undefined,
        phoneModel: form.phoneModel || undefined,
        category: form.category || undefined,
        price: form.price ? Number(form.price) : undefined,
        finalPrice: form.finalPrice ? Number(form.finalPrice) : undefined,
        status: form.status || undefined,
        description: form.description || undefined,
      };
      const res = await fetch(`/api/admin/items/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update item");
      router.push(`/admin/items/${id}`);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
        <h1 className="text-2xl font-semibold text-white">Edit Item</h1>
        {error ? <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200">{error}</div> : null}
        {[
          ["itemName", "Item name"],
          ["phoneModel", "Phone model"],
          ["category", "Category"],
          ["price", "Price"],
          ["finalPrice", "Final price"],
          ["status", "Status"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="mb-1 block text-sm text-slate-300">{label}</label>
            <input name={name} value={form[name]} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm text-slate-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="min-h-32 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </div>
        <button disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </AdminLayout>
  );
}
