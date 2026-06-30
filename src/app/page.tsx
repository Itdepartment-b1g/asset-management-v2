import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Asset Management</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Practice project with Next.js, Prisma, and Supabase.
      </p>
      <Link href="/docs" className="w-fit underline">
        API docs (Swagger) →
      </Link>
    </main>
  );
}
