import { forwardAdminRequest, forwardAdminJson } from "@/lib/admin/route-proxy";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forwardAdminRequest(req, `/api/admin/items/${id}`, { method: "GET" });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forwardAdminJson(req, `/api/admin/items/${id}`, "PUT");
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return forwardAdminRequest(req, `/api/admin/items/${id}`, { method: "DELETE" });
}
