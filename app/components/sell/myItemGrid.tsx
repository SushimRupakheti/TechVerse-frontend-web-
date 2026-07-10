"use client";

import { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import { deleteItem, getItemsBySeller } from "@/lib/api/items";
import { getAuthUser } from "@/lib/actions/auth-action";

type SellItem = Record<string, unknown> & {
  _id?: string;
  id?: string;
};

export default function MyItemsGrid() {
  const [items, setItems] = useState<SellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      try {
        const user = await getAuthUser();
        if (!user?.id) return;

        const res = await getItemsBySeller(user.id);

        if (res.success) {
          setItems(res.items || []); 
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this item? This action cannot be undone.");
    if (!confirmed) return;

    setMessage("");
    setDeletingId(id);

    try {
      const res = await deleteItem(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete item");
      }

      setItems((currentItems) =>
        currentItems.filter((item) => String(item._id ?? item.id) !== id)
      );
      setMessage(res.message || "Item deleted successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading items...</p>;
  }

  if (!items.length) {
    return <p className="text-center py-10">No items posted yet</p>;
  }

  return (
    <>
      {message ? (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            message.toLowerCase().includes("fail")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const id = String(item._id ?? item.id ?? "");

          return (
            <ItemCard
              key={id}
              item={item}
              onDelete={handleDelete}
              deleting={deletingId === id}
            />
          );
        })}
      </div>
    </>
  );
}
