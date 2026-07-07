"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, ShoppingCart, User, Search, PlusCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/api/notifications";

const LINKS = [
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) =>
    href === "/dashboard/home"
      ? pathname === "/dashboard" || pathname === "/dashboard/home"
      : pathname?.startsWith(href);

  const unreadCount = useMemo(
    () =>
      isAuthenticated
        ? notifications.filter((notification) => !notification.isRead).length
        : 0,
    [isAuthenticated, notifications]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadNotifications = async () => {
      try {
        setNotificationError("");
        const items = await getNotifications();
        if (!cancelled) setNotifications(items);
      } catch (error) {
        if (!cancelled) {
          setNotificationError(
            error instanceof Error ? error.message : "Failed to load notifications"
          );
        }
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    setNotifications((current) =>
      current.map((item) =>
        item._id === notification._id ? { ...item, isRead: true } : item
      )
    );

    try {
      await markNotificationAsRead(notification._id);
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Failed to mark notification as read"
      );
    }
  };

  const handleNotificationDelete = async (id: string) => {
    const previous = notifications;
    setNotifications((current) => current.filter((item) => item._id !== id));

    try {
      await deleteNotification(id);
    } catch (error) {
      setNotifications(previous);
      setNotificationError(
        error instanceof Error ? error.message : "Failed to delete notification"
      );
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("search") || "").trim();
    if (!query) {
      router.push("/dashboard/home");
      return;
    }

    const params = new URLSearchParams({ search: query });
    router.push(`/dashboard/home?${params.toString()}`);
  };

  return (
    <header className="w-full border-b border-blue-800 bg-blue-700 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-5 py-3">
          {/* Left: Logo + Brand */}
          <Link href="/dashboard/home" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Image
                src="/new_logo.png"
                alt="TechVerse Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-white">TechVerse</span>
          </Link>

          <div className="hidden flex-1 items-center sm:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto flex w-full max-w-xl items-center overflow-hidden rounded-md bg-white"
            >
              <input
                type="text"
                name="search"
                defaultValue={searchParams.get("search") || ""}
                key={searchParams.get("search") || "empty-search"}
                placeholder="Search laptops, GPUs, SSDs..."
                className="h-10 w-full bg-transparent px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="flex h-10 w-11 items-center justify-center bg-blue-600 hover:bg-blue-500"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>

          {/* Right: Links + Icons */}
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-5 text-xs font-medium lg:flex">
              {LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      active
                        ? "text-white"
                        : "text-blue-100 transition hover:text-white"
                    }
                  >
                    {l.label}
                  </Link>
                );
              })}
              {isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className={
                    pathname?.startsWith("/admin")
                      ? "text-white"
                      : "text-blue-100 transition hover:text-white"
                  }
                >
                  Admin Panel
                </Link>
              ) : null}
            </nav>

            {/* Notifications */}
            {isAuthenticated ? (
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((open) => !open)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                >
                  <Bell className="h-5 w-5 text-blue-50" />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {notificationOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h2 className="text-sm font-semibold">Notifications</h2>
                      <span className="text-xs text-slate-500">
                        {unreadCount} unread
                      </span>
                    </div>

                    {notificationError ? (
                      <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                        {notificationError}
                      </div>
                    ) : null}

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={
                              notification.isRead
                                ? "border-b border-slate-100 bg-white px-4 py-3"
                                : "border-b border-slate-100 bg-blue-50 px-4 py-3"
                            }
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => void handleNotificationClick(notification)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <p className="text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  {notification.message}
                                </p>
                                {notification.createdAt ? (
                                  <p className="mt-2 text-[11px] text-slate-400">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                ) : null}
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleNotificationDelete(notification._id)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-red-600"
                                aria-label="Delete notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Cart */}
            <Link
              href="/dashboard/cart"
              className="flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-blue-50" />
            </Link>

            {!loading && !isAuthenticated ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login"
                  className="rounded-md border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                {/* Profile */}
                <Link
                  href="/dashboard/profile"
                  className="flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
                  aria-label="Profile"
                >
                  <User className="h-5 w-5 text-white" />
                </Link>

              </>
            )}

            <Link
              href="/dashboard/sell"
              className="hidden items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 md:inline-flex"
            >
              <PlusCircle className="h-4 w-4" />
              Sell Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
