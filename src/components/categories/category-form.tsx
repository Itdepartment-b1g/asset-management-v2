"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryFormProps = {
  categoryId?: string;
  defaultTitle?: string;
  submitLabel: string;
};

export function CategoryForm({
  categoryId,
  defaultTitle = "",
  submitLabel,
}: CategoryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmed = title.trim();

    if (!trimmed) {
      setError("Title is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = categoryId ? "PATCH" : "POST";
      const body = categoryId
        ? { id: categoryId, title: trimmed }
        : { title: trimmed };

      const response = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/categories");
      router.refresh();
    } catch {
      setError("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Title</span>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
