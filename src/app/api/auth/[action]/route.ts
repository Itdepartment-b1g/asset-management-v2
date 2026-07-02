import "server-only";

import { NextResponse } from "next/server";
import { loginPost, signupPost } from "../auth";

type RouteContext = {
  params: Promise<{ action: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { action } = await context.params;

  if (action === "login") {
    return loginPost(request);
  }

  if (action === "signup") {
    return signupPost(request);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
