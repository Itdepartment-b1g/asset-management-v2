import "server-only";

import { hris_auth_controller } from "@/server/controllers/hris_auth_controller";

export async function GET(request: Request) {
  return hris_auth_controller.handle_callback(request);
}
