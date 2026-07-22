import { Suspense } from "react";
import AuthHeader from "@/app/components/auth_header";
import VerifyEmailResult from "../_components/VerifyEmailResult";

export default function VerifyEmailPage() {
  return (
    <>
      <AuthHeader />
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#f7faff_0%,_#eef5ff_55%,_#ffffff_100%)] px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="text-sm text-slate-600">Verifying your email...</div>}>
          <VerifyEmailResult />
        </Suspense>
      </main>
    </>
  );
}
