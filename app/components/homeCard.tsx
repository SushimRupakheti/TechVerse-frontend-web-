"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

type HomeCardProps = {
  item: Record<string, unknown>;
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

export default function HomeCard({ item }: HomeCardProps) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const photos = Array.isArray(item.photos) ? item.photos : [];
  const rawPhoto = photos[0];
  const photo = rawPhoto ? String(rawPhoto).trim() : "";
  const imageUrl = photo
    ? photo.startsWith("http")
      ? photo
      : photo.startsWith("/uploads")
        ? `${BASE_URL}${photo}`
        : photo
    : "/logo.png";

  const isLocalImage =
    typeof imageUrl === "string" &&
    (imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1"));

  const finalPrice = item.finalPrice ?? item.final_price ?? item.price;
  const basePrice = item.basePrice ?? item.base_price;
  const rating = calcRating(basePrice, finalPrice);

  const base = Number(basePrice);
  const finalP = Number(finalPrice);
  const hasDiscount =
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(finalP) &&
    finalP > 0 &&
    finalP < base;

  const discountPct = hasDiscount ? Math.round(((base - finalP) / base) * 100) : 0;

  const storage =
    item.storage ??
    item.storageGb ??
    item.storageGB ??
    item.capacity ??
    item.ramStorage ??
    null;

  const subtitleParts = [
    item.deviceCondition ?? item.category ?? null,
    storage ? `${storage} GB` : null,
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" / ");

  const title = String(
    item.phoneModel || item.itemName || item.title || "Unknown Item"
  );

  const year = item.year ?? "Ready";

  const rawId = item._id ?? item.id ?? null;
  const id =
    rawId && String(rawId) !== "undefined" && String(rawId) !== "null"
      ? String(rawId)
      : null;

  const card = (
    <div className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_45px_rgba(37,99,235,0.14)]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
          unoptimized={isLocalImage}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-full bg-blue-700 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            -{discountPct}%
          </div>
        )}

        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition group-hover:text-blue-700">
          <Heart className="h-4 w-4" />
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold text-slate-950">{title}</p>

        {subtitle ? (
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        ) : (
          <div className="mt-1 h-4" />
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-base font-extrabold text-slate-950">
            NPR {formatNPR(finalPrice)}
          </p>

          {hasDiscount && (
            <p className="text-xs text-slate-400 line-through">
              NPR {formatNPR(basePrice)}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">{rating}</span>
          </div>

          <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
            {String(year)}
          </span>
        </div>
      </div>
    </div>
  );

  if (!id) return card;

  return (
    <Link href={`/item/${id}`} className="block">
      {card}
    </Link>
  );
}
