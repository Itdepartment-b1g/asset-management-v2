import Link from "next/link";
import { Suspense } from "react";
import HomeAuthPanel from "@/components/home/auth-panel";
import { LogoutButton } from "@/components/common/logout-button";
import { getSessionUser } from "@/server/auth/session";

const features = [
  "Layered API: route → controller → repository",
  "Prisma + Supabase Postgres with per-user CRUD",
  "Redux Toolkit + OpenAPI/Swagger docs",
];

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    return (
      <main className="mx-auto w-full max-w-4xl px-8 py-16">
        <div className="flex flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Welcome back</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                {user.full_name ?? user.email}
              </h1>
              <p className="mt-2 text-zinc-600">
                Jump back into your workspace or explore the API.
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/categories"
              className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
                Categories
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Manage your categories with full CRUD.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-zinc-900">
                Open categories →
              </span>
            </Link>

            <Link
              href="/docs"
              className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
                API docs
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Browse the OpenAPI spec in Swagger UI.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-zinc-900">
                View docs →
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-8 py-12 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <section className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Starter template
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 lg:text-5xl">
              Next.js + Supabase
            </h1>
            <p className="mt-4 max-w-lg text-lg text-zinc-600">
              Full-stack starter with Prisma, Redux, layered API routes, and
              Swagger — deploy to Vercel with Supabase Cloud.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-zinc-700"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/docs"
            className="w-fit text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            API docs (Swagger) →
          </Link>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500">Loading sign in...</p>
            }
          >
            <HomeAuthPanel />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
