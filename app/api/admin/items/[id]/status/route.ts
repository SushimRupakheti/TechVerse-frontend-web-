import { forwardAdminJson } from "@/lib/admin/route-proxy";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forwardAdminJson(req, `/api/admin/items/${id}/status`, "PUT");
}
