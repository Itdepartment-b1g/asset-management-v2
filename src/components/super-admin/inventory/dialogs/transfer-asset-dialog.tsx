"use client";

import { ArrowRightLeft, X } from "lucide-react";
import { useMemo, useState } from "react";

import Dropdown from "@/components/common/dropdown";

import {
  issued_to_label,
  type AssetListItem,
  type AssetLookup,
  type AssetUser,
} from "../lib/asset-types";

const input_class =
  "rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50";

const DESTINATION_OTHER = "other";

type TransferAssetDialogProps = {
  row: AssetListItem;
  users: AssetUser[];
  holders: AssetLookup[];
  locations: AssetLookup[];
  loading: boolean;
  error: string | null;
  onSave: (values: {
    to_user_id: string;
    to_holder_id: string;
    other_holder_name: string;
    remarks: string;
    location_id: string;
  }) => void;
  onClose: () => void;
};

function encode_destination(kind: "user" | "holder", id: string) {
  return `${kind}:${id}`;
}

function parse_destination(value: string | null): {
  to_user_id: string;
  to_holder_id: string;
} {
  if (!value) return { to_user_id: "", to_holder_id: "" };
  if (value.startsWith("user:")) {
    return { to_user_id: value.slice(5), to_holder_id: "" };
  }
  if (value.startsWith("holder:")) {
    return { to_user_id: "", to_holder_id: value.slice(7) };
  }
  return { to_user_id: "", to_holder_id: "" };
}

export default function TransferAssetDialog({
  row,
  users,
  holders,
  locations,
  loading,
  error,
  onSave,
  onClose,
}: TransferAssetDialogProps) {
  const [destination, set_destination] = useState<string | null>(null);
  const [other_holder_name, set_other_holder_name] = useState("");
  const [location_id, set_location_id] = useState<string | null>(
    row.location?.id ?? null,
  );
  const [remarks, set_remarks] = useState("");

  const recipient_options = useMemo(() => {
    const user_options = users
      .filter((user) => user.id !== row.currently_issued_to_id)
      .map((user) => ({
        value: encode_destination("user", user.id),
        label: user.full_name || user.email || user.id,
      }));

    const holder_options = holders
      .filter((holder) => holder.id !== row.currently_issued_holder_id)
      .map((holder) => ({
        value: encode_destination("holder", holder.id),
        label: holder.name,
      }));

    return [
      ...user_options,
      ...holder_options,
      { value: DESTINATION_OTHER, label: "Other…" },
    ];
  }, [
    holders,
    row.currently_issued_holder_id,
    row.currently_issued_to_id,
    users,
  ]);

  const can_submit =
    destination !== null &&
    (destination !== DESTINATION_OTHER || other_holder_name.trim().length > 0);

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
          ({row.code_name}) to another user or shared pool.
        </p>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!destination || !can_submit) return;
            const parsed = parse_destination(destination);
            onSave({
              ...parsed,
              other_holder_name:
                destination === DESTINATION_OTHER
                  ? other_holder_name.trim()
                  : "",
              remarks,
              location_id: location_id ?? "",
            });
          }}
        >
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Current holder
            </p>
            <p className="mt-1 text-zinc-800">{issued_to_label(row)}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Last location
            </p>
            <p className="mt-1 text-zinc-800">{row.location?.name || "—"}</p>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">
              Transfer to
            </span>
            <Dropdown
              options={recipient_options}
              value={destination}
              onChange={(value) => {
                set_destination(value);
                if (value !== DESTINATION_OTHER) {
                  set_other_holder_name("");
                }
              }}
              placeholder="Select a user or other"
            />
            {destination === DESTINATION_OTHER ? (
              <input
                value={other_holder_name}
                onChange={(event) =>
                  set_other_holder_name(event.target.value)
                }
                disabled={loading}
                required
                className={input_class}
                placeholder="eg. Universal, Warehouse (S)"
              />
            ) : null}
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
              className={input_class}
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
              disabled={loading || !can_submit}
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
