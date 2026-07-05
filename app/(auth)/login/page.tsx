import Image from "next/image";
import Link from "next/link";
import { Cpu, ShieldCheck, Sparkles } from "lucide-react";
import AuthHeader from "@/app/components/auth_header";
import LoginForm from "../_components/login_form";

export default function LoginPage() {
  return (
    <>
      <AuthHeader />
      <main className="min-h-[calc(100vh-73px)] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#f7faff_0%,_#eef5ff_55%,_#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
          <div className="relative hidden min-h-[650px] overflow-hidden bg-slate-950 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,_rgba(59,130,246,0.5),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#0b4fd8_58%,_#0891ff_100%)]" />
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute right-0 top-16 h-[430px] w-full">
              <Image
                src="/bg.png"
                alt="TechVerse computer marketplace"
                fill
                className="scale-110 object-contain drop-shadow-2xl"
                priority
              />
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                Secure TechVerse access
              </div>
              <h2 className="mt-5 max-w-md text-4xl font-bold leading-tight">
                Manage your hardware deals in one place.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-blue-50">
                Sign in to track listings, manage your cart, and connect with
                buyers and sellers across the TechVerse marketplace.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck, title: "Protected access" },
                  { icon: Cpu, title: "Computer-first market" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
                    >
                      <Icon className="h-5 w-5 text-cyan-200" />
                      <div className="mt-3 text-sm font-semibold">
                        {item.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex min-h-[650px] items-center px-5 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <LoginForm />
              <p className="mt-7 text-center text-sm text-slate-500">
                Do not have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-blue-700 hover:text-blue-900"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
