"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { AsyncStatus } from "@/components/common/async-status";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/pagination";
import SearchInput from "@/components/common/search-input";
import TableView from "@/components/common/table-view";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { getThunkErrorMessage } from "@/lib/store/error";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  addAsset,
  removeAsset,
  transferAsset,
} from "@/lib/store/slices/asset-slice";

import AddAssetDialog, {
  type CreateAssetValues,
} from "../dialogs/add-asset-dialog";
import DeleteAssetDialog from "../dialogs/delete-asset-dialog";
import TransferAssetDialog from "../dialogs/transfer-asset-dialog";
import AssetPhotoPreview from "./asset-photo-preview";
import {
  format_condition_label,
  format_status_label,
} from "../lib/asset-options";
import {
  AssetTableView,
  type AssetItem,
  type AssetLegend,
  type AssetListItem,
  type AssetLookup,
  type AssetUser,
} from "../table-views/asset-table-view";

type PaginatedAssets = {
  data: AssetListItem[];
  meta: PaginationMeta;
};

type PaginatedUsers = {
  data: AssetUser[];
  meta: PaginationMeta;
};

const assetPageCache = new Map<string, PaginatedAssets>();
const ASSET_CACHE_VERSION = "v3";

const fetchOptions: RequestInit = {
  credentials: "include",
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = (data as { error?: string }).error ?? "Request failed";
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

async function fetchLookupPage<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      cache: "no-store",
    });
    const payload = await parseResponse<{ data: T[] }>(response);
    return payload.data;
  } catch {
    return [];
  }
}

