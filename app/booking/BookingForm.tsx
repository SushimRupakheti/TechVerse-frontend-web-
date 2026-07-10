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
  price?: number;
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
  name?: string;
  username?: string;
  contactNo?: string;
  phoneNo?: string;
  contact?: string;
  phone?: string;
  mobile?: string;
  data?: User;
  user?: User;
  email?: string;
};

type PaymentResult = {
  success: boolean;
  message: string;
  raw: string | null;
};

function getItemPrice(item?: Item | null) {
  return item?.finalPrice ?? item?.price ?? item?.basePrice;
}

function getStringField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function unwrapUser(value?: User | null): User | null {
  if (!value) return null;
  return value.user || value.data || value;
}

function getUserName(value?: User | null) {
  const user = unwrapUser(value);
  if (!user) return "";

  const firstName = getStringField(user.firstName) || getStringField(user.first_name);
  const lastName = getStringField(user.lastName) || getStringField(user.last_name);
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || getStringField(user.name) || getStringField(user.username);
}

function getUserNumber(value?: User | null) {
  const user = unwrapUser(value);
  if (!user) return "";

  return (
    getStringField(user.contactNo) ||
    getStringField(user.phoneNo) ||
    getStringField(user.contact) ||
    getStringField(user.phone) ||
    getStringField(user.mobile)
  );
}

function getUserEmail(value?: User | null) {
  const user = unwrapUser(value);
  return user ? getStringField(user.email) : "";
}

export default function BookingForm({ item, user }: { item?: Item; user?: User }) {
  const [name, setName] = useState(() => getUserName(user));
  const [number, setNumber] = useState(() => getUserNumber(user));
  const [email, setEmail] = useState(() => getUserEmail(user));
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

  const applyUserFallbacks = (nextUser?: User | null) => {
    const nextName = getUserName(nextUser);
    const nextNumber = getUserNumber(nextUser);
    const nextEmail = getUserEmail(nextUser);

    if (nextName) setName((current) => current || nextName);
    if (nextNumber) setNumber((current) => current || nextNumber);
    if (nextEmail) setEmail((current) => current || nextEmail);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);

    // client-side validation: required fields
    const missing: string[] = [];
    const itemId = itemState?._id ?? itemState?.id;
    const amount = getItemPrice(itemState);
    if (!itemId) missing.push("itemId");
    if (!amount || Number(amount) <= 0) missing.push("amount");
    const buyerName = name.trim();
    const buyerNumber = String(number).trim();
    const buyerEmail = email.trim();
    if (!buyerName) missing.push("name");
    if (!buyerNumber) missing.push("number");
    if (!buyerEmail) missing.push("email");

    if (missing.length) {
      setResult({ success: false, message: `Missing required fields: ${missing.join(", ")}`, raw: null });
      setBusy(false);
      return;
    }

    try {
      const pid = String(itemId);
      const nprAmount = Number(amount) || 0;
      const orderId = `order_${Date.now()}`;
      const productName = itemState?.phoneModel ?? itemState?.itemName ?? "Booking payment";
      const sellerId =
        typeof itemState?.sellerId === "object"
          ? String(itemState?.sellerId?._id ?? "")
          : String(itemState?.sellerId ?? "");

      if (!nprAmount) {
        throw new Error("Invalid payment amount");
      }

      const appOrigin = window.location.origin;
      const successUrl = `${appOrigin}/stripe/success?session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(orderId)}`;
      const cancelUrl = `${appOrigin}/stripe/cancel?order_id=${encodeURIComponent(orderId)}`;

      const payload = {
        amount: nprAmount,
        currency: "npr",
        productName,
        productId: pid,
        buyerName,
        buyerPhone: buyerNumber,
        buyerEmail: buyerEmail,
        orderId,
        fullName: buyerName,
        phoneNo: buyerNumber,
        phoneModel: productName,
        sellerId,
        price: nprAmount,
        location: shop,
        date,
        time,
        oid: orderId,
        refId: orderId,
        successUrl,
        cancelUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          productId: pid,
          itemId: pid,
          orderId,
          productName,
          email: buyerEmail,
          currency: "npr",
          paymentMethod: "stripe",
          price: String(nprAmount),
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

  useEffect(() => {
    applyUserFallbacks(user);
  }, [user]);

  useEffect(() => {
    if (name && number && email) return;

    const fetchCurrentUser = async () => {
      try {
        const token = getReadableToken();
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const res = await fetch(`${base}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;

        const data = await res.json();
        applyUserFallbacks(data?.data || data?.user || data);
      } catch {
        // The user can still type the fields manually.
      }
    };

    fetchCurrentUser();
  }, [name, number, email]);

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
          <input readOnly value={`NPR ${Number(getItemPrice(itemState) || 0).toLocaleString()}`} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" />
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

          <button disabled={busy} type="submit" className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition">
            {busy ? "Redirecting..." : "Pay with Stripe"}
          </button>

          {result && (
            <div className={`mt-4 rounded-md p-3 ${result.success ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="text-sm font-semibold">{result.message}</p>
              <pre className="mt-2 text-xs text-gray-600">{String(result?.raw ?? '')}</pre>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
