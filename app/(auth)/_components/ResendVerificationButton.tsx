"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/api/auth";

type Props = {
  email?: string;
  className?: string;
};

const defaultClassName =
  "flex h-12 w-full items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60";

export default function ResendVerificationButton({ email, className }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const resend = async () => {
    const targetEmail = email || sessionStorage.getItem("verificationEmail") || "";
    if (!targetEmail) {
      setIsError(true);
      setMessage("Please open the login page and enter your email address first.");
      return;
    }

    setMessage("");
    try {
      setIsSending(true);
      const result = await resendVerificationEmail(targetEmail);
      if (result?.success === false) {
        throw new Error(result.message || "Unable to resend verification email.");
      }
      setIsError(false);
      setMessage(result?.message || "Verification email sent successfully.");
    } catch (error: unknown) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "You have requested too many emails. Please wait."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={isSending}
        className={className || defaultClassName}
      >
        {isSending ? "Sending..." : "Resend Verification Email"}
      </button>
      {message ? (
        <p
          role="status"
          className={`mt-3 text-center text-sm ${isError ? "text-red-700" : "text-green-700"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
