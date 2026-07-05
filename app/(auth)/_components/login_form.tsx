"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { handleLogin } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormData } from "../schema";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login failed";
}

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setSuccessMessage("");

    try {
      const result = await handleLogin(data);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      const role = result.data?.role?.toLowerCase();

      if (result.data?.token) {
        document.cookie = `token=${result.data.token}; path=/`;
      }
      document.cookie = `role=${role}; path=/`;

      setSuccessMessage("Login successful. Redirecting...");

      setTimeout(() => {
        router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err));
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
    </div>
  );
}
