"use client";

import AdminLayout from "../AdminLayout";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    address: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          email: form.email,
          contactNo: form.contactNo,
          address: form.address,
          password: form.password,
          role: form.role || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to create user");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
        <h1 className="text-3xl font-semibold text-white">Create User</h1>
        <p className="text-sm text-slate-400">Create an admin or user account through the admin register endpoint.</p>
        {error ? <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200">{error}</div> : null}

        {[
          ["firstName", "First name"],
          ["lastName", "Last name"],
          ["email", "Email"],
          ["contactNo", "Contact number"],
          ["address", "Address"],
          ["password", "Password"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="mb-1 block text-sm text-slate-300">{label}</label>
            <input
              name={name}
              type={name === "password" ? "password" : name === "email" ? "email" : "text"}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              required={name !== "firstName" && name !== "lastName"}
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
          {loading ? "Creating..." : "Create user"}
        </button>
      </form>
    </AdminLayout>
  );
}
