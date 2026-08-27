export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">No access yet</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          You signed in successfully, but your account does not have access to
          Asset Management yet. Ask a Super Admin to assign your role.
        </p>
      </div>
    </main>
  );
}
