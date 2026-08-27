"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { APP_PATHS } from "@/lib/auth/dashboard";
import { loginUser } from "@/lib/store/slices/auth-slices";
import { useAppDispatch } from "@/lib/store/hooks";

function BrandLogo() {
  return (
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
      <svg
        aria-hidden
        className="h-8 w-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
    </div>
  );
}

export default function LoginList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  async function handleLogin(email: string, password: string) {
    const user = await dispatch(loginUser({ email, password })).unwrap();
    const destination = next ?? APP_PATHS.home;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-500 via-violet-700 to-violet-900 px-4 py-10 lg:px-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-violet-900 px-8 py-12 text-white lg:px-12 lg:py-16">
          {/* Decorative circles, as in the reference mock */}
          <div
            aria-hidden
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-400/40"
          />
          <div
            aria-hidden
            className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-violet-500/50"
          />
          <div
            aria-hidden
            className="absolute bottom-10 left-8 h-32 w-32 rounded-full bg-gradient-to-br from-violet-300/60 to-violet-600/40"
          />

          <div className="relative z-10 flex h-full flex-col justify-center">
            <BrandLogo />
            <h1 className="mt-3 text-4xl font-extrabold tracking-wide">
              WELCOME
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-violet-200">
              B1G Asset Management
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-violet-100">
              Track, organize, and manage your organization&apos;s assets with
              secure role-based access.
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-center bg-white px-8 py-12 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-3xl font-bold text-zinc-900">Sign in</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Sign in to your account to continue
            </p>

            <div className="mt-8">
              <AuthForm variant="card" onSubmit={handleLogin} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
