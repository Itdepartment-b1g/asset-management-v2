import "server-only";

import { jwtVerify } from "jose";

export type HrisSsoPayload = {
  hris_employee_id: string;
  employee_code: string;
  company_email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  is_active: boolean;
};

export class HrisSsoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrisSsoError";
  }
}

function get_sso_secret() {
  const secret =
    process.env.HRIS_SSO_SECRET ?? process.env.ASSET_SSO_SECRET ?? "";

  if (!secret) {
    throw new HrisSsoError("HRIS SSO secret is not configured");
  }

  return new TextEncoder().encode(secret);
}

export function build_full_name(payload: HrisSsoPayload) {
  return [payload.first_name, payload.middle_name, payload.last_name]
    .filter((part) => part && part.trim().length > 0)
    .join(" ")
    .trim();
}

export async function verify_hris_token(token: string): Promise<HrisSsoPayload> {
  try {
    const { payload } = await jwtVerify(token, get_sso_secret(), {
      algorithms: ["HS256"],
    });

    const hris_employee_id = String(payload.hris_employee_id ?? "").trim();
    const employee_code = String(payload.employee_code ?? "").trim();
    const company_email = String(payload.company_email ?? "").trim();
    const first_name = String(payload.first_name ?? "").trim();
    const last_name = String(payload.last_name ?? "").trim();
    const middle_name = payload.middle_name
      ? String(payload.middle_name).trim()
      : null;
    const is_active = payload.is_active !== false;

    if (!hris_employee_id) {
      throw new HrisSsoError("hris_employee_id is required");
    }

    if (!employee_code) {
      throw new HrisSsoError("employee_code is required");
    }

    if (!company_email) {
      throw new HrisSsoError("company_email is required");
    }

    if (!first_name || !last_name) {
      throw new HrisSsoError("first_name and last_name are required");
    }

    if (!is_active) {
      throw new HrisSsoError("Employee account is inactive");
    }

    return {
      hris_employee_id,
      employee_code,
      company_email,
      first_name,
      middle_name,
      last_name,
      is_active,
    };
  } catch (error) {
    if (error instanceof HrisSsoError) {
      throw error;
    }

    throw new HrisSsoError("Invalid or expired SSO token");
  }
}
