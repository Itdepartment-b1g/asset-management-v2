import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

type AsyncStatusProps = {
  loading: boolean;
  error: string | null;
  success?: string | null;
  loadingMessage?: string;
};

export function AsyncStatus({
  loading,
  error,
  success = null,
  loadingMessage = "Loading...",
}: AsyncStatusProps) {
  if (loading) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-zinc-500">
        <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
        {loadingMessage}
      </p>
    );
  }

  if (error) {
    return (
      <p className="inline-flex w-fit items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p className="inline-flex w-fit items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CircleCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        {success}
      </p>
    );
  }

  return null;
}
