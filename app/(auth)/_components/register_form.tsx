"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Lock, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { handleRegister } from "@/lib/actions/auth-action";
import { registerSchema, RegisterFormData } from "../schema";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Registration failed";
}

const inputShell =
  "mt-2 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100";

const inputClass =
  "h-12 w-full bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setSuccessMessage("");

    try {
      const result = await handleRegister(data);
      if (!result.success) throw new Error(result.message);

      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
          Create account
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Join TechVerse
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Start buying, selling, and managing computer hardware in one trusted
          marketplace.
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

      <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="firstName"
            >
              First name
            </label>
            <div className={inputShell}>
              <User className="h-4 w-4 text-slate-400" />
              <input
                id="firstName"
                {...register("firstName")}
                placeholder="First name"
                className={inputClass}
              />
            </div>
            {errors.firstName ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="lastName"
            >
              Last name
            </label>
            <div className={inputShell}>
              <User className="h-4 w-4 text-slate-400" />
              <input
                id="lastName"
                {...register("lastName")}
                placeholder="Last name"
                className={inputClass}
              />
            </div>
            {errors.lastName ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            Email address
          </label>
          <div className={inputShell}>
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="address"
          >
            Address
          </label>
          <div className={inputShell}>
            <Home className="h-4 w-4 text-slate-400" />
            <input
              id="address"
              {...register("address")}
              placeholder="City or area"
              className={inputClass}
            />
          </div>
          {errors.address ? (
            <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="contactNo"
          >
            Contact number
          </label>
          <div className={inputShell}>
            <Phone className="h-4 w-4 text-slate-400" />
            <input
              id="contactNo"
              {...register("contactNo")}
              placeholder="+977..."
              className={inputClass}
            />
          </div>
          {errors.contactNo ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.contactNo.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <div className={inputShell}>
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Create a password"
              className={inputClass}
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