function format_money(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function user_label(user: AssetUser | null | undefined) {
  if (!user) return "Unassigned";
  return user.full_name || user.email || user.id;
}

function AssetDetails({ assetId }: { assetId: string }) {
  const [detail, setDetail] = useState<AssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/asset?id=${encodeURIComponent(assetId)}`, {
          ...fetchOptions,
          cache: "no-store",
        });
        const payload = await parseResponse<AssetItem>(response);
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load asset details",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">Loading asset details...</p>
    );
  }

  if (error || !detail) {
    return (
      <p className="text-sm text-red-600">
        {error || "Asset details are unavailable."}
      </p>
    );
  }

  const row = detail;
  const warranty = row.photos.find((photo) => photo.kind === "warranty");
  const receipt = row.photos.find((photo) => photo.kind === "receipt");
  const previous_holder = (row.transfers ?? [])[0]?.from_user ?? null;
  const transfers = row.transfers ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Serial number
        </p>
        <p className="mt-1 text-zinc-800">{row.serial_number || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Condition assignment
        </p>
        <p className="mt-1 text-zinc-800">
          {format_condition_label(row.condition_assignment)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Status
        </p>
        <p className="mt-1 text-zinc-800">{format_status_label(row.status)}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Department
        </p>
        <p className="mt-1 text-zinc-800">
          {row.currently_issued_to?.department?.name ||
            row.department?.name ||
            "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Location
        </p>
        <p className="mt-1 text-zinc-800">
          {row.location?.name || "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Legend
        </p>
        <p className="mt-1 text-zinc-800">
          {!row.legend ? (
            "—"
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-sm border border-zinc-300"
                style={{ backgroundColor: row.legend.color }}
              />
              {row.legend.name}
            </span>
          )}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Vendor
        </p>
        <p className="mt-1 text-zinc-800">{row.vendor_name || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cost / salvage
        </p>
        <p className="mt-1 text-zinc-800">
          {format_money(row.cost_value)} / {format_money(row.salvage_value)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Purchase date
        </p>
        <p className="mt-1 text-zinc-800">
          {row.purchase_date ? formatDate(row.purchase_date) : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Warranty / useful life
        </p>
        <p className="mt-1 text-zinc-800">
          {row.warranty_end_date ? formatDate(row.warranty_end_date) : "—"} /{" "}
          {row.useful_life_end_date
            ? formatDate(row.useful_life_end_date)
            : "—"}
        </p>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Remarks
        </p>
        <p className="mt-1 whitespace-pre-wrap text-zinc-800">
          {row.remarks || "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Current holder
        </p>
        <p className="mt-1 text-zinc-800">
          {user_label(row.currently_issued_to)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Previous holder
        </p>
        <p className="mt-1 text-zinc-800">
          {previous_holder ? user_label(previous_holder) : "—"}
        </p>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Transfer history
        </p>
        {transfers.length === 0 ? (
          <p className="mt-1 text-zinc-800">No transfers yet.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {transfers.map((transfer) => (
              <li
                key={transfer.id}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              >
                {transfer.from_user === null && transfer.remarks === "Initial assignment" ? (
                  <p className="text-zinc-800">Initial assignment to {user_label(transfer.to_user)}</p>
                ) : (
                  <p className="text-zinc-800">
                    {user_label(transfer.from_user)} → {user_label(transfer.to_user)}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatDateTime(transfer.transferred_at)} · by{" "}
                  {user_label(transfer.transferred_by)}
                  {transfer.remarks && transfer.remarks !== "Initial assignment"
                    ? ` · ${transfer.remarks}`
                    : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
      {warranty ? (
        <AssetPhotoPreview label="Warranty photo" photo={warranty} />
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Warranty photo
          </p>
          <p className="mt-1 text-zinc-800">—</p>
        </div>
      )}
      {receipt ? (
        <AssetPhotoPreview label="Receipt photo" photo={receipt} />
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Receipt photo
          </p>
          <p className="mt-1 text-zinc-800">—</p>
        </div>
      )}
    </div>
  );
}

export default function AssetPanel() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<AssetListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [creating, setCreating] = useState(false);
  const [transferring, setTransferring] = useState<AssetListItem | null>(null);
  const [deleting, setDeleting] = useState<AssetListItem | null>(null);
  const [conditions, setConditions] = useState<AssetLookup[]>([]);
  const [departments, setDepartments] = useState<AssetLookup[]>([]);
  const [locations, setLocations] = useState<AssetLookup[]>([]);
  const [legends, setLegends] = useState<AssetLegend[]>([]);
  const [users, setUsers] = useState<AssetUser[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadPage(
    pageToLoad: number,
    opts?: { manageLoading?: boolean; limit?: number; search?: string },
  ) {
    const manageLoading = opts?.manageLoading ?? true;
    const limitToUse = opts?.limit ?? limit;
    const searchToUse = opts?.search ?? searchQuery;

    if (manageLoading) {
      setLoading(true);
      setError(null);
      setSuccess(null);
    }

    try {
      const cacheKey = `/api/asset|${ASSET_CACHE_VERSION}|page=${pageToLoad}|limit=${limitToUse}|search=${searchToUse}`;
      const cached = assetPageCache.get(cacheKey);
      if (cached) {
        setItems(cached.data);
        setMeta(cached.meta);
        setPage(cached.meta.page);
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(limitToUse));
      if (searchToUse) {
        params.set("search", searchToUse);
      }

      const response = await fetch(`/api/asset?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedAssets>(response);
      assetPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assets");
    } finally {
      if (manageLoading) setLoading(false);
    }
  }

  async function loadLookups() {
    setLookupsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");
      const query = params.toString();

      const [
        condition_data,
        department_data,
        location_data,
        legend_data,
        user_data,
      ] = await Promise.all([
        fetchLookupPage<AssetLookup>(`/api/condition?${query}`),
        fetchLookupPage<AssetLookup>(`/api/department?${query}`),
        fetchLookupPage<AssetLookup>(`/api/location?${query}`),
        fetchLookupPage<AssetLegend>(`/api/legend?${query}`),
        fetchLookupPage<AssetUser>(`/api/auth/users?${query}`),
      ]);

      setConditions(condition_data);
      setDepartments(department_data);
      setLocations(location_data);
      setLegends(legend_data);
      setUsers(user_data);
    } finally {
      setLookupsLoading(false);
    }
  }

  useEffect(() => {
    assetPageCache.clear();
    const t = window.setTimeout(() => {
      void loadLookups();
    }, 0);

    return () => {
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const nextSearch = searchInput.trim();
    const delay = nextSearch === searchQuery ? 0 : 150;
    const t = window.setTimeout(() => {
      setSearchQuery(nextSearch);
      void loadPage(1, {
        search: nextSearch,
        manageLoading: nextSearch === searchQuery,
      });
    }, delay);

    return () => {
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search-driven reload
  }, [searchInput]);

  const columns = AssetTableView(
    loading,
    (row) => {
      setError(null);
      setSuccess(null);
      setTransferring(row);
    },
    (row) => setDeleting(row),
  );

  async function handleAddAsset(values: CreateAssetValues) {
    const asset_name = values.asset_name.trim();
    if (!asset_name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.set("asset_name", asset_name);
      form.set("current_condition_id", values.current_condition_id);
      form.set("condition_assignment_id", values.condition_assignment_id);
      form.set("status", values.status);

      const optional_fields: Array<[string, string]> = [
        ["serial_number", values.serial_number],
        ["purchase_date", values.purchase_date],
        ["remarks", values.remarks],
        ["vendor_name", values.vendor_name],
        ["cost_value", values.cost_value],
        ["salvage_value", values.salvage_value],
        ["warranty_end_date", values.warranty_end_date],
        ["useful_life_end_date", values.useful_life_end_date],
        ["original_issue_date", values.original_issue_date],
        ["currently_issued_to_id", values.currently_issued_to_id],
        ["department_id", values.department_id],
        ["location_id", values.location_id],
        ["legend_id", values.legend_id],
      ];

      for (const [key, value] of optional_fields) {
        if (value.trim()) form.set(key, value.trim());
      }

      if (values.warranty_photo) {
        form.set("warranty_photo", values.warranty_photo);
      }
      if (values.receipt_photo) {
        form.set("receipt_photo", values.receipt_photo);
      }

      const created = await dispatch(addAsset(form)).unwrap();
      assetPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setCreating(false);
      setSuccess(`Added ${created.asset_name} as ${created.code_name}`);
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to add asset"));
    } finally {
      setLoading(false);
    }
  }

  async function handleTransferAsset(
    id: string,
    values: { to_user_id: string; remarks: string },
  ) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await dispatch(
        transferAsset({
          asset_id: id,
          to_user_id: values.to_user_id,
          remarks: values.remarks.trim() || undefined,
        }),
      ).unwrap();
      assetPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setTransferring(null);
      setSuccess(
        `Transferred ${updated.asset_name} to ${user_label(updated.currently_issued_to)}`,
      );
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to transfer asset"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAsset(id: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(removeAsset(id)).unwrap();
      assetPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess("Deleted");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to delete asset"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name, code, or serial"
          className="w-full sm:max-w-md"
        />
        <button
          type="button"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
          onClick={() => {
            setError(null);
            setSuccess(null);
            void loadLookups();
            setCreating(true);
          }}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add asset
        </button>
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading && !creating && !transferring && !deleting}
            error={creating || transferring || deleting ? null : error}
            success={success}
            loadingMessage="Loading assets..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage={
          searchQuery
            ? "No assets match your search."
            : "No assets yet—use Add asset to create one."
        }
        renderExpanded={(row) => <AssetDetails assetId={row.id} />}
      />

      {meta ? (
        <Pagination
          meta={meta}
          disabled={loading}
          onPrev={() => void loadPage(meta.page - 1)}
          onNext={() => void loadPage(meta.page + 1)}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            void loadPage(1, { limit: nextLimit });
          }}
        />
      ) : null}

      {creating ? (
        <AddAssetDialog
          loading={loading}
          lookupsLoading={lookupsLoading}
          error={error}
          conditions={conditions}
          departments={departments}
          locations={locations}
          legends={legends}
          users={users}
          onSave={(values) => {
            void handleAddAsset(values);
          }}
          onClose={() => {
            setCreating(false);
            setError(null);
          }}
        />
      ) : null}

      {transferring ? (
        <TransferAssetDialog
          key={transferring.id}
          row={transferring}
          users={users}
          loading={loading}
          error={error}
          onSave={(values) => {
            void handleTransferAsset(transferring.id, values);
          }}
          onClose={() => {
            setTransferring(null);
            setError(null);
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteAssetDialog
          key={deleting.id}
          row={deleting}
          loading={loading}
          onConfirm={() => {
            void handleDeleteAsset(deleting.id);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </section>
  );
}
