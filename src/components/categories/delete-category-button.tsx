"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this category?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete category");
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
