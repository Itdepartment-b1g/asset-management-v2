"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { AsyncStatus } from "@/components/common/async-status";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/pagination";
import TableView from "@/components/common/table-view";

import {
  LocationTableView,
  type LocationItem,
} from "../table-views/location-table-view";

type PaginatedLocations = {
  data: LocationItem[];
  meta: PaginationMeta;
};

const locationPageCache = new Map<string, PaginatedLocations>();

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

function EditLocationDialog({
  row,
  loading,
  onSave,
  onClose,
}: {
  row: LocationItem;
  loading: boolean;
  onSave: (nextName: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(row.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit location"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">
            Edit location
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
            onSave(name);
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              required
              autoFocus
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
            />
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

export default function LocationPanel() {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [addName, setAddName] = useState("");
  const [editing, setEditing] = useState<LocationItem | null>(null);

  async function loadPage(
    pageToLoad: number,
    opts?: { manageLoading?: boolean; limit?: number },
  ) {
    const manageLoading = opts?.manageLoading ?? true;
    const limitToUse = opts?.limit ?? limit;

    if (manageLoading) {
      setLoading(true);
      setError(null);
      setSuccess(null);
    }

    try {
      const cacheKey = `/api/location|page=${pageToLoad}|limit=${limitToUse}`;
      const cached = locationPageCache.get(cacheKey);
      if (cached) {
        setItems(cached.data);
        setMeta(cached.meta);
        setPage(cached.meta.page);
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(limitToUse));

      const response = await fetch(`/api/location?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedLocations>(response);
      locationPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load locations");
    } finally {
      if (manageLoading) setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadPage(1);
    }, 0);

    return () => {
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const columns = LocationTableView(
    loading,
    (row) => setEditing(row),
    (row) => void deleteLocation(row.id),
  );

  async function addLocation() {
    const name = addName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/location", {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await parseResponse<LocationItem>(response);
      locationPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Added ${name}`);
      setAddName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add location");
    } finally {
      setLoading(false);
    }
  }

  async function updateLocation(id: string, nameRaw: string) {
    const name = nameRaw.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/location", {
        ...fetchOptions,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      await parseResponse<LocationItem>(response);
      locationPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Updated ${name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setLoading(false);
    }
  }

  async function deleteLocation(id: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/location?id=${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      await parseResponse<LocationItem>(response);
      locationPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess("Deleted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete location");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      {/* <p className="mb-3 text-sm text-zinc-600">
        Locations where assets are stored or tracked.
      </p> */}

      <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void addLocation();
          }}
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              disabled={loading}
              required
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
              placeholder="Add location"
            />
          </label>
          <button
            type="submit"
            disabled={loading || addName.trim().length === 0}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Add"}
          </button>
        </form>
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading}
            error={error}
            success={success}
            loadingMessage="Loading locations..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="No locations yet—use the form above to add one."
        isAccordion={false}
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

      {editing ? (
        <EditLocationDialog
          key={editing.id}
          row={editing}
          loading={loading}
          onSave={(nextName) => {
            void updateLocation(editing.id, nextName);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
