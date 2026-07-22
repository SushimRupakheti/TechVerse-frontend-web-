import Link from "next/link";
import { MailCheck } from "lucide-react";
import AuthHeader from "@/app/components/auth_header";
import ResendVerificationButton from "../_components/ResendVerificationButton";

export default async function VerifyEmailPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <>
      <AuthHeader />
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#f7faff_0%,_#eef5ff_55%,_#ffffff_100%)] px-4 py-10 sm:px-6">
        <section className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <MailCheck className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
            Verify Your Email
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>We have sent a verification email to your email address.</p>
            <p>
              Please open your inbox and click the verification link before logging in.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-800"
            >
              Open Login
            </Link>
            <ResendVerificationButton email={email} />
          </div>
        </section>
      </main>
    </>
  );
}
