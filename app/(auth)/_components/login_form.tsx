"use client";

import { type FormEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { handleVerifyTwoFactorLogin } from "@/lib/actions/auth-action";
import { login, resendVerificationEmail } from "@/lib/api/auth";
import { loginSchema, LoginFormData } from "../schema";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login failed";
}

type LoginSuccessData = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  role?: string;
  user?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    role?: string;
  };
};

type LoginActionResult = {
  success: boolean;
  token?: string;
  accessToken?: string;
  jwt?: string;
  role?: string;
  message?: string;
  data?: LoginSuccessData;
  twoFactorRequired?: boolean;
  userId?: string;
  email?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<{
    userId?: string;
    email?: string;
  } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const finishLogin = (data?: LoginSuccessData) => {
    const token =
      data?.token ||
      data?.accessToken ||
      data?.jwt ||
      data?.user?.token ||
      data?.user?.accessToken ||
      data?.user?.jwt;
    const role = (data?.role || data?.user?.role || "user").toLowerCase();

    if (token) {
      document.cookie = `token=${token}; path=/`;
    }
    document.cookie = `role=${role}; path=/`;

    setSuccessMessage("Login successful. Redirecting...");

    setTimeout(() => {
      router.replace(role === "admin" ? "/admin/dashboard" : "/dashboard");
      router.refresh();
    }, 800);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setSuccessMessage("");
    setVerificationRequired(false);

    try {
      const result = (await login(data)) as LoginActionResult;

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      if (result.twoFactorRequired) {
        setTwoFactorChallenge({
          userId: result.userId,
          email: result.email || data.email,
        });
        setOtp("");
        setSuccessMessage(result.message || "Two-factor authentication required");
        return;
      }

      finishLogin(
        result.data || {
          token: result.token,
          accessToken: result.accessToken,
          jwt: result.jwt,
          role: result.role,
        }
      );
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      if (message.toLowerCase().includes("verify your email")) {
        setVerificationRequired(true);
        sessionStorage.setItem("verificationEmail", data.email);
      }
    }
  };

  const onResendVerification = async () => {
    const email = getValues("email");
    if (!email) {
      setError("Enter your email address to resend the verification email.");
      return;
    }

    setError("");
    setSuccessMessage("");
    try {
      setResendingVerification(true);
      const result = await resendVerificationEmail(email);
      if (result?.success === false) {
        throw new Error(result.message || "Unable to resend verification email.");
      }
      setSuccessMessage(result?.message || "Verification email sent successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendingVerification(false);
    }
  };

  const onGoogleLogin = () => {
    window.location.href = "http://localhost:5050/api/auth/google";
  };

  const onVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    if (!twoFactorChallenge?.userId && !twoFactorChallenge?.email) {
      setError("Your 2FA session expired. Please log in again.");
      setTwoFactorChallenge(null);
      return;
    }

    try {
      setOtpSubmitting(true);
      const result = (await handleVerifyTwoFactorLogin({
        userId: twoFactorChallenge.userId,
        email: twoFactorChallenge.email,
        otp,
      })) as LoginActionResult;

      if (!result.success) {
        throw new Error(result.message || "Two-factor verification failed");
      }

      finishLogin(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOtpSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Log in to TechVerse
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Continue buying, selling, and managing your computer marketplace
          activity.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          {verificationRequired ? (
            <button
              type="button"
              onClick={onResendVerification}
              disabled={resendingVerification}
              className="mt-3 flex h-10 w-full items-center justify-center rounded-md border border-red-300 bg-white px-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendingVerification ? "Sending..." : "Resend Verification Email"}
            </button>
          ) : null}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {successMessage}
        </div>
      ) : null}

      {twoFactorChallenge ? (
        <form className="mt-7 space-y-5" onSubmit={onVerifyOtp}>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Two-factor authentication
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="otp">
              Authentication code
            </label>
            <div className="mt-2 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={otpSubmitting}
          >
            {otpSubmitting ? "Verifying..." : "Verify and log in"}
          </button>

          <button
            type="button"
            onClick={() => {
              setTwoFactorChallenge(null);
              setOtp("");
              setError("");
              setSuccessMessage("");
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </form>
      ) : (
      <>
      <button
        type="button"
        onClick={onGoogleLogin}
        className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.87A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.51H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.49l3.34-2.62Z"
          />
          <path
            fill="#EA4335"
            d="M12 6c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.51l3.34 2.62C7.18 7.76 9.39 6 12 6Z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            Email address
          </label>
          <div className="mt-2 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <div className="mt-2 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <div className="flex gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            For your security, 5 failed login attempts temporarily block new
            attempts from your IP address for 5 minutes.
          </p>
        </div>
      </form>
      </>
      )}
    </div>
  );
}
