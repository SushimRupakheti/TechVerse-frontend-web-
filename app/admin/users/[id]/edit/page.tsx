"use client";

import AdminLayout from "../../../users/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    address: "",
    password: "",
    role: "user",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
      const data = await res.json().catch(() => null);
      const user = data?.data || data;
      setForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        contactNo: user?.contactNo || "",
        address: user?.address || "",
        password: "",
        role: user?.role || "user",
        profileImage: user?.profileImage || "",
      });
    };
    load();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        email: form.email || undefined,
        contactNo: form.contactNo || undefined,
        address: form.address || undefined,
        role: form.role || undefined,
        profileImage: form.profileImage || undefined,
        ...(form.password ? { password: form.password } : {}),
      };

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update user");
      router.push(`/admin/users/${id}`);
      router.refresh();
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
        <h1 className="text-3xl font-semibold text-white">Edit User</h1>
        {error ? <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200">{error}</div> : null}
        {[
          ["firstName", "First name"],
          ["lastName", "Last name"],
          ["email", "Email"],
          ["contactNo", "Contact number"],
          ["address", "Address"],
          ["password", "Password"],
          ["profileImage", "Profile image"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="mb-1 block text-sm text-slate-300">{label}</label>
            <input
              name={name}
              type={name === "password" ? "password" : name === "email" ? "email" : "text"}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </div>
        ))}

        <div>
          <label className="mb-1 block text-sm text-slate-300">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </AdminLayout>
  );
}
