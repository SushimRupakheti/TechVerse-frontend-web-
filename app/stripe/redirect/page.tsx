"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type OrderData = {
  oid?: string;
  amt?: string | number;
  refId?: string;
  sellerId?: string;
  fullName?: string;
  phoneNo?: string;
  email?: string;
  phoneModel?: string;
  price?: number;
  location?: string;
  date?: string;
  time?: string;
  payment?: {
    pid?: string;
    productName?: string;
    buyerName?: string;
    buyerPhone?: string;
    buyerEmail?: string;
    amt?: number;
    tAmt?: number;
  };
};

function safeParseOrder(raw: string | null): OrderData | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as OrderData;
  } catch {
    return null;
  }
}

function getReadableToken() {
  const localToken = localStorage.getItem("token");
  if (localToken) return localToken;

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

function StripeRedirectContent() {
  const searchParams = useSearchParams();
  const order = useMemo(() => safeParseOrder(searchParams.get("order")), [searchParams]);
  const [message, setMessage] = useState("Preparing Stripe Checkout...");
  const [error, setError] = useState("");

  useEffect(() => {
    const startCheckout = async () => {
      if (!order) {
        setError("Missing payment details.");
        return;
      }

      const productId = String(order.payment?.pid || order.oid || "");
      const nprAmount = Number(order.payment?.tAmt ?? order.payment?.amt ?? order.amt ?? order.price ?? 0);
      const productName = order.payment?.productName || order.phoneModel || "Booking payment";
      const orderId = String(order.oid || order.refId || `order_${Date.now()}`);

      try {
        if (!nprAmount) {
          throw new Error("Invalid payment amount");
        }

        const appOrigin = window.location.origin;
        const successUrl = `${appOrigin}/stripe/success?session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(orderId)}`;
        const cancelUrl = `${appOrigin}/stripe/cancel?order_id=${encodeURIComponent(orderId)}`;

        const token = getReadableToken();
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const res = await fetch(`${base}/api/payments/stripe/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            amount: nprAmount,
            currency: "npr",
            productName,
            productId,
            buyerName: order.payment?.buyerName || order.fullName,
            buyerPhone: order.payment?.buyerPhone || order.phoneNo,
            buyerEmail: order.payment?.buyerEmail || order.email,
            orderId,
            fullName: order.fullName,
            phoneNo: order.phoneNo,
            phoneModel: productName,
            sellerId: order.sellerId,
            price: nprAmount,
            location: order.location,
            date: order.date,
            time: order.time,
            oid: orderId,
            refId: orderId,
            successUrl,
            cancelUrl,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
              productId,
              itemId: productId,
              orderId,
              productName,
              email: order.payment?.buyerEmail || order.email,
              currency: "npr",
              paymentMethod: "stripe",
              price: String(nprAmount),
            },
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Payment failed");
        }

        if (!data?.url) {
          throw new Error("Stripe checkout URL was not returned by the backend");
        }

        setMessage("Redirecting to Stripe...");
        window.location.href = data.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed");
      }
    };

    startCheckout();
  }, [order]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Stripe Checkout</p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">
          {error ? "Checkout could not start" : message}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {error || "You will be redirected to Stripe to complete the payment securely."}
        </p>
      </div>
    </main>
  );
}

export default function StripeRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Stripe Checkout</p>
            <h1 className="mt-3 text-2xl font-semibold text-gray-950">Preparing Stripe Checkout...</h1>
          </div>
        </main>
      }
    >
      <StripeRedirectContent />
    </Suspense>
  );
}
