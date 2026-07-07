import BookingForm from "../BookingForm";
import { getItemById } from "@/lib/api/items";
import { getUserData } from "@/lib/cookie";
import { fetchMyProfile } from "@/lib/actions/user-action";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

type RecordLike = Record<string, unknown>;

function isRecord(value: unknown): value is RecordLike {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getItemFromResponse(value: unknown): RecordLike | null {
  if (!isRecord(value)) return null;
  return isRecord(value.item) ? value.item : value;
}

export default async function Page({ params }: Props) {
  // `params` may be a Promise in some Next versions — unwrap if necessary
  const resolvedParams = await params;
  const { id } = resolvedParams;
  let item: RecordLike | null = null;

  try {
    const res = await getItemById(id);
    // API might return { success: true, item: { ... } }
    item = getItemFromResponse(res);
  } catch {
    // ignore; item stays null
  }

  const profileRes = await fetchMyProfile().catch(() => null);
  const user = profileRes?.success ? profileRes.data : await getUserData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-4 text-sm text-gray-500">Home / Category / <span className="text-gray-900">{readString(item?.phoneModel) || readString(item?.itemName) || 'Product'}</span> / Booking Confirmation</nav>

      <h1 className="mb-6 text-3xl font-semibold">Booking Confirmation</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <BookingForm item={item ?? undefined} user={user} />
        </div>

        <aside className="rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Summary</p>
          <h3 className="mt-2 text-lg font-semibold">{readString(item?.phoneModel) || readString(item?.itemName) || 'Product'}</h3>
          <p className="mt-1 text-sm text-gray-700">Price: NPR {readNumber(item?.finalPrice ?? item?.price ?? item?.basePrice).toLocaleString()}</p>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Seller</p>
            <p className="mt-1 text-sm">
              {isRecord(item?.sellerId)
                ? `${readString(item.sellerId.firstName)} ${readString(item.sellerId.lastName)}`.trim()
                : ""}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
