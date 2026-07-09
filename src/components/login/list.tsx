"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { get_dashboard_path } from "@/lib/auth/dashboard";
import { loginUser } from "@/lib/store/auth";
import { useAppDispatch } from "@/lib/store/hooks";

function BrandLogo() {
  return (
    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
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
    const destination = next ?? get_dashboard_path(user.role);

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center text-white lg:min-h-screen lg:px-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"
        />
        <div aria-hidden className="absolute inset-0 bg-violet-700/85" />

        <div className="relative z-10 max-w-sm">
          <BrandLogo />
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-100">
            B1G
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight lg:text-4xl">
            Welcome to B1G Asset Management
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-violet-100 lg:text-base">
            Track, organize, and manage your organization&apos;s assets with
            secure role-based access.
          </p>
        </div>
      </section>

      <section className="flex min-h-[480px] flex-col justify-center bg-white px-8 py-12 lg:min-h-screen lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-3xl font-bold text-zinc-900">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to your account to continue
          </p>

          <div className="mt-8">
            <AuthForm variant="card" onSubmit={handleLogin} />
          </div>
        </div>
      </section>
    </div>
  );
}
