import Link from "next/link";
import { CheckCircle2, LayoutDashboard, ShoppingBag } from "lucide-react";

export default function StripeSuccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#f7faff_0%,_#eef5ff_55%,_#ffffff_100%)] px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
          Payment completed
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Payment successful
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Thank you for your purchase. Your order is being finalized, and the
          purchased item will be removed from available TechVerse listings.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] hover:bg-blue-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Link>
          <Link
            href="/dashboard/cart"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <ShoppingBag className="h-4 w-4" />
            View cart
          </Link>
        </div>
      </section>
    </main>
  );
}
