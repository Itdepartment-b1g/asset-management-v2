type AsyncStatusProps = {
  loading: boolean;
  error: string | null;
  loadingMessage?: string;
};

export function AsyncStatus({
  loading,
  error,
  loadingMessage = "Loading...",
}: AsyncStatusProps) {
  if (loading) {
    return <p className="text-sm text-zinc-500">{loadingMessage}</p>;
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </p>
    );
  }

  return null;
}
