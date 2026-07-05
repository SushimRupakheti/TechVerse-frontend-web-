import CartView from "./CartView";
import { handleGetCart } from "@/lib/actions/cart-action";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await handleGetCart();
  const cart = result.data ?? { cart: null, items: [], totalPrice: 0 };
  const cartKey = `${cart.items.map((item) => item._id).join("-")}-${cart.totalPrice}`;

  return (
    <CartView
      key={cartKey}
      initialCart={cart}
      initialError={result.success ? null : result.message ?? "Failed to fetch cart"}
    />
  );
}
