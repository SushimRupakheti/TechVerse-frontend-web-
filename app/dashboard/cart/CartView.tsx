"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  type CartData,
  type CartItem,
  handleRemoveCartItem,
} from "@/lib/actions/cart-action";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function formatNPR(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(n);
}

function normalizePhoto(src: unknown) {
  if (!src) return "/logo.png";
  const value = String(src).trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${BASE_URL}${value}`;
  return value;
}

function getProduct(item: CartItem) {
  return typeof item.productId === "object" && item.productId ? item.productId : null;
}

export default function CartView({
  initialCart,
  initialError,
}: {
  initialCart: CartData;
  initialError: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialError ?? "");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = useMemo(() => initialCart.items ?? [], [initialCart.items]);
  const computedTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = getProduct(item);
        return sum + Number(item.priceAtTime ?? product?.finalPrice ?? product?.price ?? 0);
      }, 0),
    [items]
  );

  const totalPrice = Number(initialCart.totalPrice ?? computedTotal);

  const removeItem = (id: string) => {
    setMessage("");
    setRemovingId(id);

    startTransition(async () => {
      const result = await handleRemoveCartItem(id);

      if (!result.success) {
        setMessage(result.message || "Failed to remove cart item");
        setRemovingId(null);
        return;
      }

      setMessage(result.message || "Cart item removed");
      setRemovingId(null);
      router.refresh();
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Shopping Cart
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Your cart</h1>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue shopping
        </Link>
      </div>

      {message && (
        <div
          className={`mt-6 rounded-md border px-4 py-3 text-sm ${
            message.toLowerCase().includes("failed") || message.toLowerCase().includes("login")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {!items.length ? (
        <section className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700/10">
            <ShoppingBag className="h-7 w-7 text-teal-700" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Items you add from product details will appear here with their saved cart price.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4">
            {items.map((item) => {
              const product = getProduct(item);
              const productId =
                typeof item.productId === "string" ? item.productId : product?._id ?? product?.id;
              const title = product?.phoneModel || product?.itemName || "Cart item";
              const price = item.priceAtTime ?? product?.finalPrice ?? product?.price ?? 0;
              const imageUrl = normalizePhoto(product?.photos?.[0]);
              const isLocalImage =
                imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1");

              return (
                <article
                  key={item._id}
                  className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[112px_minmax(0,1fr)_auto]"
                >
                  <Link
                    href={productId ? `/item/${productId}` : "/dashboard"}
                    className="relative aspect-square overflow-hidden rounded-md bg-gray-100"
                  >
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover"
                      unoptimized={isLocalImage}
                      sizes="112px"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={productId ? `/item/${productId}` : "/dashboard"}
                      className="text-base font-semibold text-gray-900 hover:text-teal-700"
                    >
                      {title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {product?.category || product?.status || "Product"}
                    </p>
                    {product?.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-3 text-sm font-semibold text-gray-900">
                      NPR {formatNPR(price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isPending && removingId === item._id}
                    onClick={() => removeItem(item._id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Remove ${title} from cart`}
                    title="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Order summary</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>NPR {formatNPR(totalPrice)}</span>
              </div>
            </div>

            <p className="mt-6 rounded-md bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
              Open an item to book it when you are ready.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
