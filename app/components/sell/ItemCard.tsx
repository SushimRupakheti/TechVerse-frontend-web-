"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";

type SellItem = Record<string, unknown> & {
  _id?: string;
  id?: string;
  photos?: unknown[];
};

type ItemCardProps = {
  item: SellItem;
  onDelete?: (id: string) => void;
  deleting?: boolean;
};

function calcRating(basePrice: unknown, finalPrice: unknown) {
  const base = Number(basePrice);
  const finalP = Number(finalPrice);

  if (!Number.isFinite(base) || base <= 0) return 0;

  let rating = (finalP / base) * 5;
  if (!Number.isFinite(rating)) rating = 0;

  rating = Math.max(0, Math.min(5, rating));
  return Number(rating.toFixed(1));
}

function formatNPR(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(n);
}

function normalizeImageUrl(photo: string, baseUrl: string) {
  if (!photo) return "/new_logo.png";
  if (photo.startsWith("/api/uploads")) return photo;
  if (photo.startsWith("/uploads")) return `${baseUrl}${photo}`;
  if (photo.startsWith("/") && !photo.startsWith("//")) return photo;

  try {
    const url = new URL(photo);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    // Fall through to the safe fallback.
  }

  return "/new_logo.png";
}

function getStatusBadge(statusValue: unknown) {
  const status = String(statusValue || "pending").trim().toLowerCase();

  if (status === "approved") {
    return {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-700 ring-1 ring-red-200",
    };
  }

  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
}

export default function ItemCard({ item, onDelete, deleting = false }: ItemCardProps) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const rawPhoto = item.photos?.[0];
  const photo = rawPhoto ? String(rawPhoto).trim() : "";
  const imageUrl = normalizeImageUrl(photo, BASE_URL);

  const isLocalImage =
    typeof imageUrl === "string" &&
    (imageUrl.includes("localhost") ||
      imageUrl.includes("127.0.0.1") ||
      imageUrl.startsWith("/api/uploads"));

  const finalPrice = item.finalPrice ?? item.final_price ?? item.price;
  const basePrice = item.basePrice ?? item.base_price;
  const rating = calcRating(basePrice, finalPrice);

  const storage =
    item.storage ??
    item.storageGb ??
    item.storageGB ??
    item.capacity ??
    item.ramStorage ??
    null;

  const subtitleParts = [item.deviceCondition ?? item.category ?? null, storage ? `${storage} GB` : null].filter(Boolean);
  const subtitle = subtitleParts.join(" • ");

  const title = String(item.phoneModel || item.itemName || item.title || "Unknown Item");

  const year = item.year === null || item.year === undefined ? "-" : String(item.year);
  const statusBadge = getStatusBadge(item.status);

  const rawId = item._id ?? item.id ?? null;
  const id = rawId && String(rawId) !== "undefined" && String(rawId) !== "null" ? String(rawId) : null;

  const card = (
    <div className="group rounded-xl border border-gray-200 bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          unoptimized={isLocalImage}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* simplified: no discount badge */}
      </div>

      {/* Content */}
      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[12.5px] font-semibold text-gray-900">
            {title}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>

        {subtitle ? (
          <p className="mt-0.5 truncate text-[10.5px] text-gray-500">{subtitle}</p>
        ) : (
          <div className="mt-0.5 h-3" />
        )}

        <div className="mt-2">
          <p className="text-[14px] font-extrabold text-gray-900">NPR {formatNPR(finalPrice)}</p>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10.5px] text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
            <span className="font-medium text-gray-700">{rating}</span>
          </div>

          <span className="font-medium text-gray-600">{year}</span>
        </div>
      </div>
      </div>
  );

  const deleteButton =
    id && onDelete ? (
      <button
        type="button"
        disabled={deleting}
        onClick={() => onDelete(id)}
        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {deleting ? "Deleting..." : "Delete"}
      </button>
    ) : null;

  if (!id) {
    return (
      <div>
        {card}
        {deleteButton}
      </div>
    );
  }

  const href = `/item/${id}`;
  return (
    <div>
      <Link href={href} className="block">
        {card}
      </Link>
      {deleteButton}
    </div>
  );
}
