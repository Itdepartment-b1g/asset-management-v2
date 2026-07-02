import { Suspense } from "react";
import LoginList from "@/components/login/list";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center p-8">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading sign in...</p>}
      >
        <LoginList />
      </Suspense>
    </main>
  );
}
