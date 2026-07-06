"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import HomeCard from "@/app/components/homeCard";
import {
  ArrowRight,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Laptop,
  Menu,
  Monitor,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  Zap,
} from "lucide-react";

type MarketplaceItem = Record<string, unknown>;

type ApiResultMeta = {
  success?: boolean;
  message?: string;
};

type Props = {
  items: MarketplaceItem[];
  anyRes?: ApiResultMeta;
};

const EMPTY_ITEMS: MarketplaceItem[] = [];

// Replace this with your final hero image later, for example: "/techverse-hero.png".
const HERO_IMAGE = "/bg.png";

const QUICK_CATEGORIES = [
  {
    label: "Laptops",
    icon: Laptop,
    terms: ["laptop", "notebook", "macbook"],
    image: "/laptop1.png",
    desc: "Find great laptops",
  },
  {
    label: "Desktops",
    icon: Monitor,
    terms: ["desktop", "pc", "computer", "tower"],
    image: "/desktop.png",
    desc: "Powerful desktops",
  },
  {
    label: "Graphics Cards",
    icon: Gamepad2,
    terms: ["gpu", "graphics", "rtx", "gtx"],
    image: "/graphic.png",
    desc: "Top GPU brands",
  },
  {
    label: "Processors",
    icon: Cpu,
    terms: ["cpu", "processor", "intel", "amd"],
    image: "/processor.png",
    desc: "Intel and AMD CPUs",
  },
  {
    label: "RAM",
    icon: PackageCheck,
    terms: ["ram", "memory", "ddr4", "ddr5"],
    image: "/ram.png",
    desc: "DDR4, DDR5 and more",
  },
  {
    label: "Storage",
    icon: HardDrive,
    terms: ["ssd", "hdd", "storage", "drive"],
    image: "/storage.png",
    desc: "HDDs, SSDs and more",
  },
];

const SIDEBAR_CATEGORIES = [
  "Laptops",
  "Desktops",
  "Graphics Cards",
  "Processors",
  "Motherboards",
  "RAM",
  "Storage",
  "Monitor",
  "Accessories",
];

function getStringField(item: MarketplaceItem, key: string) {
  const value = item[key];
  return value === null || value === undefined ? "" : String(value);
}

function getItemKey(item: MarketplaceItem) {
  return (
    getStringField(item, "_id") ||
    getStringField(item, "id") ||
    getStringField(item, "phoneModel") ||
    getStringField(item, "itemName")
  );
}

function isSoldItem(item: MarketplaceItem) {
  const status = getStringField(item, "status").trim().toLowerCase();
  const isSold = getStringField(item, "isSold").trim().toLowerCase();

  return item.isSold === true || isSold === "true" || status === "sold";
}

function getCategory(item: MarketplaceItem) {
  const candidates = [
    item.category,
    item.type,
    item.brand,
    item.make,
    item.manufacturer,
    item.brandName,
    item.model,
  ];

  for (const candidate of candidates) {
    if (candidate) return String(candidate);
  }

  if (item.phoneModel) return String(item.phoneModel).split(" ")[0];
  if (item.itemName) return String(item.itemName).split(" ")[0];
  return null;
}

