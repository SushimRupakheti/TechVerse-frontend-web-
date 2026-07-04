import { forwardAdminRequest } from "@/lib/admin/route-proxy";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forwardAdminRequest(req, `/api/admin/payments/${id}`, { method: "GET" });
}
