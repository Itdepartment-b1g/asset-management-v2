"use client";

import type { TableColumn } from "@/components/common/table-view";
import { formatDateTime } from "@/lib/format-date";

import type { AssetTransfer, AssetUser } from "./asset-table-view";

export function user_label(user: AssetUser | null | undefined) {
  if (!user) return "Unassigned";
  return user.full_name || user.email || user.id;
}

export function is_initial_assignment(transfer: AssetTransfer) {
  return transfer.from_user === null && transfer.remarks === "Initial assignment";
}

export function transfer_from_label(transfer: AssetTransfer) {
  if (is_initial_assignment(transfer)) return "—";
  return user_label(transfer.from_user);
}

export function transfer_department_label(transfer: AssetTransfer) {
  return transfer.to_user?.department?.name || "—";
}

export function transfer_remarks(transfer: AssetTransfer) {
  if (!transfer.remarks || transfer.remarks === "Initial assignment") {
    return "—";
  }
  return transfer.remarks;
}

export function AssetTransferTableView(): TableColumn<AssetTransfer>[] {
  return [
    {
      key: "last_used_by",
      header: "Last Used By",
      sortValue: (row) => transfer_from_label(row),
      render: (row) => (
        <span className="text-zinc-700">{transfer_from_label(row)}</span>
      ),
    },
    {
      key: "currently_issued_to",
      header: "Currently Issued To",
      sortValue: (row) => user_label(row.to_user),
      render: (row) => (
        <span className="text-zinc-700">{user_label(row.to_user)}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => transfer_department_label(row),
      render: (row) => (
        <span className="text-zinc-600">{transfer_department_label(row)}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortValue: (row) => new Date(row.transferred_at).getTime(),
      render: (row) => (
        <span className="text-zinc-600">{formatDateTime(row.transferred_at)}</span>
      ),
    },
    {
      key: "transferred_by",
      header: "Transferred By",
      sortValue: (row) => user_label(row.transferred_by),
      render: (row) => (
        <span className="text-zinc-600">{user_label(row.transferred_by)}</span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      sortValue: (row) => transfer_remarks(row),
      render: (row) => (
        <span className="text-zinc-600">{transfer_remarks(row)}</span>
      ),
    },
  ];
}
