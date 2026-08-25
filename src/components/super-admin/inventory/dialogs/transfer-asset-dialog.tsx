"use client";

import { ArrowRightLeft, X } from "lucide-react";
import { useState } from "react";

import Dropdown from "@/components/common/dropdown";

import type {
  AssetListItem,
  AssetLookup,
  AssetUser,
} from "../table-views/asset-table-view";

type TransferAssetDialogProps = {
  row: AssetListItem;
  users: AssetUser[];
  locations: AssetLookup[];
  loading: boolean;
  error: string | null;
  onSave: (values: {
    to_user_id: string;
    remarks: string;
    location_id: string;
  }) => void;
  onClose: () => void;
};

function user_label(user: AssetUser | null | undefined) {
  if (!user) return "Unassigned";
  return user.full_name || user.email || user.id;
}

export default function TransferAssetDialog({
  row,
  users,
  locations,
  loading,
  error,
  onSave,
  onClose,
}: TransferAssetDialogProps) {
  const [to_user_id, set_to_user_id] = useState<string | null>(null);
  const [location_id, set_location_id] = useState<string | null>(
    row.location?.id ?? null,
  );
  const [remarks, set_remarks] = useState("");

  const recipient_options = users
    .filter((user) => user.id !== row.currently_issued_to_id)
    .map((user) => ({
      value: user.id,
      label: user_label(user),
    }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Transfer asset"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">
            Transfer asset
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

        <p className="mb-4 text-sm text-zinc-600">
          Transfer{" "}
          <span className="font-semibold text-zinc-900">{row.asset_name}</span>{" "}
          ({row.code_name}) to another user.
        </p>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!to_user_id) return;
            onSave({
              to_user_id,
              remarks,
              location_id: location_id ?? "",
            });
          }}
        >
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Current holder
            </p>
            <p className="mt-1 text-zinc-800">
              {user_label(row.currently_issued_to)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Last location
            </p>
            <p className="mt-1 text-zinc-800">
              {row.location?.name || "—"}
            </p>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">
              Transfer to
            </span>
            <Dropdown
              options={recipient_options}
              value={to_user_id}
              onChange={set_to_user_id}
              placeholder={
                recipient_options.length === 0
                  ? "No other users available"
                  : "Select a user"
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">
              New location
            </span>
            <Dropdown
              options={locations.map((location) => ({
                value: location.id,
                label: location.name,
              }))}
              value={location_id}
              onChange={set_location_id}
              placeholder={
                locations.length === 0
                  ? "No locations yet"
                  : "Select a location"
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Remarks</span>
            <textarea
              value={remarks}
              onChange={(event) => set_remarks(event.target.value)}
              disabled={loading}
              rows={3}
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
              placeholder="Optional reason for transfer"
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

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
              disabled={loading || !to_user_id}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
            >
              <ArrowRightLeft aria-hidden className="h-4 w-4" />
              {loading ? "Please wait..." : "Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
