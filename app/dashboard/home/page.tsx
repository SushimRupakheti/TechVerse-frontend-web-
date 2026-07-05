import { handleGetAllItems } from "@/lib/actions/item-action";
import DashboardHomeView from "./DashboardHomeView";

export default async function DashboardHomePage() {
  const res = await handleGetAllItems();
  const apiRes = res as {
    success?: boolean;
    message?: string;
    data?: unknown;
    items?: unknown;
  };

  // normalize different possible response shapes
  let items: Record<string, unknown>[] = [];
  if (res?.success) {
    const d = res.data;
    const nestedData =
      d && typeof d === "object" && "data" in d ? d.data : undefined;
    const nestedItems =
      d && typeof d === "object" && "items" in d ? d.items : undefined;
    const apiDataItems =
      apiRes.data && typeof apiRes.data === "object" && "items" in apiRes.data
        ? apiRes.data.items
        : undefined;

    if (Array.isArray(d)) items = d as Record<string, unknown>[];
    else if (Array.isArray(nestedData)) items = nestedData as Record<string, unknown>[];
    else if (Array.isArray(nestedItems)) items = nestedItems as Record<string, unknown>[];
    else if (Array.isArray(apiRes.items)) items = apiRes.items as Record<string, unknown>[];
    else if (Array.isArray(apiDataItems)) items = apiDataItems as Record<string, unknown>[];
    else if (d && typeof d === "object") {
      // try to find first array field
      const arr = Object.values(d).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) items = arr as Record<string, unknown>[];
    }
  }

  const availableItems = items.filter((item) => {
    const status = String(item.status ?? "").trim().toLowerCase();
    const isSold = item.isSold === true || String(item.isSold).toLowerCase() === "true";
    return !isSold && status !== "sold";
  });

  return <DashboardHomeView items={availableItems} anyRes={apiRes} />;
}
