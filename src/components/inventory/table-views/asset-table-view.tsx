"use client";

import { ArrowRightLeft, Trash2 } from "lucide-react";

import type { TableColumn } from "@/components/common/table-view";
import { formatDate } from "@/lib/format-date";

import {
  format_condition_label,
  format_status_label,
} from "../lib/asset-options";

export type AssetLookup = {
  id: string;
  name: string;
};

export type AssetLegend = {
  id: string;
  name: string;
  color: string;
};

export type AssetUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  department?: AssetLookup | null;
};

export type AssetTransfer = {
  id: string;
  from_user_id: string | null;
  to_user_id: string;
  remarks: string | null;
  transferred_by_id: string;
  transferred_at: string;
  from_user: AssetUser | null;
  to_user: AssetUser;
  transferred_by: AssetUser;
};

export type AssetPhotoMeta = {
  id: string;
  kind: "warranty" | "receipt";
  file_name: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

export type AssetListItem = {
  id: string;
  asset_name: string;
  code_name: string;
  current_condition: AssetLookup | null;
  status: "active" | "inactive" | "stored" | null;
  currently_issued_to_id: string | null;
  created_at: string;
  updated_at: string;
  department: AssetLookup | null;
  location: AssetLookup | null;
  legend: AssetLegend | null;
  currently_issued_to: AssetUser | null;
};

export type AssetItem = AssetListItem & {
  serial_number: string | null;
  purchase_date: string | null;
  condition_assignment: AssetLookup | null;
  remarks: string | null;
  vendor_name: string | null;
  cost_value: number | null;
  salvage_value: number | null;
  warranty_end_date: string | null;
  useful_life_end_date: string | null;
  original_issue_date: string | null;
  created_by_id: string | null;
  created_by: AssetUser | null;
  photos: AssetPhotoMeta[];
  transfers: AssetTransfer[];
};

export function AssetTableView(
  loading: boolean,
  onTransfer: (row: AssetListItem) => void,
  onDelete: (row: AssetListItem) => void,
): TableColumn<AssetListItem>[] {
  return [
    {
      key: "code_name",
      header: "Code",
      sortValue: (row) => row.code_name,
      render: (row) => (
        <span className="font-medium text-zinc-900">{row.code_name}</span>
      ),
    },
    {
      key: "asset_name",
      header: "Asset",
      sortValue: (row) => row.asset_name,
      render: (row) => <span className="text-zinc-700">{row.asset_name}</span>,
    },
    {
      key: "current_condition",
      header: "Current condition",
      sortValue: (row) => row.current_condition?.name ?? "",
      render: (row) => (
        <span className="capitalize text-zinc-600">
          {format_condition_label(row.current_condition)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status ?? "",
      render: (row) => (
        <span className="capitalize text-zinc-600">
          {format_status_label(row.status)}
        </span>
      ),
    },
    {
      key: "currently_issued_to",
      header: "Issued to",
      sortValue: (row) =>
        row.currently_issued_to?.full_name ??
        row.currently_issued_to?.email ??
        "",
      render: (row) => (
        <span className="text-zinc-600">
          {row.currently_issued_to?.full_name ||
            row.currently_issued_to?.email ||
            "—"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => row.currently_issued_to?.department?.name ?? "",
      render: (row) => (
        <span className="text-zinc-600">
          {row.currently_issued_to?.department?.name || "—"}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortValue: (row) => row.location?.name ?? "",
      render: (row) => (
        <span className="text-zinc-600">
          {row.location?.name || "—"}
        </span>
      ),
    },
    {
      key: "legend",
      header: "Legend",
      sortValue: (row) => row.legend?.name ?? "",
      render: (row) => {
        if (!row.legend) {
          return <span className="text-zinc-600">—</span>;
        }

        return (
          <span className="inline-flex items-center gap-1.5 text-zinc-600">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm border border-zinc-300"
              style={{ backgroundColor: row.legend.color }}
            />
            {row.legend.name}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Created",
      sortValue: (row) => new Date(row.created_at).getTime(),
      render: (row) => (
        <span className="text-zinc-600">{formatDate(row.created_at)}</span>
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
            onClick={(event) => {
              event.stopPropagation();
              onTransfer(row);
            }}
            disabled={loading}
          >
            <ArrowRightLeft aria-hidden className="h-3.5 w-3.5 text-violet-700" />
            Transfer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row);
            }}
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
