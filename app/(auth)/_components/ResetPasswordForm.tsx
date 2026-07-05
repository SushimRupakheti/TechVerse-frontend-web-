"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [pendingData, setPendingData] = useState<ResetPasswordDTO | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onSubmit",
  });

  // Step 1 → Show confirmation box
  const onSubmit = async (data: ResetPasswordDTO) => {
    setPendingData(data);
    setShowConfirmBox(true);
  };

  // Step 2 → Final submission after confirm
  const confirmReset = async () => {
    if (!pendingData) return;

    try {
      const response = await handleResetPassword(token, pendingData.password);

      if (response.success) {
        toast.success("Password reset successfully");
        router.replace("/login");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setShowConfirmBox(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-1px)] bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white shadow-lg p-8">
            <div className="text-center">
              <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                PASSWORD UPDATE
              </p>

              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Create a new password
              </h1>

              <p className="mt-3 text-sm text-gray-600">
                Your new password must be at least 6 characters long.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  New password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Re-enter password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Reset password
              </button>

              <div className="text-center text-sm text-gray-600">
                Back to{" "}
                <Link href="/login" className="text-blue-700 font-semibold">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirmBox && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Password Reset
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to change your password?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmBox(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={confirmReset}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
