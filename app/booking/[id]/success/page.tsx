import Link from "next/link";

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-emerald-950 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Payment complete</p>
        <h1 className="mt-3 text-3xl font-semibold">Booking confirmed</h1>
        <p className="mt-3 text-sm text-emerald-900/80">
          Your Stripe payment was completed successfully for booking {params.id}.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
            Back to home
          </Link>
          <Link href={`/booking/${params.id}`} className="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700">
            View booking
          </Link>
        </div>
      </div>
    </main>
  );
}
