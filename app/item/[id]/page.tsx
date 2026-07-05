import { handleGetItemById } from "@/lib/actions/item-action";
import { getAuthUser } from "@/lib/actions/auth-action";
import { handleGetCart } from "@/lib/actions/cart-action";
import ItemDetailView from "@/app/item/ItemDetailView";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function getId(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
    if (value.$oid) return String(value.$oid);
  }

  return null;
}

function findItem(response: any) {
  if (!response) return null;

  // Direct item
  if (response._id || response.id) return response;

  // Common wrapped shapes
  if (response.item && (response.item._id || response.item.id)) {
    return response.item;
  }

  if (response.data && (response.data._id || response.data.id)) {
    return response.data;
  }

  if (
    response.data &&
    response.data.item &&
    (response.data.item._id || response.data.item.id)
  ) {
    return response.data.item;
  }

  if (
    response.data &&
    response.data.data &&
    (response.data.data._id || response.data.data.id)
  ) {
    return response.data.data;
  }

  if (
    response.data &&
    response.data.data &&
    response.data.data.item &&
    (response.data.data.item._id || response.data.data.item.id)
  ) {
    return response.data.data.item;
  }

  // Fallbacks
  if (response.item) return response.item;
  if (response.data) return response.data;

  return null;
}

function getCartEntryProductId(entry: any): string | null {
  return (
    getId(entry?.productId) ||
    getId(entry?.product) ||
    getId(entry?.item) ||
    getId(entry?.itemId) ||
    null
  );
}

export default async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
        <h2 className="text-xl font-semibold text-gray-800">Invalid item</h2>
        <p className="mt-3">Item id is missing.</p>
      </div>
    );
  }

  const res = await handleGetItemById(id);
  const item = findItem(res) || findItem(res?.data) || null;

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
        <h2 className="text-xl font-semibold text-gray-800">Item not found</h2>

        <p className="mt-3">
          We couldn't find this item. It may have been removed or the id is
          invalid.
        </p>

        <div className="mt-4 text-sm text-gray-700">
          <div>
            <strong>Requested id:</strong>{" "}
            <span className="ml-1">{String(id)}</span>
          </div>
        </div>

        <details className="mt-4 text-left text-xs text-gray-600">
          <summary className="cursor-pointer text-sm text-gray-700">
            Debug response
          </summary>

          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-gray-100 p-3 text-xs">
            {JSON.stringify(res, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  const productId = getId(item) || id;

  const authUser = await getAuthUser();

  const currentUserId =
    getId(authUser) ||
    getId((authUser as any)?.user) ||
    getId((authUser as any)?.data) ||
    null;

  const cartResult = await handleGetCart();

  const cartItem = cartResult?.data?.items?.find((entry) => {
    const entryProductId = getCartEntryProductId(entry);
    return String(entryProductId) === String(productId);
  });

  return (
    <ItemDetailView
      key={`${productId}-${cartItem?._id ?? "not-in-cart"}`}
      item={item}
      currentUserId={currentUserId}
      initialCartItemId={cartItem?._id ?? null}
    />
  );
}