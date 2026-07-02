"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { loginUser } from "@/lib/store/auth";
import { useAppDispatch } from "@/lib/store/hooks";

type LoginListProps = {
  embedded?: boolean;
  stayOnPage?: boolean;
  onSwitchToSignup?: () => void;
};

export default function LoginList({
  embedded = false,
  stayOnPage = false,
  onSwitchToSignup,
}: LoginListProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/categories";

  async function handleLogin(email: string, password: string) {
    await dispatch(loginUser({ email, password })).unwrap();
    if (stayOnPage) {
      router.refresh();
      return;
    }
    router.push(next);
    router.refresh();
  }

  const formCard = (
    <div
      className={
        embedded
          ? "flex flex-col gap-6"
          : "rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      }
    >
      <div>
        <h1
          className={
            embedded
              ? "text-xl font-semibold text-zinc-900"
              : "text-2xl font-bold text-zinc-900"
          }
        >
          Sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to manage your categories and workspace.
        </p>
      </div>

      <AuthForm mode="login" onSubmit={handleLogin} />

      <p className="text-sm text-zinc-600">
        No account?{" "}
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            Create one
          </button>
        ) : (
          <Link
            href="/signup"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            Create one
          </Link>
        )}
      </p>
    </div>
  );

  if (embedded) {
    return formCard;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Home
      </Link>

      {formCard}
    </div>
  );
}
