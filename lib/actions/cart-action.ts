"use server";

import { revalidatePath } from "next/cache";
import { API } from "@/lib/api/endpoints";
import { getAuthToken } from "@/lib/cookie";

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export type CartProduct = {
  _id?: string;
  id?: string;
  phoneModel?: string;
  itemName?: string;
  category?: string;
  finalPrice?: number;
  price?: number;
  photos?: string[];
  isSold?: boolean;
  status?: string;
  description?: string;
};

export type CartItem = {
  _id: string;
  cartId?: string;
  productId?: CartProduct | string | null;
  priceAtTime?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CartData = {
  cart: Record<string, unknown> | null;
  items: CartItem[];
  totalPrice: number;
};

type ActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

type CartApiResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function normalizeCartData(data: unknown): CartData {
  const root = isRecord(data) ? data : {};
  const source = isRecord(root.data) ? root.data : root;

  const cart = source.cart ?? null;
  const cartRecord = isRecord(cart) ? cart : {};

  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(cartRecord.items)
      ? cartRecord.items
      : Array.isArray(source.cartItems)
        ? source.cartItems
        : [];

  return {
    cart: isRecord(cart) ? cart : null,
    items: items as CartItem[],
    totalPrice: Number(source.totalPrice ?? source.total ?? 0),
  };
}

function getCartProductId(item: CartItem) {
  if (typeof item.productId === "string") return item.productId;

  return item.productId?._id ?? item.productId?.id ?? null;
}

function findCartItemByProductId(cart: CartData, productId: string) {
  return cart.items.find((item) => {
    const currentProductId = getCartProductId(item);
    return String(currentProductId) === String(productId);
  });
}

function normalizeCartItem(value: unknown): CartItem | undefined {
  if (!isRecord(value)) return undefined;

  const id = value._id ?? value.id;
  if (!id) return undefined;

  return {
    _id: String(id),
    cartId: typeof value.cartId === "string" ? value.cartId : undefined,
    productId:
      typeof value.productId === "string" || isRecord(value.productId)
        ? (value.productId as CartItem["productId"])
        : null,
    priceAtTime:
      typeof value.priceAtTime === "number"
        ? value.priceAtTime
        : Number(value.priceAtTime ?? 0),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

async function cartRequest(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; data: CartApiResponse; status: number }> {
  const token = await getAuthToken();

  if (!token) {
    return {
      ok: false,
      data: {
        success: false,
        message: "Please login to use cart.",
      } satisfies CartApiResponse,
      status: 401,
    };
  }

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();

  let data: CartApiResponse = {};

  try {
    data = text ? (JSON.parse(text) as CartApiResponse) : {};
  } catch {
    data = {
      success: false,
      message: text || "Invalid server response",
    };
  }

  return {
    ok: response.ok,
    data,
    status: response.status,
  };
}

export async function handleAddToCart(
  productId: string
): Promise<ActionResult<CartItem>> {
  if (!productId) {
    return {
      success: false,
      message: "Product id is required",
    };
  }

  try {
    const { ok, data, status } = await cartRequest(API.CART.ADD, {
      method: "POST",
      body: JSON.stringify({ productId }),
    });

    if (ok && data?.success) {
      const latest = await cartRequest(API.CART.GET, {
        method: "GET",
      });
      const latestCart =
        latest.ok && latest.data?.success
          ? normalizeCartData(latest.data)
          : null;
      const addedCartItem = latestCart
        ? findCartItemByProductId(latestCart, productId)
        : null;

      revalidatePath("/dashboard/cart");
      revalidatePath(`/item/${productId}`);

      return {
        success: true,
        message: data.message || "Product added to cart",
        data: addedCartItem ?? normalizeCartItem(data.data),
      };
    }

    // Your backend throws 409 when product already exists.
    // Here frontend fetches cart and finds the existing cartItem id.
    if (
      status === 409 ||
      String(data?.message || "").toLowerCase().includes("already")
    ) {
      const latest = await cartRequest(API.CART.GET, {
        method: "GET",
      });

      if (latest.ok && latest.data?.success) {
        const latestCart = normalizeCartData(latest.data);

        const existingCartItem = findCartItemByProductId(
          latestCart,
          productId
        );

        if (existingCartItem) {
          revalidatePath("/dashboard/cart");
          revalidatePath(`/item/${productId}`);

          return {
            success: true,
            message: "Product already in cart",
            data: existingCartItem,
          };
        }
      }

      return {
        success: false,
        message:
          "Product already in cart, but cart item id could not be found.",
      };
    }

    return {
      success: false,
      message: data?.message || "Failed to add product to cart",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getErrorMessage(err, "Failed to add product to cart"),
    };
  }
}

export async function handleGetCart(): Promise<ActionResult<CartData>> {
  try {
    const { ok, data } = await cartRequest(API.CART.GET, {
      method: "GET",
    });

    if (ok && data?.success) {
      return {
        success: true,
        data: normalizeCartData(data),
      };
    }

    return {
      success: false,
      message: data?.message || "Failed to fetch cart",
      data: {
        cart: null,
        items: [],
        totalPrice: 0,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getErrorMessage(err, "Failed to fetch cart"),
      data: {
        cart: null,
        items: [],
        totalPrice: 0,
      },
    };
  }
}

export async function handleRemoveCartItem(
  id: string
): Promise<ActionResult> {
  if (!id) {
    return {
      success: false,
      message: "Cart item id is required",
    };
  }

  try {
    const { ok, data } = await cartRequest(API.CART.REMOVE(id), {
      method: "DELETE",
    });

    if (ok && data?.success) {
      revalidatePath("/dashboard/cart");
      revalidatePath("/item/[id]", "page");

      return {
        success: true,
        message: data.message || "Cart item removed",
      };
    }

    return {
      success: false,
      message: data?.message || "Failed to remove cart item",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getErrorMessage(err, "Failed to remove cart item"),
    };
  }
}
