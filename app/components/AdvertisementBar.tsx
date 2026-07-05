export default function AdvertisementBar() {
  return (
    <div className="w-full bg-blue-950 text-blue-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <p className="truncate">
            TechVerse launch deals on laptops, desktops, and PC parts.{" "}
            <span className="cursor-pointer font-semibold underline underline-offset-2">
              Shop Now
            </span>
          </p>

          <button className="hidden items-center gap-2 text-blue-100 hover:text-white sm:inline-flex">
            English <span className="text-[10px]">v</span>
          </button>
        </div>
      </div>
    </div>
  );
}
