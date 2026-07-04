"use client";

import AdminLayout from "../users/AdminLayout";
import { useState, type ChangeEvent, type FormEvent } from "react";

export default function NotificationsPage() {
  const [form, setForm] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send notification");
      setForm({ title: "", message: "" });
      setMessage("Notification sent to all users.");
    } catch (caughtError: unknown) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
        <h1 className="text-3xl font-semibold text-white">Notifications</h1>
        <p className="text-sm text-slate-400">Send a custom notification to all users.</p>
        {message ? <div className="rounded-lg bg-white/5 p-3 text-sm text-slate-200">{message}</div> : null}
        <div>
          <label className="mb-1 block text-sm text-slate-300">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="min-h-40 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" required />
        </div>
        <button disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
          {loading ? "Sending..." : "Send notification"}
        </button>
      </form>
    </AdminLayout>
  );
}
