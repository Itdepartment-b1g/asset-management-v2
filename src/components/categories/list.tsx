"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateDialog } from "@/components/categories/dialogs/create-dialog";
import { DeleteDialog } from "@/components/categories/dialogs/delete-dialog";
import { EditDialog } from "@/components/categories/dialogs/edit-dialog";
import { CategoriesTable } from "@/components/categories/table/categories-table";
import { AsyncStatus } from "@/components/common/async-status";
import { LogoutButton } from "@/components/common/logout-button";
import { fetchCategories, type Category } from "@/lib/store/categories-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

export default function CategoriesList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, loading, error } = useAppSelector((state) => state.categories);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    void dispatch(fetchCategories()).then((result) => {
      if (
        fetchCategories.rejected.match(result) &&
        result.error.message === "Unauthorized"
      ) {
        router.push("/login?next=/categories");
      }
    });
  }, [dispatch, router]);

  function handleEdit(category: Category) {
    setSelectedCategory(category);
    setEditOpen(true);
  }

  function handleDelete(category: Category) {
    setSelectedCategory(category);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Home
        </Link>
        <LogoutButton />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage asset categories
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          Add category
        </button>
      </div>

      <AsyncStatus
        loading={loading}
        error={error}
        loadingMessage="Loading categories..."
      />

      {!loading && !error && (
        <CategoriesTable
          categories={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditDialog
        open={editOpen}
        category={selectedCategory}
        onClose={() => {
          setEditOpen(false);
          setSelectedCategory(null);
        }}
      />

      <DeleteDialog
        open={deleteOpen}
        category={selectedCategory}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
}
