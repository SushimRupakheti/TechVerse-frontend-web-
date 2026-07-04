"use client";

import { useState, useEffect } from "react";

type RecordLike = Record<string, unknown>;

type Item = RecordLike & {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  contactNo?: string;
  contact?: string;
  phone?: string;
  email?: string;
  finalPrice?: number;
  basePrice?: number;
  phoneModel?: string;
  itemName?: string;
  sellerId?: RecordLike | string;
};

type User = RecordLike & {
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  contactNo?: string;
  contact?: string;
  phone?: string;
  email?: string;
};

type PaymentResult = {
  success: boolean;
  message: string;
  raw: string | null;
};

const NPR_PER_USD = Number(process.env.NEXT_PUBLIC_NPR_PER_USD || "133.5");

function nprToStripeUsdAmount(nprAmount: number) {
  if (!Number.isFinite(nprAmount) || nprAmount <= 0) return 0;
  return Number((nprAmount / NPR_PER_USD).toFixed(2));
}

export default function BookingForm({ item, user }: { item?: Item; user?: User }) {
  const [name, setName] = useState(() => {
    if (!user) return "";
    const f = user?.firstName || user?.first_name || "";
    const l = user?.lastName || user?.last_name || "";
    return `${String(f).trim()} ${String(l).trim()}`.trim();
  });
  const [number, setNumber] = useState(() => user?.contactNo || user?.contact || user?.phone || "");
  const [email, setEmail] = useState(() => user?.email || "");
  const [itemState, setItemState] = useState<Item | null>(() => item ?? null);
  const [shop, setShop] = useState("New road ,Kathmandu");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("4:00 PM");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const getReadableToken = () => {
    if (typeof window === "undefined") return null;

    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;

    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    return cookieToken ? decodeURIComponent(cookieToken) : null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);

    // client-side validation: required fields
    const missing: string[] = [];
    const itemId = itemState?._id ?? itemState?.id;
    const amount = itemState?.finalPrice ?? itemState?.basePrice;
    if (!itemId) missing.push("itemId");
    if (!amount || Number(amount) <= 0) missing.push("amount");
    if (!name) missing.push("name");
    if (!number) missing.push("number");
    if (!email) missing.push("email");

    if (missing.length) {
      setResult({ success: false, message: `Missing required fields: ${missing.join(", ")}`, raw: null });
      setBusy(false);
      return;
    }

    try {
      const pid = String(itemId);
      const nprAmount = Number(amount) || 0;
      const stripeUsdAmount = nprToStripeUsdAmount(nprAmount);
      const orderId = `order_${Date.now()}`;
      const productName = itemState?.phoneModel ?? itemState?.itemName ?? "Booking payment";
      const sellerId =
        typeof itemState?.sellerId === "object"
          ? String(itemState?.sellerId?._id ?? "")
          : String(itemState?.sellerId ?? "");

      if (!stripeUsdAmount) {
        throw new Error("Invalid payment amount");
      }

      const payload = {
        amount: stripeUsdAmount,
        productName,
        productId: pid,
        buyerName: name,
        buyerPhone: number,
        buyerEmail: email,
        orderId,
        fullName: name,
        phoneNo: number,
        phoneModel: productName,
        sellerId,
        price: stripeUsdAmount,
        location: shop,
        date,
        time,
        oid: orderId,
        refId: orderId,
        metadata: {
          productId: pid,
          itemId: pid,
          productName,
          email,
          originalCurrency: "NPR",
          originalPrice: String(nprAmount),
          stripeCurrency: "USD",
          stripeAmount: String(stripeUsdAmount),
          nprPerUsd: String(NPR_PER_USD),
        },
      };

      const token = getReadableToken();
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const res = await fetch(`${base}/api/payments/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Payment failed");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Stripe checkout URL was not returned by the backend");
    } catch (err: unknown) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Payment failed", raw: null });
    } finally {
      setBusy(false);
    }
  };

  // if item not provided server-side, fetch it client-side from backend
  useEffect(() => {
    if (itemState) return;
    const fetchItem = async () => {
      try {
        const path = window.location.pathname;
        const m = path.match(/\/booking\/([^/]+)/);
        const id = m ? m[1] : null;
        if (!id) return;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const res = await fetch(`${base}/api/items/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched = data?.item ?? data;
        setItemState(fetched ?? null);
      } catch {
        // ignore
      }
    };
    fetchItem();
  }, [itemState]);

  return (
    <form onSubmit={handlePlaceOrder} className="mx-auto max-w-3xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-xs text-gray-600">Full Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="Your name" />

          <label className="mt-4 block text-xs text-gray-600">Number</label>
          <input value={number} onChange={(e)=>setNumber(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="+977-98..." />

          <label className="mt-4 block text-xs text-gray-600">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="you@example.com" />

          <label className="mt-4 block text-xs text-gray-600">Product Name</label>
          <input readOnly value={itemState?.phoneModel || itemState?.itemName || ""} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" />

          <label className="mt-4 block text-xs text-gray-600">Price</label>
          <input readOnly value={`NPR ${Number((itemState?.finalPrice ?? itemState?.basePrice) || 0).toLocaleString()}`} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" />
        </div>

        <div>
          <p className="text-sm font-semibold">Shop:</p>
          <p className="mt-1 text-xs text-gray-500">Choose the nearest shop for the appointment:</p>

          <label className="mt-3 block text-xs text-gray-600">Location</label>
          <select value={shop} onChange={(e)=>setShop(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border">
            <option>New road ,Kathmandu</option>
            <option>Gundu, Bhaktapur</option>
            <option>Imadol, Lalitpur</option>
          </select>

          <label className="mt-4 block text-xs text-gray-600">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border" />

          <label className="mt-4 block text-xs text-gray-600">Time</label>
          <input value={time} onChange={(e)=>setTime(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border" />

          <button disabled={busy} type="submit" className="mt-6 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition">
            {busy ? "Redirecting..." : "Pay with Stripe"}
          </button>

          {result && (
            <div className={`mt-4 rounded-md p-3 ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="text-sm font-semibold">{result.message}</p>
              <pre className="mt-2 text-xs text-gray-600">{String(result?.raw ?? '')}</pre>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
