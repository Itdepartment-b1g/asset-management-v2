"use client";

import { ArrowRightLeft, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { TableColumn } from "@/components/common/table-view";
import { formatDate } from "@/lib/format-date";

import {
  format_condition_label,
  format_status_label,
} from "../../../lib/asset-options";
import type { AssetListItem } from "../lib/asset-types";

export type {
  AssetItem,
  AssetLegend,
  AssetListItem,
  AssetLookup,
  AssetPhotoMeta,
  AssetTransfer,
  AssetUser,
} from "../lib/asset-types";

const action_button_class =
  "inline-flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50";

const delete_button_class =
  "inline-flex w-full items-center gap-2 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50";

function AssetRowActionsMenu({
  loading,
  onEdit,
  onTransfer,
  onDelete,
}: {
  loading: boolean;
  onEdit: () => void;
  onTransfer: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function runAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <EllipsisVertical aria-hidden className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 flex min-w-[9.5rem] flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className={action_button_class}
            disabled={loading}
            onClick={(event) => {
              event.stopPropagation();
              runAction(onEdit);
            }}
          >
            <Pencil aria-hidden className="h-3.5 w-3.5 text-violet-700" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className={action_button_class}
            disabled={loading}
            onClick={(event) => {
              event.stopPropagation();
              runAction(onTransfer);
            }}
          >
            <ArrowRightLeft aria-hidden className="h-3.5 w-3.5 text-violet-700" />
            Transfer
          </button>
          <button
            type="button"
            role="menuitem"
            className={delete_button_class}
            disabled={loading}
            onClick={(event) => {
              event.stopPropagation();
              runAction(onDelete);
            }}
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AssetTableView(
  loading: boolean,
  onEdit: (row: AssetListItem) => void,
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
        row.currently_issued_holder?.name ??
        "",
      render: (row) => (
        <span className="text-zinc-600">
          {row.currently_issued_to?.full_name ||
            row.currently_issued_to?.email ||
            row.currently_issued_holder?.name ||
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
      className: "w-16",
      render: (row) => (
        <AssetRowActionsMenu
          loading={loading}
          onEdit={() => onEdit(row)}
          onTransfer={() => onTransfer(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ];
}
