"use client";

import { type FormEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { handleLogin, handleVerifyTwoFactorLogin } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormData } from "../schema";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login failed";
}

type LoginSuccessData = {
  token?: string;
  role?: string;
};

type LoginActionResult = {
  success: boolean;
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const finishLogin = (data?: LoginSuccessData) => {
    const role = data?.role?.toLowerCase();

    if (data?.token) {
      document.cookie = `token=${data.token}; path=/`;
    }
    document.cookie = `role=${role}; path=/`;

    setSuccessMessage("Login successful. Redirecting...");

    setTimeout(() => {
      router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
    }, 800);
  };

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setSuccessMessage("");

    try {
      const result = (await handleLogin(data)) as LoginActionResult;

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

      finishLogin(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
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
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-blue-700">
          G
        </span>
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
      </form>
      </>
      )}
    </div>
  );
}
