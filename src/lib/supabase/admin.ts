import "server-only";

import { createClient } from "@supabase/supabase-js";

export function create_admin_client() {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabase_url || !service_role_key) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
