"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/auth";
import ResendVerificationButton from "./ResendVerificationButton";

type Status = "loading" | "success" | "error";

export default function VerifyEmailResult() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification link is invalid or has expired.");
        return;
      }

      try {
        const result = await verifyEmail(token);
        if (result?.success === false) {
          throw new Error(result.message || "Verification link is invalid or has expired.");
        }
        if (active) {
          sessionStorage.removeItem("verificationEmail");
          setStatus("success");
          setMessage("Your email has been successfully verified.");
        }
      } catch (error: unknown) {
        if (active) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "Verification link is invalid or has expired."
          );
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:px-10">
      {status === "loading" ? (
        <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-blue-700" aria-hidden="true" />
      ) : status === "success" ? (
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
      ) : (
        <XCircle className="mx-auto h-16 w-16 text-red-600" aria-hidden="true" />
      )}

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
        {status === "loading"
          ? "Verifying Email"
          : status === "success"
            ? "✓ Email Verified"
            : "Verification Failed"}
      </h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>

      {status === "success" ? (
        <>
          <p className="mt-2 text-sm text-slate-600">You can now log in.</p>
          <Link
            href="/login"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Go to Login
          </Link>
        </>
      ) : status === "error" ? (
        <div className="mt-8">
          <ResendVerificationButton />
        </div>
      ) : null}
    </section>
  );
}
