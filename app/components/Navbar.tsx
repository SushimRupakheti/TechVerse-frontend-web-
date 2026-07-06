"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, User, Search, PlusCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, loading, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <header className="w-full border-b border-blue-800 bg-blue-700 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-5 py-3">
          {/* Left: Logo + Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
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
            <div className="mx-auto flex w-full max-w-xl items-center overflow-hidden rounded-md bg-white">
              <input
                type="text"
                placeholder="Search laptops, GPUs, SSDs..."
                className="h-10 w-full bg-transparent px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                className="flex h-10 w-11 items-center justify-center bg-blue-600 hover:bg-blue-500"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
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

            {/* Wishlist */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-blue-50" />
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
                4
              </span>
            </button>

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
