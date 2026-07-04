import { forwardAdminJson } from "@/lib/admin/route-proxy";

export async function POST(req: Request) {
  return forwardAdminJson(req, "/api/admin/users/register", "POST");
}
