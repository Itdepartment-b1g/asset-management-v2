import { Suspense } from "react";
import LoginList from "@/components/login/list";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-zinc-500">Loading sign in...</p>
        </div>
      }
    >
      <LoginList />
    </Suspense>
  );
}
