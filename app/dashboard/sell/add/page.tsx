"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardSellAddPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("Laptop");
  const [itemName, setItemName] = useState<string>("");

  const categories = [
    "Laptop",
    "Desktop PC",
    "Monitor",
    "PC Component",
    "Accessory",
    "Graphics Card",
    "Processor",
    "Motherboard",
    "RAM",
    "Storage",
    "Monitor",
    "Accessories",
  ];

  const goNext = () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    router.push(
      `/dashboard/sell/add/details?category=${encodeURIComponent(category)}&name=${encodeURIComponent(trimmedName)}`
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">
        <p className="text-sm text-gray-500">Sell / SellStart / <span className="text-gray-700">Item Details</span></p>
        <h1 className="text-3xl font-semibold text-blue-600 mt-4">List your laptop or computer item</h1>
        <p className="text-gray-600 mt-2">Add the item name and category, then continue to set your own asking price.</p>
      </div>

      <div className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Item name</span>
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Dell Latitude 7420, MacBook Air M2, RTX 3060 card..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/dashboard/sell" className="px-6 py-3 border rounded-md text-blue-700">Cancel</Link>
        <button
          onClick={goNext}
          className="ml-auto bg-blue-700 text-white px-8 py-3 rounded-md"
          disabled={!itemName.trim()}
        >
          Next
        </button>
      </div>
    </div>
  );
}
