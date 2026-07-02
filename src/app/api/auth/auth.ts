import "server-only";

import { authController } from "@/server/controllers/auth_controller";

type SignupBody = {
  email?: string;
  password?: string;
  full_name?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

export async function signupPost(request: Request) {
  const body = (await request.json()) as SignupBody;
  return authController.signup(body);
}

export async function loginPost(request: Request) {
  const body = (await request.json()) as LoginBody;
  return authController.login(body);
}
