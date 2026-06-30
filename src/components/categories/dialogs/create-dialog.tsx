"use client";

import { useState } from "react";
import { CategoryForm } from "@/components/categories/form/category-form";
import { addCategory } from "@/lib/store/categories-slice";
import { useAppDispatch } from "@/lib/store/hooks";

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateDialog({ open, onClose }: CreateDialogProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(title: string) {
    setIsSubmitting(true);
    try {
      await dispatch(addCategory(title)).unwrap();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Add category
        </h2>
        <CategoryForm
          submitLabel="Create"
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
