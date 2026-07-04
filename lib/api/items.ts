// API Layer
// Call api from backend

import axios from "./axios";
import { API } from "./endpoints";
import cookie from 'cookie';

/* =========================
   Types
========================= */

export type ItemPayload = {
  photos?: string[];
  category?: string;
  phoneModel?: string;
  itemName?: string;
  year?: number;
  batteryHealth?: number;
  description?: string;
  deviceCondition?: string;
  price?: number;
  chargerAvailable?: boolean;
  repairedBoard?: boolean;
  factoryUnlock?: boolean;
  liquidDamage?: boolean;
  switchOn?: boolean;
  receiveCall?: boolean;
  features1Condition?: boolean;
  features2Condition?: boolean;
  cameraCondition?: boolean;
  displayCondition?: boolean;
  displayCracked?: boolean;
  displayOriginal?: boolean;
  sellerId?: string;
  finalPrice?: number;
  basePrice?: number;
};

/* =========================
   Create Item
========================= */

export const createItem = async (itemData: ItemPayload) => {
  try {
    const payload: ItemPayload = { ...itemData };
    if (payload.finalPrice === undefined || payload.finalPrice === null) {
      if (payload.price !== undefined && payload.price !== null) {
        payload.finalPrice = Number(payload.price);
      } else if (payload.basePrice !== undefined && payload.basePrice !== null) {
        payload.finalPrice = Number(payload.basePrice);
      }
    }

    // Use same-origin POST to our pages API proxy so cookies are forwarded
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(API.ITEMS.CREATE, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Create failed: ${res.status} ${res.statusText} - ${text.slice(0,200)}`);
    }

    const data = await res.json();

    // Debug: log finalPrice and key flags in the browser console
    try {
      console.log("createItem: payload sent", {
        finalPrice: payload.finalPrice,
        price: payload.price,
        liquidDamage: payload.liquidDamage,
        switchOn: payload.switchOn,
        receiveCall: payload.receiveCall,
        features1Condition: payload.features1Condition,
        features2Condition: payload.features2Condition,
        cameraCondition: payload.cameraCondition,
        displayCondition: payload.displayCondition,
        displayCracked: payload.displayCracked,
        displayOriginal: payload.displayOriginal,
        factoryUnlock: payload.factoryUnlock,
        chargerAvailable: payload.chargerAvailable,
        batteryHealth: payload.batteryHealth,
        year: payload.year,
        repairedBoard: (payload as any).repairedBoard,
      });
    } catch {
      // ignore
    }

    return data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Create item failed"
    );
  }
};

/* =========================
   Server-side proxy helper
   Mirrors pages/api/items/index.ts behavior so server code can forward
   requests to the backend with cookie -> Authorization forwarding.
   Usage: call `proxyCreateItem(body, cookieHeader)` from server code.
========================= */

export const proxyCreateItem = async (body: any, cookieHeader?: string) => {
  try {
    const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
    const target = `${BACKEND}/api/items`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      try {
        const parsed = cookie.parse(cookieHeader || '');
        const authToken = parsed.auth_token || parsed.token || undefined;
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      } catch (e) {
        // ignore cookie parse errors
      }
    }

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    const contentType = resp.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    return { success: resp.ok, message: text };
  } catch (err: any) {
    return { success: false, message: err.message || 'Proxy error' };
  }
};

/* =========================
   Upload Photos (client helper)
   Sends multipart/form-data to pages API route that uses multer
========================= */

export type UploadResult = { success: boolean; urls: string[]; message?: string; sellerId?: string };

export const uploadPhotos = async (files: (File | Blob)[]): Promise<UploadResult> => {
  try {
    const urls: string[] = [];
    let sellerId: string | undefined;

    // Backend expects single file field named `itemPhoto` on /api/items/upload-photo
    for (const file of files) {
      const form = new FormData();
      form.append("itemPhoto", file);

      const res = await fetch("/api/items/upload-photo", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, urls: [], message: `Upload failed: ${res.status} ${res.statusText} - ${text.slice(0,200)}` };
      }

      const data = await res.json();
      // backend returns { success: true, url: '/uploads/..' }
      if (data?.success) {
        if (data.url) urls.push(data.url);
        else if (Array.isArray(data.urls)) urls.push(...data.urls);
        // capture sellerId if backend provides it on upload
        if (!sellerId && data.sellerId) sellerId = data.sellerId;
      } else {
        const msg = data?.message || 'Upload failed';
        return { success: false, urls: [], message: msg };
      }
    }

    return { success: true, urls, sellerId };
  } catch (err: any) {
    return { success: false, urls: [], message: err?.message || "Upload failed" };
  }
};
/* =========================
   Get All Items
========================= */

export const getAllItems = async () => {
  try {
    const response = await axios.get(API.ITEMS.ALL);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch items failed"
    );
  }
};

/* =========================
   Get Item By ID
========================= */

export const getItemById = async (id: string) => {
  try {
    const response = await axios.get(API.ITEMS.BY_ID(id));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch item failed"
    );
  }
};

/* =========================
   Get Items By Seller
========================= */

export const getItemsBySeller = async (sellerId: string) => {
  try {
    const response = await axios.get(API.ITEMS.BY_SELLER(sellerId));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch seller items failed"
    );
  }
};

/* =========================
   Update Item
========================= */

export const updateItem = async (
  id: string,
  payload: Partial<ItemPayload>
) => {
  try {
    const response = await axios.put(
      API.ITEMS.UPDATE(id),
      payload
    );
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Update item failed"
    );
  }
};

/* =========================
   Delete Item
========================= */

export const deleteItem = async (id: string) => {
  try {
    const response = await axios.delete(API.ITEMS.DELETE(id));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Delete item failed"
    );
  }
};
