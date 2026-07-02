"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { signupUser } from "@/lib/store/auth";
import { useAppDispatch } from "@/lib/store/hooks";

type SignupListProps = {
  embedded?: boolean;
  stayOnPage?: boolean;
  onSwitchToLogin?: () => void;
};

export default function SignupList({
  embedded = false,
  stayOnPage = false,
  onSwitchToLogin,
}: SignupListProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleSignup(
    email: string,
    password: string,
    fullName?: string,
  ) {
    await dispatch(
      signupUser({ email, password, full_name: fullName }),
    ).unwrap();
    if (stayOnPage) {
      router.refresh();
      return;
    }
    router.push("/categories");
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
          Create account
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Get started with your own workspace and categories.
        </p>
      </div>

      <AuthForm mode="signup" onSubmit={handleSignup} />

      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            Sign in
          </button>
        ) : (
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            Sign in
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
