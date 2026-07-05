import Image from "next/image";
import {
  BadgeCheck,
  Clock3,
  Headphones,
  Lightbulb,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";

const STATS = [
  {
    value: "50K+",
    title: "Happy Customers",
    desc: "And growing every day",
    icon: ShoppingBag,
  },
  {
    value: "100K+",
    title: "Products Listed",
    desc: "Across all categories",
    icon: PackageCheck,
  },
  {
    value: "100%",
    title: "Safe & Secure",
    desc: "Trusted by thousands",
    icon: ShieldCheck,
  },
  {
    value: "24/7",
    title: "Customer Support",
    desc: "We are here to help",
    icon: Headphones,
  },
];

const WHY_TECHVERSE = [
  {
    title: "Trusted & Secure",
    desc: "We prioritize your safety with secure payments and buyer protection.",
    icon: ShieldCheck,
  },
  {
    title: "Great Deals",
    desc: "Find the best prices on new and used tech from trusted sellers.",
    icon: Tag,
  },
  {
    title: "Easy & Fast",
    desc: "List, buy, and sell in just a few clicks with a smooth experience.",
    icon: Clock3,
  },
  {
    title: "Support You Can Count On",
    desc: "Our support team is always ready to assist you.",
    icon: Headphones,
  },
];

const VALUES = [
  {
    title: "Integrity",
    desc: "We believe in transparency and honest dealings.",
    icon: BadgeCheck,
  },
  {
    title: "Community",
    desc: "We build connections and empower our tech community.",
    icon: Users,
  },
  {
    title: "Innovation",
    desc: "We embrace change and continually improve our platform.",
    icon: Lightbulb,
  },
  {
    title: "Customer First",
    desc: "Your satisfaction is our top priority.",
    icon: Store,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full border border-blue-200/70" />
        <div className="absolute right-6 top-24 h-28 w-28 rounded-full bg-blue-100/60" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[360px] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:px-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-blue-950 sm:text-5xl">
              About TechVerse
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              TechVerse is your trusted marketplace to buy and sell computers,
              laptops, and PC components with confidence and ease.
            </p>
            <div className="mt-6 h-1 w-14 rounded-full bg-blue-600" />
            <p className="mt-4 text-sm font-semibold text-blue-700">
              Technology for Everyone. Marketplace for All.
            </p>
          </div>

          <div className="relative min-h-[280px]">
            <Image
              src="/bg2.png"
              alt="TechVerse computers and components"
              fill
              className="scale-110 object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-950">Our Story</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              TechVerse was founded with a simple idea: technology should be
              accessible to everyone. Whether you are a student looking for your
              first laptop, a gamer upgrading your setup, or a professional
              selling your old gear, we are here to make the process safe,
              simple, and rewarding.
            </p>
            <p>
              We built TechVerse to connect passionate tech buyers and sellers
              in one secure and reliable platform.
            </p>
          </div>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-blue-100 bg-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <Image
            src="/shop1.jpg"
            alt="TechVerse workspace"
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 1024px) 100vw, 520px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/25 to-transparent" />
          <div className="absolute left-8 top-8 flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold">TechVerse</div>
              <div className="text-xs text-blue-100">
                Built for modern tech trade
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-[0_18px_45px_rgba(37,99,235,0.09)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`p-7 text-center ${
                  index ? "border-t border-blue-100 sm:border-l sm:border-t-0" : ""
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-4 text-3xl font-bold text-blue-700">
                  {stat.value}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-blue-950">
                  {stat.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{stat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-950">Why TechVerse?</h2>
          <p className="mt-2 text-sm text-slate-500">
            We are more than just a marketplace.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_TECHVERSE.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-blue-100 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-blue-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-950">Our Values</h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {value.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-1.5 bg-blue-700" />
    </main>
  );
}
