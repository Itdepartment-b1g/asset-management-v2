"use client";

import type { TableColumn } from "@/components/common/table-view";
import { formatDateTime } from "@/lib/format-date";

import {
  holder_label,
  user_label,
  type AssetLookup,
  type AssetTransfer,
} from "../lib/asset-types";

export { user_label } from "../lib/asset-types";

export function location_label(location: AssetLookup | null | undefined) {
  return location?.name || "—";
}

export function is_initial_assignment(transfer: AssetTransfer) {
  return (
    transfer.from_user === null &&
    transfer.from_holder === null &&
    transfer.remarks === "Initial assignment"
  );
}

export function transfer_party_label(
  user: AssetTransfer["from_user"] | AssetTransfer["to_user"],
  holder: AssetTransfer["from_holder"] | AssetTransfer["to_holder"],
) {
  if (user) return user_label(user);
  if (holder) return holder_label(holder);
  return "Unassigned";
}

export function transfer_from_label(transfer: AssetTransfer) {
  if (is_initial_assignment(transfer)) return "—";
  return transfer_party_label(transfer.from_user, transfer.from_holder);
}

export function transfer_to_label(transfer: AssetTransfer) {
  return transfer_party_label(transfer.to_user, transfer.to_holder);
}

export function transfer_department_label(transfer: AssetTransfer) {
  return transfer.to_user?.department?.name || "—";
}

export function transfer_last_location_label(transfer: AssetTransfer) {
  if (is_initial_assignment(transfer)) return "—";
  return location_label(transfer.from_location);
}

export function transfer_current_location_label(transfer: AssetTransfer) {
  return location_label(transfer.to_location);
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
      sortValue: (row) => transfer_to_label(row),
      render: (row) => (
        <span className="text-zinc-700">{transfer_to_label(row)}</span>
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
      key: "last_location",
      header: "Last Location",
      sortValue: (row) => transfer_last_location_label(row),
      render: (row) => (
        <span className="text-zinc-600">{transfer_last_location_label(row)}</span>
      ),
    },
    {
      key: "current_location",
      header: "Current Location",
      sortValue: (row) => transfer_current_location_label(row),
      render: (row) => (
        <span className="text-zinc-600">
          {transfer_current_location_label(row)}
        </span>
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
