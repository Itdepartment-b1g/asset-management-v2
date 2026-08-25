"use client";

import { Trash2, X } from "lucide-react";

import type { HolderItem } from "../table-views/holder-table-view";

type DeleteHolderDialogProps = {
  row: HolderItem;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteHolderDialog({
  row,
  loading,
  onConfirm,
  onClose,
}: DeleteHolderDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete shared pool"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">
            Delete shared pool
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

        <p className="text-sm text-zinc-600">
          Are you sure you want to delete this shared pool{" "}
          <span className="font-semibold text-zinc-900">{row.name}</span>{" "}
          This action cannot be undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
          >
            <Trash2 aria-hidden className="h-4 w-4" />
            {loading ? "Please wait..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
