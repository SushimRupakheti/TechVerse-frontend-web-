"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthHeader() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname === href
      ? "bg-blue-700 text-white"
      : "border border-blue-100 bg-white text-blue-700 hover:bg-blue-50";

  return (
    <header className="w-full border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <Image
              src="/new_logo.png"
              alt="TechVerse Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-blue-950">TechVerse</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${linkClass(
              "/login"
            )}`}
          >
            Log In
          </Link>

          <Link
            href="/register"
            className={`flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${linkClass(
              "/register"
            )}`}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
