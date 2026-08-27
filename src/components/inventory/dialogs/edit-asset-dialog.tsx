"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Dropdown from "@/components/common/dropdown";
import { getThunkErrorMessage } from "@/lib/store/error";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchAssetById } from "@/lib/store/slices/asset-slice";

import {
  ASSET_STATUS_OPTIONS,
  type AssetStatus,
} from "@/components/lib/asset-options";
import type {
  AssetItem,
  AssetLegend,
  AssetLookup,
  AssetPhotoMeta,
} from "../table-views/asset-table-view";

export type EditAssetValues = {
  asset_name: string;
  serial_number: string;
  purchase_date: string;
  current_condition_id: string;
  condition_assignment_id: string;
  status: AssetStatus;
  remarks: string;
  vendor_name: string;
  cost_value: string;
  salvage_value: string;
  warranty_end_date: string;
  useful_life_end_date: string;
  location_id: string;
  legend_id: string;
  warranty_photo: File | null;
  receipt_photo: File | null;
};

type EditAssetDialogProps = {
  assetId: string;
  loading: boolean;
  lookupsLoading?: boolean;
  error: string | null;
  conditions: AssetLookup[];
  locations: AssetLookup[];
  legends: AssetLegend[];
  onSave: (values: EditAssetValues) => void;
  onClose: () => void;
};

const input_class =
  "rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50";

