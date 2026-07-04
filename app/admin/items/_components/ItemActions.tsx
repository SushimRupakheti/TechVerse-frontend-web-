"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ItemActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: "approved" | "rejected") => {
    try {
      setLoading(status);
      await fetch(`/api/admin/items/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const removeItem = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      setLoading("delete");
      await fetch(`/api/admin/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link href={`/admin/items/${id}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
        View
      </Link>
      <Link href={`/admin/items/${id}/edit`} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
        Edit
      </Link>
      <button disabled={loading !== null} onClick={() => updateStatus("approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-50">
        {loading === "approved" ? "..." : "Approve"}
      </button>
      <button disabled={loading !== null} onClick={() => updateStatus("rejected")} className="rounded-lg bg-amber-600 px-3 py-2 text-xs text-white disabled:opacity-50">
        {loading === "rejected" ? "..." : "Reject"}
      </button>
      <button disabled={loading !== null} onClick={removeItem} className="rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-50">
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
