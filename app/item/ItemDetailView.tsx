"use client";

import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  handleAddToCart,
  handleRemoveCartItem,
} from "@/lib/actions/cart-action";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function normalizePhoto(src: any) {
  if (!src) return "/logo.png";

  const s = String(src).trim();

  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads")) return `${BASE_URL}${s}`;

  return s;
}

type Item = any;

function getId(value: unknown) {
  if (!value) return null;

  if (typeof value === "string") return value;
  if (typeof value !== "object") return null;

  const record = value as { _id?: string; id?: string };

  return record._id ?? record.id ?? null;
}

export default function ItemDetailView({
  item,
  currentUserId,
  initialCartItemId,
}: {
  item: Item;
  currentUserId?: string | null;
  initialCartItemId?: string | null;
}) {
  const router = useRouter();

  const photos = useMemo(() => {
    const raw: string[] =
      item?.photos && item.photos.length
        ? item.photos
        : ["/logo.png"];

    return raw.map((p) => normalizePhoto(p));
  }, [item]);

  const [selected, setSelected] = useState(0);

  const isLocalUrl = (u: string) =>
    u.includes("localhost") || u.includes("127.0.0.1");

  const formatNPR = (v: any) => {
    try {
      const n = Number(v) || 0;

      return n.toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return String(v);
    }
  };

  const safeSelected = Math.min(selected, Math.max(0, photos.length - 1));

  const mainCardRef = useRef<HTMLDivElement | null>(null);
  const [mainCardH, setMainCardH] = useState<number>(0);

  const rating = useMemo(() => {
    const f = Number(item?.finalPrice) || 0;
    const b = Number(item?.basePrice) || 0;

    if (!b) return 0;

    const r = (f / b) * 5;
    const rounded = Math.round(r * 10) / 10;

    return Math.max(0, Math.min(5, rounded));
  }, [item]);

  const ratingStars = useMemo(() => {
    const count = Math.round(rating);
    const full = Array.from({ length: count }, () => "★").join(" ");
    const empty = Array.from({ length: 5 - count }, () => "☆").join(" ");

    return (full + (empty ? " " + empty : "")).trim();
  }, [rating]);

  const title =
    item?.phoneModel || item?.itemName || item?.title || "Product Name";

  const productId = item?._id ?? item?.id;

  const sellerId =
  getId(item?.sellerId) ||
  getId(item?.seller) ||
  getId(item?.seller?._id) ||
  null;

const normalizedStatus = String(item?.status ?? "").trim().toLowerCase();

const isSold =
  item?.isSold === true ||
  normalizedStatus === "sold";

const isOwnItem = Boolean(
  currentUserId &&
    sellerId &&
    String(currentUserId) === String(sellerId)
);

const itemNotice = isSold ? "This item is marked as sold." : "";

  const [cartBusy, setCartBusy] = useState(false);
  const [cartItemId, setCartItemId] = useState(initialCartItemId ?? null);

  // Important fix:
  // Button state should not depend only on cartItemId,
  // because sometimes backend add response may not return cart item id clearly.
  const [isCartAdded, setIsCartAdded] = useState(Boolean(initialCartItemId));

  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState<"success" | "error">(
    "success"
  );

  const isInCart = isCartAdded;

  const cartButtonText = isOwnItem
    ? "Add to Cart"
    : cartBusy
      ? isInCart
        ? "Removing..."
          : "Adding..."
        : isInCart
          ? "Remove from Cart"
          : "Add to Cart";

  const handleCartClick = async () => {
    if (isOwnItem) {
      setCartMessageType("error");
      setCartMessage("You cannot add your own item to cart.");
      return;
    }

    if (!productId) {
      setCartMessageType("error");
      setCartMessage("Product id is missing.");
      return;
    }

    setCartBusy(true);
    setCartMessage("");

    try {
      if (isInCart) {
        if (!cartItemId) {
          setCartMessageType("error");
          setCartMessage(
            "This item is in your cart, but cart item id is missing. Please refresh the page."
          );
          setCartBusy(false);
          return;
        }

        const result = await handleRemoveCartItem(cartItemId);

        if (result.success) {
          setCartItemId(null);
          setIsCartAdded(false);
          router.refresh();
        }

        setCartMessageType(result.success ? "success" : "error");
        setCartMessage(
          result.message ||
            (result.success ? "Cart item removed" : "Failed to remove item")
        );

        setCartBusy(false);
        return;
      }

      const result = await handleAddToCart(String(productId));

      if (result.success) {
        const added: any = result.data;

        const newCartItemId =
          added?._id ||
          added?.cartItem?._id ||
          added?.data?._id ||
          null;

        setCartItemId(newCartItemId);
        setIsCartAdded(true);
        router.refresh();
      }

      setCartMessageType(result.success ? "success" : "error");
      setCartMessage(
        result.message ||
          (result.success ? "Product added to cart" : "Failed to add product")
      );
    } catch (error) {
      console.error("Cart action error:", error);

      setCartMessageType("error");
      setCartMessage("Something went wrong. Please try again.");
    } finally {
      setCartBusy(false);
    }
  };

  useEffect(() => {
    if (!mainCardRef.current) return;

    const el = mainCardRef.current;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      setMainCardH(Math.round(h));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-2">
      <Navbar />

      <div
        className="grid grid-cols-1 py-5 gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch"
        style={
          mainCardH
            ? ({ ["--mainCardH" as any]: `${mainCardH}px` } as any)
            : undefined
        }
      >
        {/* LEFT: GALLERY */}
        <div className="lg:col-span-1">
          <div className="grid gap-6 md:grid-cols-[96px_minmax(0,1fr)] md:items-stretch">
            {/* Thumbnails */}
            <div className="order-2 md:order-1">
              <div className="flex gap-3 md:flex-col md:gap-4 overflow-x-auto md:overflow-visible pb-1">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={[
                      "relative aspect-square w-20 md:w-24 shrink-0 overflow-hidden rounded-xl border bg-white",
                      "transition-all duration-200",
                      i === safeSelected
                        ? "border-blue-700 ring-2 ring-blue-700"
                        : "border-gray-200 hover:border-gray-400",
                    ].join(" ")}
                    aria-label={`Select photo ${i + 1}`}
                  >
                    <Image
                      src={p}
                      alt={`thumb-${i}`}
                      fill
                      className="object-cover"
                      unoptimized={isLocalUrl(p)}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image */}
            <div className="order-1 md:order-2">
              <div
                ref={mainCardRef}
                className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative w-full h-80 sm:h-44 md:h-120 flex items-center justify-center">
                  <div className="relative w-4/5 md:w-3/4 max-w-[28rem] aspect-square">
                    <Image
                      src={photos[safeSelected]}
                      alt={title}
                      fill
                      className="object-cover rounded-2xl"
                      unoptimized={isLocalUrl(photos[safeSelected])}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <aside className="lg:h-[var(--mainCardH)]">
          <div className="flex h-120 flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden">
            {/* Title + Price */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

              <p className="mt-2 text-lg font-bold text-gray-900">
                NPR {formatNPR(item?.finalPrice ?? item?.basePrice ?? 0)}
              </p>
            </div>

            {/* Rating Card */}
            <div className="mt-4 rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">Average Rating</p>
              <div className="mt-1 text-2xl font-bold">
                {rating.toFixed(1)}
              </div>
              <div className="text-yellow-500 text-sm mt-1">
                {ratingStars}
              </div>
            </div>

            {/* Device Condition Header */}
            <p className="mt-5 text-sm font-semibold text-gray-700">
              Device Condition
            </p>

            {/* Condition Grid */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* Screen */}
              <div className="flex items-center gap-3 rounded-2xl p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Image
                    src="/icons/icon8.png"
                    alt="screen"
                    width={30}
                    height={30}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Screen</p>
                  <p className="text-sm font-semibold">
                    {item?.deviceCondition || "Perfect"}
                  </p>
                </div>
              </div>

              {/* Battery */}
              <div className="flex items-center gap-3 rounded-2xl p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Image
                    src="/icons/icon9.png"
                    alt="battery"
                    width={30}
                    height={30}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Battery</p>
                  <p className="text-sm font-semibold">
                    {item?.batteryHealth ?? "--"}%
                  </p>
                </div>
              </div>

              {/* Camera */}
              <div className="flex items-center gap-3 rounded-2xl p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <Image
                    src="/icons/icon10.png"
                    alt="camera"
                    width={30}
                    height={30}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Camera</p>
                  <p className="text-sm font-semibold">
                    {item?.cameraCondition ? "Excellent" : "Check"}
                  </p>
                </div>
              </div>

              {/* Charger */}
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Image
                    src="/icons/icon11.png"
                    alt="charger"
                    width={30}
                    height={30}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Charger</p>
                  <p className="text-sm font-semibold">
                    {item?.chargerAvailable ? "Original" : "Not Included"}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-auto pt-5 flex gap-3">
              <button
                type="button"
                disabled={isOwnItem}
                onClick={() => {
                  if (!isOwnItem) {
                    router.push(`/booking/${productId ?? ""}`);
                  }
                }}
                className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                title={
                  isOwnItem
                    ? "You cannot book your own item"
                    : "Book this item"
                }
              >
                Book Now
              </button>

              <button
                type="button"
                disabled={cartBusy || isOwnItem}
                onClick={handleCartClick}
                className="flex-1 rounded-xl border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                title={
                  isOwnItem
                    ? "This item is listed by you"
                    : isInCart
                        ? "Remove this item from cart"
                        : "Add this item to cart"
                }
              >
                {cartButtonText}
              </button>
            </div>

            {isOwnItem && (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                This item is listed by you.
              </p>
            )}

            {!isOwnItem && itemNotice && (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {itemNotice}
              </p>
            )}

            {!isOwnItem && isInCart && (
              <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                This item is already in your cart.
              </p>
            )}

            {cartMessage && (
              <p
                className={`mt-3 rounded-md px-3 py-2 text-xs ${
                  cartMessageType === "success"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {cartMessage}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* DESCRIPTION */}
      <section className="mt-10 border-t pt-7">
        <h3 className="text-xl font-semibold text-gray-900">Description</h3>

        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {item?.description || "No description provided."}
        </p>
      </section>
    </div>
  );
}
