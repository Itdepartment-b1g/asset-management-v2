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
  addDepartment,
  editDepartment,
  removeDepartment,
} from "@/lib/store/slices/department-slice";

import {
  DepartmentTableView,
  type DepartmentItem,
} from "../table-views/department-table-view";
import DeleteDepartmentDialog from "../dialogs/delete-department-dialog";
import EditDepartmentDialog from "../dialogs/edit-department-dialog";


type PaginatedDepartments = {
  data: DepartmentItem[];
  meta: PaginationMeta;
};

const departmentPageCache = new Map<string, PaginatedDepartments>();

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




export default function DepartmentPanel() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<DepartmentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [addName, setAddName] = useState("");
  const [editing, setEditing] = useState<DepartmentItem | null>(null);
  const [deleting, setDeleting] = useState<DepartmentItem | null>(null);
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
      const cacheKey = `/api/department|page=${pageToLoad}|limit=${limitToUse}|search=${searchToUse}`;
      const cached = departmentPageCache.get(cacheKey);
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

      const response = await fetch(`/api/department?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedDepartments>(response);
      departmentPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load departments");
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

  const columns = DepartmentTableView(
    loading,
    (row) => setEditing(row),
    (row) => setDeleting(row),
  );

  async function handleAddDepartment() {
    const name = addName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(addDepartment(name)).unwrap();
      departmentPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Added ${name}`);
      setAddName("");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to add department"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDepartment(id: string, nameRaw: string) {
    const name = nameRaw.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(editDepartment({ id, name })).unwrap();
      departmentPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess(`Updated ${name}`);
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to update department"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDepartment(id: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(removeDepartment(id)).unwrap();
      departmentPageCache.clear();
      await loadPage(page, { manageLoading: false });
      setSuccess("Deleted");
    } catch (e) {
      setError(getThunkErrorMessage(e, "Failed to delete department"));
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
            void handleAddDepartment();
          }}
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              disabled={loading}
              required
              minLength={3}
              maxLength={255}
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
              placeholder="Add department"
            />
            <span className="text-xs text-zinc-500">
              Use 3–255 characters: letters, numbers, and spaces only.
            </span>
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
          placeholder="Search departments"
          className="w-full sm:max-w-md"
        />
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading}
            error={error}
            success={success}
            loadingMessage="Loading departments..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage={
          searchQuery
            ? "No departments match your search."
            : "No departments yet—use the form above to add one."
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
        <EditDepartmentDialog
          key={editing.id}
          row={editing}
          loading={loading}
          onSave={(nextName) => {
            void handleUpdateDepartment(editing.id, nextName);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

        {deleting ? (
        <DeleteDepartmentDialog
            key={deleting.id}
            row={deleting}
            loading={loading}
            onConfirm={() => {
            void handleDeleteDepartment(deleting.id);
            setDeleting(null);
            }}
            onClose={() => setDeleting(null)}
        />
        ) : null}
    </section>
  );
}
