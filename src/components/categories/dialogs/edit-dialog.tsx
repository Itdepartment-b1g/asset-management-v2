"use client";

import { useState } from "react";
import { CategoryForm } from "@/components/categories/form/category-form";
import { editCategory, type Category } from "@/lib/store/categories-slice";
import { useAppDispatch } from "@/lib/store/hooks";

type EditDialogProps = {
  open: boolean;
  category: Category | null;
  onClose: () => void;
};

export function EditDialog({ open, category, onClose }: EditDialogProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !category) return null;

  async function handleSubmit(title: string) {
    setIsSubmitting(true);
    try {
      await dispatch(editCategory({ id: category!.id, title })).unwrap();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Edit category
        </h2>
        <CategoryForm
          key={category.id}
          defaultTitle={category.title}
          submitLabel="Update"
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