function itemSearchText(item: MarketplaceItem) {
  return [
    item.category,
    item.type,
    item.brand,
    item.phoneModel,
    item.itemName,
    item.title,
    item.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterMatches(item: MarketplaceItem, label: string) {
  const config = QUICK_CATEGORIES.find((category) => category.label === label);
  if (!config) return getCategory(item) === label;

  const text = itemSearchText(item);
  return config.terms.some((term) => text.includes(term.toLowerCase()));
}

export default function DashboardHomeView({
  items: initialItems = EMPTY_ITEMS,
  anyRes,
}: Props) {
  const [showOnlyProducts, setShowOnlyProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const items = useMemo(
    () => initialItems.filter((item) => !isSoldItem(item)),
    [initialItems]
  );

  const backendCategories = useMemo(
    () => Array.from(new Set(items.map(getCategory).filter(Boolean))) as string[],
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((item) => filterMatches(item, selectedCategory));
  }, [items, selectedCategory]);

  const latestItems = filteredItems.slice(0, 8);
  const moreItems = filteredItems.slice(8, 16);

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setShowOnlyProducts(false);
  };

  if (showOnlyProducts) {
    return (
      <main className="bg-[#f5f8ff] text-slate-900">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                TechVerse Market
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                Browse all computers and PC parts
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyProducts(false)}
              className="rounded-md border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Back to storefront
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`rounded-md border px-3 py-2 text-sm ${
                !selectedCategory
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-blue-100 bg-white text-slate-700"
              }`}
            >
              All Products
            </button>

            {[...QUICK_CATEGORIES.map((c) => c.label), ...backendCategories].map(
              (category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    selectedCategory === category
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-blue-100 bg-white text-slate-700"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          {filteredItems.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {filteredItems.map((item) => (
                <HomeCard key={getItemKey(item)} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-blue-100 bg-white py-14 text-center text-sm text-slate-500">
              <div>No hardware found</div>
              {anyRes?.success === false && (
                <div className="mt-2 text-xs text-red-500">
                  {anyRes.message || "Fetch failed"}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,_#f7faff_0%,_#eef5ff_45%,_#f8fafc_100%)] text-slate-900">
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-lg border border-blue-100 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white">
                <Menu className="h-4 w-4" />
              </span>
              Categories
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
              {SIDEBAR_CATEGORIES.length}
            </span>
          </div>

          <div className="space-y-1">
            {SIDEBAR_CATEGORIES.map((category) => {
              const iconConfig =
                QUICK_CATEGORIES.find((item) => item.label === category) ||
                QUICK_CATEGORIES.find((item) => category.includes(item.label));
              const Icon = iconConfig?.icon || Wrench;
              const active = selectedCategory === category;

              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => selectCategory(active ? null : category)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowOnlyProducts(true)}
            className="mt-5 flex w-full items-center justify-between rounded-md bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>

        <div className="relative overflow-hidden rounded-lg bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,_rgba(59,130,246,0.45),_transparent_36%),linear-gradient(135deg,_#0f172a_0%,_#0b4fd8_48%,_#0891ff_100%)]" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute bottom-8 right-10 hidden rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-xs text-blue-50 backdrop-blur md:block">
            <div className="font-semibold text-white">Verified Tech Deals</div>
            <div className="mt-1">Fresh laptops, PCs, GPUs and upgrades</div>
          </div>

          <div className="relative grid min-h-[440px] grid-cols-1 items-center gap-6 px-7 py-8 md:grid-cols-[minmax(0,0.82fr)_minmax(430px,1.18fr)] md:px-10">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur">
                <Zap className="h-3.5 w-3.5 text-cyan-200" />
                Nepal&apos;s computer marketplace
              </div>
              <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl">
                Find the right tech for your next upgrade.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-blue-50">
                Buy and sell laptops, gaming PCs, components, monitors, and
                accessories from one focused TechVerse marketplace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnlyProducts(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Sell Your Tech
                </button>
              </div>

              <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
                {[
                  ["12K+", "Listings"],
                  ["4.8", "Rating"],
                  ["24h", "Review"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="text-lg font-bold">{value}</div>
                    <div className="mt-0.5 text-[11px] text-blue-100">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[350px] md:min-h-[410px]">
              <Image
                src={HERO_IMAGE}
                alt="TechVerse computer products"
                fill
                className="scale-[1.15] object-contain drop-shadow-2xl md:scale-[1.3]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-0 rounded-lg border border-blue-100 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.07)] md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Safe & Secure",
              desc: "Secure payments and trusted sellers",
            },
            {
              icon: PackageCheck,
              title: "Quality Assured",
              desc: "Verified listings and quality checked",
            },
            {
              icon: ShoppingBag,
              title: "Great Deals",
              desc: "Best prices on new and used tech",
            },
            {
              icon: Headphones,
              title: "Easy Listing",
              desc: "List your products quickly and free",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`flex gap-3 p-5 ${
                  index ? "border-t border-blue-100 md:border-l md:border-t-0" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Icon className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Browse by hardware
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Popular Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyProducts(true)}
            className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = selectedCategory === category.label;
            return (
              <button
                type="button"
                key={category.label}
                onClick={() => selectCategory(active ? null : category.label)}
                className={`group rounded-lg border bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.13)] ${
                  active ? "border-blue-700 ring-2 ring-blue-100" : "border-blue-100"
                }`}
              >
                <div className="relative mx-auto h-24 w-full rounded-md bg-gradient-to-br from-slate-50 to-blue-50 p-2">
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    className="object-contain p-2 transition duration-300 group-hover:scale-110"
                    sizes="180px"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-950">
                  <Icon className="h-4 w-4 text-blue-700" />
                  {category.label}
                </div>
                <p className="mt-1 text-xs text-slate-500">{category.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Fresh marketplace
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Latest Listings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyProducts(true)}
            className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            View All Listings
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {latestItems.length ? (
            latestItems.map((item) => (
              <HomeCard key={getItemKey(item)} item={item} />
            ))
          ) : (
            <div className="col-span-full rounded-md border border-blue-100 bg-white py-12 text-center text-sm text-slate-500">
              <div>No listings found</div>
              {anyRes?.success === false && (
                <div className="mt-2 text-xs text-red-500">
                  {anyRes.message || "Fetch failed"}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {moreItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Recommended
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                More Tech Deals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyProducts(true)}
              className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              See More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {moreItems.map((item) => (
              <HomeCard key={getItemKey(item)} item={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
