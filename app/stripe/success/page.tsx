import Link from "next/link";

type Props = {
  searchParams?: Promise<{ session_id?: string | string[] }> | { session_id?: string | string[] };
};

export default async function StripeSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = Array.isArray(params?.session_id) ? params?.session_id[0] : params?.session_id;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-emerald-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">Stripe payment</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-950">Checkout returned</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Stripe redirected you back after checkout. MongoDB payment records and sold-status updates are
          created only when the backend receives the Stripe webhook.
        </p>

        {sessionId && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Session ID</p>
            <p className="mt-2 break-all text-sm font-medium text-gray-900">{sessionId}</p>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
            Go to dashboard
          </Link>
          <Link href="/" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
