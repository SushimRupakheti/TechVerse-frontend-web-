import Link from "next/link";

type Props = {
  searchParams?: Promise<{ order_id?: string | string[] }> | { order_id?: string | string[] };
};

export default async function StripeCancelPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = Array.isArray(params?.order_id) ? params?.order_id[0] : params?.order_id;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Stripe payment</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-950">Payment cancelled</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Your Stripe checkout was cancelled. No card was charged, and you can return to the booking
          page whenever you are ready.
        </p>

        {orderId && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Order ID</p>
            <p className="mt-2 break-all text-sm font-medium text-gray-900">{orderId}</p>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
            Browse items
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
