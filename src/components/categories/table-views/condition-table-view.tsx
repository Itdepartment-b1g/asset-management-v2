"use client";

import { Edit3, Trash2 } from "lucide-react";

import type { TableColumn } from "@/components/common/table-view";
import { formatDateTime } from "@/lib/format-date";

export type ConditionItem = {
  id: string;
  name: string;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
};

export function ConditionTableView(
  loading: boolean,
  onEdit: (row: ConditionItem) => void,
  onDelete: (row: ConditionItem) => void,
): TableColumn<ConditionItem>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortValue: (row) => row.name,
      render: (row) => (
        <span className="font-medium text-zinc-900">{row.name}</span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortValue: (row) => new Date(row.created_at).getTime(),
      render: (row) => (
        <span className="text-zinc-600">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={() => onEdit(row)}
            disabled={loading}
          >
            <Edit3 aria-hidden className="h-3.5 w-3.5 text-violet-700" />
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={() => onDelete(row)}
            disabled={loading}
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];
}
