import { forwardAdminRequest } from "@/lib/admin/route-proxy";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return forwardAdminRequest(req, `/api/admin/payments${url.search}`, { method: "GET" });
}
