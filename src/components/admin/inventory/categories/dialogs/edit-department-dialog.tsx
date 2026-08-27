"use client";

import { X } from "lucide-react";
import { useState } from "react";

import type { DepartmentItem } from "../table-views/department-table-view";

type EditDepartmentDialogProps = {
  row: DepartmentItem;
  loading: boolean;
  onSave: (nextName: string) => void;
  onClose: () => void;
};

export default function EditDepartmentDialog({
  row,
  loading,
  onSave,
  onClose,
}: EditDepartmentDialogProps) {
  const [name, setName] = useState(row.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit department"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">
            Edit department
          </h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(name);
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              required
              autoFocus
              minLength={3}
              maxLength={255}
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
            />
            <span className="text-xs text-zinc-500">
              Use 3–255 characters: letters, numbers, and spaces only.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || name.trim().length === 0}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}