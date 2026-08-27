"use client";

import { X } from "lucide-react";
import { useState } from "react";

import type { LegendItem } from "../table-views/legend-table-view";

type EditLegendDialogProps = {
  row: LegendItem;
  loading: boolean;
  onSave: (nextName: string, nextColor: string) => void;
  onClose: () => void;
};

export default function EditLegendDialog({
  row,
  loading,
  onSave,
  onClose,
}: EditLegendDialogProps) {
  const [name, setName] = useState(row.name);
  const [color, setColor] = useState(row.color);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit legend"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">
            Edit legend
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
            onSave(name, color);
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              autoFocus
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                aria-label="Pick color"
                className="h-10 w-12 rounded border border-zinc-200 bg-white p-0"
              />
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
                placeholder="#RRGGBB"
              />
            </div>
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