function to_date_input(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function to_number_input(value: number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

function photo_url(id: string) {
  return `/api/asset-photo?id=${encodeURIComponent(id)}`;
}

function ExistingPhoto({
  label,
  photo,
}: {
  label: string;
  photo: AssetPhotoMeta;
}) {
  return (
    <div className="mt-2">
      <p className="text-xs text-zinc-500">Current {label.toLowerCase()}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo_url(photo.id)}
        alt={photo.file_name}
        className="mt-1 h-28 w-auto rounded-md border border-zinc-200 object-contain"
      />
    </div>
  );
}

export default function EditAssetDialog({
  assetId,
  loading,
  lookupsLoading = false,
  error,
  conditions,
  locations,
  legends,
  onSave,
  onClose,
}: EditAssetDialogProps) {
  const dispatch = useAppDispatch();
  const [detail, setDetail] = useState<AssetItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [asset_name, set_asset_name] = useState("");
  const [serial_number, set_serial_number] = useState("");
  const [purchase_date, set_purchase_date] = useState("");
  const [current_condition_id, set_current_condition_id] = useState<
    string | null
  >(null);
  const [condition_assignment_id, set_condition_assignment_id] = useState<
    string | null
  >(null);
  const [status, set_status] = useState<AssetStatus | null>(null);
  const [remarks, set_remarks] = useState("");
  const [vendor_name, set_vendor_name] = useState("");
  const [cost_value, set_cost_value] = useState("");
  const [salvage_value, set_salvage_value] = useState("");
  const [warranty_end_date, set_warranty_end_date] = useState("");
  const [useful_life_end_date, set_useful_life_end_date] = useState("");
  const [location_id, set_location_id] = useState<string | null>(null);
  const [legend_id, set_legend_id] = useState<string | null>(null);
  const [warranty_photo, set_warranty_photo] = useState<File | null>(null);
  const [receipt_photo, set_receipt_photo] = useState<File | null>(null);

  const warranty_preview = useMemo(
    () => (warranty_photo ? URL.createObjectURL(warranty_photo) : null),
    [warranty_photo],
  );
  const receipt_preview = useMemo(
    () => (receipt_photo ? URL.createObjectURL(receipt_photo) : null),
    [receipt_photo],
  );
  const selected_legend = useMemo(
    () => legends.find((legend) => legend.id === legend_id) ?? null,
    [legends, legend_id],
  );
  const existing_warranty = detail?.photos.find(
    (photo) => photo.kind === "warranty",
  );
  const existing_receipt = detail?.photos.find(
    (photo) => photo.kind === "receipt",
  );

  useEffect(() => {
    if (!warranty_preview) return;
    return () => URL.revokeObjectURL(warranty_preview);
  }, [warranty_preview]);

  useEffect(() => {
    if (!receipt_preview) return;
    return () => URL.revokeObjectURL(receipt_preview);
  }, [receipt_preview]);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const payload = await dispatch(fetchAssetById(assetId)).unwrap();
        if (cancelled) return;
        setDetail(payload);
        set_asset_name(payload.asset_name);
        set_serial_number(payload.serial_number ?? "");
        set_purchase_date(to_date_input(payload.purchase_date));
        set_current_condition_id(payload.current_condition?.id ?? null);
        set_condition_assignment_id(
          payload.condition_assignment?.id ?? null,
        );
        set_status(payload.status ?? null);
        set_remarks(payload.remarks ?? "");
        set_vendor_name(payload.vendor_name ?? "");
        set_cost_value(to_number_input(payload.cost_value));
        set_salvage_value(to_number_input(payload.salvage_value));
        set_warranty_end_date(to_date_input(payload.warranty_end_date));
        set_useful_life_end_date(to_date_input(payload.useful_life_end_date));
        set_location_id(payload.location?.id ?? null);
        set_legend_id(payload.legend?.id ?? null);
      } catch (e) {
        if (!cancelled) {
          setDetailError(getThunkErrorMessage(e, "Failed to load asset"));
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [assetId, dispatch]);

  const can_submit =
    !detailLoading &&
    asset_name.trim().length > 0 &&
    current_condition_id !== null &&
    condition_assignment_id !== null &&
    status !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit asset"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-zinc-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h3 className="text-base font-semibold text-zinc-900">Edit asset</h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {detailLoading ? (
          <p className="px-5 py-8 text-sm text-zinc-500">Loading asset...</p>
        ) : detailError || !detail ? (
          <p className="px-5 py-8 text-sm text-red-600">
            {detailError || "Asset could not be loaded."}
          </p>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !current_condition_id ||
                !condition_assignment_id ||
                !status
              ) {
                return;
              }
              onSave({
                asset_name,
                serial_number,
                purchase_date,
                current_condition_id,
                condition_assignment_id,
                status,
                remarks,
                vendor_name,
                cost_value,
                salvage_value,
                warranty_end_date,
                useful_life_end_date,
                location_id: location_id ?? "",
                legend_id: legend_id ?? "",
                warranty_photo,
                receipt_photo,
              });
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-sm font-medium text-zinc-700">
                    Asset name
                  </span>
                  <input
                    value={asset_name}
                    onChange={(event) => set_asset_name(event.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Code name
                  </span>
                  <input
                    value={detail.code_name}
                    readOnly
                    disabled
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Serial number
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (optional)
                    </span>
                  </span>
                  <input
                    value={serial_number}
                    onChange={(event) => set_serial_number(event.target.value)}
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Current condition
                  </span>
                  <Dropdown
                    options={conditions.map((condition) => ({
                      value: condition.id,
                      label: condition.name,
                    }))}
                    value={current_condition_id}
                    onChange={set_current_condition_id}
                    placeholder="Select condition"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Condition assignment
                  </span>
                  <Dropdown
                    options={conditions.map((condition) => ({
                      value: condition.id,
                      label: condition.name,
                    }))}
                    value={condition_assignment_id}
                    onChange={set_condition_assignment_id}
                    placeholder="Select assignment"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Status
                  </span>
                  <Dropdown
                    options={[...ASSET_STATUS_OPTIONS]}
                    value={status}
                    onChange={(value) => set_status(value as AssetStatus)}
                    placeholder="Select status"
                    isSearchable={false}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Purchase date
                  </span>
                  <input
                    type="date"
                    value={purchase_date}
                    onChange={(event) => set_purchase_date(event.target.value)}
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Location
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
                  <span className="text-sm font-medium text-zinc-700">
                    Legend
                  </span>
                  <Dropdown
                    options={legends.map((legend) => ({
                      value: legend.id,
                      label: legend.name,
                    }))}
                    value={legend_id}
                    onChange={set_legend_id}
                    placeholder={
                      lookupsLoading
                        ? "Loading legends..."
                        : legends.length === 0
                          ? "No legends yet"
                          : "Select a legend"
                    }
                  />
                  {selected_legend ? (
                    <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-sm border border-zinc-300"
                        style={{ backgroundColor: selected_legend.color }}
                      />
                      Selected: {selected_legend.name}
                    </span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Vendor name
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (optional)
                    </span>
                  </span>
                  <input
                    value={vendor_name}
                    onChange={(event) => set_vendor_name(event.target.value)}
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Cost value
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost_value}
                    onChange={(event) => set_cost_value(event.target.value)}
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Salvage value
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salvage_value}
                    onChange={(event) => set_salvage_value(event.target.value)}
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Warranty end date
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (optional)
                    </span>
                  </span>
                  <input
                    type="date"
                    value={warranty_end_date}
                    onChange={(event) =>
                      set_warranty_end_date(event.target.value)
                    }
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Useful life end date
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (optional)
                    </span>
                  </span>
                  <input
                    type="date"
                    value={useful_life_end_date}
                    onChange={(event) =>
                      set_useful_life_end_date(event.target.value)
                    }
                    disabled={loading}
                    className={input_class}
                  />
                </label>

                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-sm font-medium text-zinc-700">
                    Remarks
                  </span>
                  <textarea
                    value={remarks}
                    onChange={(event) => set_remarks(event.target.value)}
                    disabled={loading}
                    rows={3}
                    className={input_class}
                    placeholder="Optional notes"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Warranty photo
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (replace optional)
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={loading}
                    className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-700"
                    onChange={(event) =>
                      set_warranty_photo(event.target.files?.[0] ?? null)
                    }
                  />
                  {warranty_preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={warranty_preview}
                      alt="New warranty preview"
                      className="mt-2 h-28 w-auto rounded-md border border-zinc-200 object-contain"
                    />
                  ) : existing_warranty ? (
                    <ExistingPhoto
                      label="Warranty photo"
                      photo={existing_warranty}
                    />
                  ) : null}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-700">
                    Receipt photo
                    <span className="font-normal text-zinc-500">
                      {" "}
                      (replace optional)
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={loading}
                    className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-700"
                    onChange={(event) =>
                      set_receipt_photo(event.target.files?.[0] ?? null)
                    }
                  />
                  {receipt_preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={receipt_preview}
                      alt="New receipt preview"
                      className="mt-2 h-28 w-auto rounded-md border border-zinc-200 object-contain"
                    />
                  ) : existing_receipt ? (
                    <ExistingPhoto
                      label="Receipt photo"
                      photo={existing_receipt}
                    />
                  ) : null}
                </label>
              </div>

              {error ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
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
                className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {loading ? "Please wait..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
