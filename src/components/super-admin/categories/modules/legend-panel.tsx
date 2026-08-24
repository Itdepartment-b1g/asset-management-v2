"use client";

import { Palette as PaletteIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { AsyncStatus } from "@/components/common/async-status";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/pagination";
import SearchInput from "@/components/common/search-input";
import TableView from "@/components/common/table-view";
import { getThunkErrorMessage } from "@/lib/store/error";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  addLegend,
  deleteLegend,
  editLegend,
} from "@/lib/store/slices/legend-slice";
import DeleteLegendDialog from "../dialogs/delete-legend-dialog";
import EditLegendDialog from "../dialogs/edit-legend-dialog";
import {
  LegendTableView,
  type LegendItem,
} from "../table-views/legend-table-view";

type PaginatedLegends = {
  data: LegendItem[];
  meta: PaginationMeta;
};

const legendPageCache = new Map<string, PaginatedLegends>();

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

export default function LegendPanel() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<LegendItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [addName, setAddName] = useState("");
  const [addColor, setAddColor] = useState("#6d28d9");
  const [editing, setEditing] = useState<LegendItem | null>(null);
  const [deleting, setDeleting] = useState<LegendItem | null>(null);
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
      const cacheKey = `/api/legend|page=${pageToLoad}|limit=${limitToUse}|search=${searchToUse}`;
      const cached = legendPageCache.get(cacheKey);
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

      const response = await fetch(`/api/legend?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedLegends>(response);
      legendPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load legends");
    } finally {
      if (manageLoading) setLoading(false);
    }
  }

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

  const columns = LegendTableView(
    loading,
    (row) => setEditing(row),
    (row) => setDeleting(row),
  );

  async function handleAddLegend() {
    const name = addName.trim();
    const color = addColor.trim();
    if (!name || !color) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(addLegend({ name, color })).unwrap();
      legendPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Added ${name}`);
      setAddName("");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to add legend"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLegend(id: string, name: string, color: string) {
    const nextName = name.trim();
    const nextColor = color.trim();
    if (!nextName || !nextColor) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(
        editLegend({ id, name: nextName, color: nextColor }),
      ).unwrap();
      legendPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Updated ${nextName}`);
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to update legend"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLegend(id: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(deleteLegend(id)).unwrap();
      legendPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess("Deleted");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to delete legend"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      {/* <p className="mb-3 text-sm text-zinc-600">
        Map a human-readable label to a color used in the asset UI.
      </p> */}

      <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void handleAddLegend();
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
              placeholder="eg. ELECTRONICS"
            />
          </label>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <PaletteIcon aria-hidden className="h-4 w-4 text-violet-700" />
                Color
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={addColor}
                  onChange={(e) => setAddColor(e.target.value)}
                  disabled={loading}
                  aria-label="Pick color"
                  className="h-10 w-12 rounded border border-zinc-200 bg-white p-0"
                />
                <input
                  value={addColor}
                  onChange={(e) => setAddColor(e.target.value)}
                  disabled={loading}
                  className="w-32 rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || addName.trim().length === 0}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search legends"
          className="w-full sm:max-w-md"
        />
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading}
            error={error}
            success={success}
            loadingMessage="Loading legends..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage={
          searchQuery
            ? "No legends match your search."
            : "No legends yet—use the form above to add one."
        }
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
        <EditLegendDialog
          key={editing.id}
          row={editing}
          loading={loading}
          onSave={(nextName, nextColor) => {
            void handleUpdateLegend(editing.id, nextName, nextColor);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <DeleteLegendDialog
          key={deleting.id}
          row={deleting}
          loading={loading}
          onConfirm={() => {
            void handleDeleteLegend(deleting.id);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </section>
  );
}
