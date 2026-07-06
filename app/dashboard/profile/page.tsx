"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchMyProfile, updateMyProfile } from "@/lib/actions/user-action";
import {
  handleDisableTwoFactor,
  handleEnableTwoFactor,
  handleLogout,
  handleVerifyTwoFactorSetup,
} from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";
// NOTE: use a client-side wrapper to call the server logout API

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contactNo: string;
  twoFactorEnabled: boolean;

  currentPassword: string;
  password: string;
  confirmPassword: string;
};

type ProfilePayload = {
  firstName: string;
  lastName: string;
  address: string;
  contactNo: string;
  currentPassword?: string;
  password?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getStringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNo: "",
    twoFactorEnabled: false,

    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    qrCode: string;
    otpauthUrl: string;
  } | null>(null);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [startingTwoFactor, setStartingTwoFactor] = useState(false);
  const [verifyingTwoFactor, setVerifyingTwoFactor] = useState(false);
  const [disablingTwoFactor, setDisablingTwoFactor] = useState(false);

  // Load profile data (logged-in user)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchMyProfile();
        if (!res?.success) {
          setError(res?.message || "Failed to load profile");
          return;
        }

        const u = res.data;

        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          address: u.address || "",
          contactNo: u.contactNo || "",
          twoFactorEnabled: Boolean(u.twoFactorEnabled),

          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const inputBase =
    "w-full rounded-sm bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none border border-transparent focus:border-blue-600 focus:bg-white transition";

  const validateOtp = (value: string) => /^\d{6}$/.test(value);

  const onStartTwoFactorSetup = async () => {
    try {
      setStartingTwoFactor(true);
      setTwoFactorError(null);

      const res = await handleEnableTwoFactor();
      if (!res?.success) {
        setTwoFactorError(res?.message || "Failed to start 2FA setup");
        return;
      }

      setTwoFactorSetup({
        qrCode: getStringField(res.data?.qrCode),
        otpauthUrl: getStringField(res.data?.otpauthUrl),
      });
      setTwoFactorOtp("");
    } catch (e: unknown) {
      setTwoFactorError(getErrorMessage(e, "Failed to start 2FA setup"));
    } finally {
      setStartingTwoFactor(false);
    }
  };

  const onVerifyTwoFactorSetup = async () => {
    try {
      setVerifyingTwoFactor(true);
      setTwoFactorError(null);

      if (!validateOtp(twoFactorOtp)) {
        setTwoFactorError("Enter a valid 6-digit OTP");
        return;
      }

      const res = await handleVerifyTwoFactorSetup(twoFactorOtp);
      if (!res?.success) {
        setTwoFactorError(res?.message || "Failed to verify 2FA setup");
        return;
      }

      setForm((p) => ({ ...p, twoFactorEnabled: true }));
      setTwoFactorSetup(null);
      setTwoFactorOtp("");
      toast.success(res.message || "Two-factor authentication enabled successfully");
    } catch (e: unknown) {
      setTwoFactorError(getErrorMessage(e, "Failed to verify 2FA setup"));
    } finally {
      setVerifyingTwoFactor(false);
    }
  };

  const onDisableTwoFactor = async () => {
    try {
      setDisablingTwoFactor(true);
      setTwoFactorError(null);

      if (!twoFactorPassword) {
        setTwoFactorError("Current password is required");
        return;
      }

      const res = await handleDisableTwoFactor(twoFactorPassword);
      if (!res?.success) {
        setTwoFactorError(res?.message || "Failed to disable 2FA");
        return;
      }

      setForm((p) => ({ ...p, twoFactorEnabled: false }));
      setTwoFactorSetup(null);
      setTwoFactorOtp("");
      setTwoFactorPassword("");
      toast.success(res.message || "Two-factor authentication disabled successfully");
    } catch (e: unknown) {
      setTwoFactorError(getErrorMessage(e, "Failed to disable 2FA"));
    } finally {
      setDisablingTwoFactor(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Frontend password validation
      if (form.password || form.confirmPassword || form.currentPassword) {
        if (form.password !== form.confirmPassword) {
          setError("Password and confirm password do not match");
          return;
        }
        if (!form.currentPassword) {
          setError("Current password is required to change password");
          return;
        }
      }

      const payload: ProfilePayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        contactNo: form.contactNo,
      };

      if (form.password) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.password;
      }

      const res = await updateMyProfile(payload);

      if (!res?.success) {
        setError(res?.message || "Update failed");
        return;
      }

      toast.success("Profile updated successfully!");

      setForm((p) => ({
        ...p,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));

      setIsEditing(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Account</span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-600">Welcome! </span>
              <span className="text-blue-700 font-medium">
                {form.firstName || "User"} {form.lastName}
              </span>
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await handleLogout();
                  if (!res?.success) throw new Error(res?.message || "Logout failed");

                  document.cookie = "token=; path=/; max-age=0";
                  document.cookie = "role=; path=/; max-age=0";
                  localStorage.removeItem("token");

                  router.replace("/login");
                  router.refresh();
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : "Logout failed");
                }
              }}
              className="border border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white text-xs font-medium px-4 py-2 rounded-sm transition"
            >
              Logout
            </button>
          </div>


        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white shadow-sm border border-gray-100 rounded-md max-w-3xl mx-auto">
          <div className="px-10 py-8">
            <h2 className="text-blue-700 font-semibold text-lg mb-6">
              Profile
            </h2>

            {error && (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  value={form.email}
                  disabled
                  className={inputBase + " cursor-not-allowed"}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  value={form.contactNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactNo: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="mt-10 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Change Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="mt-10 border-t pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Status:{" "}
                    <span
                      className={
                        form.twoFactorEnabled
                          ? "font-semibold text-green-700"
                          : "font-semibold text-gray-700"
                      }
                    >
                      {form.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </p>
                </div>

                {!form.twoFactorEnabled && !twoFactorSetup ? (
                  <button
                    type="button"
                    onClick={onStartTwoFactorSetup}
                    disabled={startingTwoFactor}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-6 py-3 rounded-sm transition disabled:opacity-60"
                  >
                    {startingTwoFactor ? "Starting..." : "Enable 2FA"}
                  </button>
                ) : null}
              </div>

              {twoFactorError ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {twoFactorError}
                </div>
              ) : null}

              {twoFactorSetup ? (
                <div className="mt-5 rounded-md border border-gray-100 bg-gray-50 p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr]">
                    {twoFactorSetup.qrCode ? (
                      <Image
                        src={twoFactorSetup.qrCode}
                        alt="2FA setup QR code"
                        width={160}
                        height={160}
                        unoptimized
                        className="h-40 w-40 rounded-sm border border-gray-200 bg-white p-2"
                      />
                    ) : null}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Manual setup key
                        </label>
                        <div className="flex gap-2">
                          <input
                            value={twoFactorSetup.otpauthUrl}
                            readOnly
                            className={inputBase + " cursor-text"}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!twoFactorSetup.otpauthUrl) return;
                              await navigator.clipboard.writeText(twoFactorSetup.otpauthUrl);
                              toast.success("Setup URL copied");
                            }}
                            className="border border-gray-200 hover:bg-white text-gray-700 text-sm font-medium px-4 py-3 rounded-sm transition"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Authentication Code
                        </label>
                        <input
                          value={twoFactorOtp}
                          onChange={(e) =>
                            setTwoFactorOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="123456"
                          className={inputBase}
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={onVerifyTwoFactorSetup}
                          disabled={verifyingTwoFactor}
                          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-6 py-3 rounded-sm transition disabled:opacity-60"
                        >
                          {verifyingTwoFactor ? "Verifying..." : "Verify setup"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTwoFactorSetup(null);
                            setTwoFactorOtp("");
                            setTwoFactorError(null);
                          }}
                          disabled={verifyingTwoFactor}
                          className="border border-gray-200 hover:bg-white text-gray-700 text-sm font-medium px-6 py-3 rounded-sm transition disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {form.twoFactorEnabled ? (
                <div className="mt-5 rounded-md border border-gray-100 bg-gray-50 p-5">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="password"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={onDisableTwoFactor}
                      disabled={disablingTwoFactor}
                      className="border border-red-200 text-red-700 hover:bg-red-50 text-sm font-medium px-6 py-3 rounded-sm transition disabled:opacity-60"
                    >
                      {disablingTwoFactor ? "Disabling..." : "Disable 2FA"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-10 py-3 rounded-sm transition"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-8 py-3 rounded-sm transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-10 py-3 rounded-sm transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
