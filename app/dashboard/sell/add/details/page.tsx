"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, ItemPayload } from "@/lib/api/items";

export default function DashboardSellAddDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams?.get("category") || "Laptop";
  const itemName = searchParams?.get("name") || "";

  const [basePrefix, setBasePrefix] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [askingPrice, setAskingPrice] = useState<string>("");
  const [condition, setCondition] = useState<string>("Good");
  const [description, setDescription] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBasePrefix(window.location.pathname.includes("/dashboard") ? "/dashboard" : "");
    }

    if (!itemName) router.replace(`${basePrefix}/sell/add`);
  }, [basePrefix, itemName, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr: string[] = [];
    const fileArr: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await fileToDataUrl(file);
      arr.push(dataUrl);
      fileArr.push(file);
    }
    setPhotos((p) => [...p, ...arr]);
    setFiles((f) => [...f, ...fileArr]);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const fileToDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const buildPayload = (): ItemPayload => ({
    category,
    phoneModel: itemName,
    itemName,
    year,
    deviceCondition: condition,
    description,
    price: Number(askingPrice),
    finalPrice: Number(askingPrice),
    photos,
  });

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let photoUrls: string[] = [];
      let sellerIdFromUpload: string | undefined;

      if (files.length > 0) {
        const uJson = await (await import("@/lib/api/items")).uploadPhotos(files);
        if (!uJson.success) throw new Error(uJson.message || "Upload failed");
        photoUrls = uJson.urls || [];
        sellerIdFromUpload = uJson.sellerId;
      }

      const payload = buildPayload();
      if (photoUrls.length) payload.photos = photoUrls;
      if (sellerIdFromUpload) payload.sellerId = sellerIdFromUpload;

      const res = await createItem(payload);
      setLoading(false);
      if (res?.success) {
        router.push(`${basePrefix}/sell`);
      } else {
        setMessage(res?.message || "Create failed");
      }
    } catch (err: unknown) {
      setLoading(false);
      setMessage(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm text-gray-500">Sell / SellStart / <span className="text-gray-700">Item Details</span></p>
      <h1 className="mt-4 text-3xl font-semibold text-blue-600">Set your listing price</h1>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-gray-600">Category</span>
            <input readOnly value={category} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-600">Item name</span>
            <input readOnly value={itemName} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-600">Asking price (NPR)</span>
            <input
              type="number"
              min="0"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="Enter your price"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-600">Item condition</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>For Parts</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-600">Year</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </label>
        </div>

        <div className="mt-6">
          <label className="block text-sm text-gray-700 mb-2">Upload the photos of your item.</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          <div className="mt-4 flex flex-wrap gap-3">
            {photos.map((p, idx) => (
              <div key={`${p}-${idx}`} className="relative">
                <img src={p} alt={`Selected photo ${idx + 1}`} className="h-24 w-24 rounded-lg border object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  aria-label={`Remove selected photo ${idx + 1}`}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-36 rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
            placeholder="Add storage, RAM, accessories included, cosmetic condition, and anything else buyers should know."
          />
        </div>

        <div className="mt-6 text-sm text-gray-600">This listing will use the price you enter here. No auto valuation is applied.</div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Link href="/dashboard/sell/add" className="px-6 py-3 border rounded-md text-blue-700">Cancel</Link>
        <div className="ml-auto flex items-center gap-4">
          <button onClick={handleSubmit} disabled={loading || !askingPrice.trim()} className="bg-blue-700 text-white px-8 py-3 rounded-md disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </div>

      {message && <div className="mt-4 text-sm text-red-600">{message}</div>}
    </div>
  );
}
