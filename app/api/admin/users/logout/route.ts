import { forwardAdminLogout } from "@/lib/admin/route-proxy";

export async function POST(req: Request) {
  return forwardAdminLogout(req, "/api/admin/users/logout");
}
