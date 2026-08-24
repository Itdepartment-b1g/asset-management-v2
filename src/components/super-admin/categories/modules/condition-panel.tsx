"use client";

import { X } from "lucide-react";
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
  addCondition,
  editCondition,
  removeCondition,
} from "@/lib/store/slices/condition-slice";

import {
    ConditionTableView,
    type ConditionItem,
    } from "../table-views/condition-table-view";
import DeleteConditionDialog from "@/components/super-admin/categories/dialogs/delete-condition-dialog";
import EditConditionDialog from "@/components/super-admin/categories/dialogs/edit-condition-dialog";


type PaginatedConditions = {
  data: ConditionItem[];
  meta: PaginationMeta;
};

const conditionPageCache = new Map<string, PaginatedConditions>();

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




export default function ConditionPanel() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<ConditionItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [addName, setAddName] = useState("");
  const [editing, setEditing] = useState<ConditionItem | null>(null);
  const [deleting, setDeleting] = useState<ConditionItem | null>(null);
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
      const cacheKey = `/api/condition|page=${pageToLoad}|limit=${limitToUse}|search=${searchToUse}`;
      const cached = conditionPageCache.get(cacheKey);
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

      const response = await fetch(`/api/condition?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedConditions>(response);
      conditionPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conditions");
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

  const columns = ConditionTableView(
    loading,
    (row) => setEditing(row),
    (row) => setDeleting(row),
  );

  async function handleAddCondition() {
    const name = addName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(addCondition(name)).unwrap();
      conditionPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Added ${name}`);
      setAddName("");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to add condition"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCondition(id: string, nameRaw: string) {
    const name = nameRaw.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(editCondition({ id, name })).unwrap();
      conditionPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Updated ${name}`);
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to update condition"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCondition(id: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(removeCondition(id)).unwrap();
      conditionPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess("Deleted");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to delete condition"));
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
            void handleAddCondition();
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
              placeholder="Add condition"
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

      <div className="mb-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search conditions"
          className="w-full sm:max-w-md"
        />
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading}
            error={error}
            success={success}
            loadingMessage="Loading conditions..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage={
          searchQuery
            ? "No conditions match your search."
            : "No conditions yet—use the form above to add one."
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
        <EditConditionDialog
          key={editing.id}
          row={editing}
          loading={loading}
          onSave={(nextName) => {
            void handleUpdateCondition(editing.id, nextName);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

        {deleting ? (
        <DeleteConditionDialog
            key={deleting.id}
            row={deleting}
            loading={loading}
            onConfirm={() => {
                void handleDeleteCondition(deleting.id);
            setDeleting(null);
            }}
            onClose={() => setDeleting(null)}
        />
        ) : null}
    </section>
  );
}
