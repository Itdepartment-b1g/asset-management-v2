"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { AsyncStatus } from "@/components/common/async-status";
import Dropdown from "@/components/common/dropdown";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/pagination";
import SearchInput from "@/components/common/search-input";
import TableView from "@/components/common/table-view";

import {
  UserTableView,
  type UserDepartment,
  type UserItem,
} from "../table-views/user-table-view";
import AddUserDialog from "../dialogs/add-user-dialog";
import AssignRoleDialog from "../dialogs/assign-role-dialog";
import EditUserDialog from "../dialogs/edit-user-dialog";
import type { ManagedUserRole } from "@/components/lib/user-roles";

type PaginatedUsers = {
  data: UserItem[];
  meta: PaginationMeta;
};

type PaginatedDepartments = {
  data: UserDepartment[];
  meta: PaginationMeta;
};

const ALL_DEPARTMENTS = "all";

const userPageCache = new Map<string, PaginatedUsers>();

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

export default function UserPanel() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<UserItem | null>(null);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [departments, setDepartments] = useState<UserDepartment[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  async function loadPage(
    pageToLoad: number,
    opts?: {
      manageLoading?: boolean;
      limit?: number;
      search?: string;
      department_id?: string | null;
      bypassCache?: boolean;
    },
  ) {
    const manageLoading = opts?.manageLoading ?? true;
    const limitToUse = opts?.limit ?? limit;
    const searchToUse = opts?.search ?? searchQuery;
    const departmentToUse =
      opts?.department_id === undefined
        ? departmentFilter
        : opts.department_id;
    const bypassCache = opts?.bypassCache ?? false;

    if (manageLoading) {
      setLoading(true);
      setError(null);
      setSuccess(null);
    }

    try {
      const cacheKey = `/api/auth/users|page=${pageToLoad}|limit=${limitToUse}|search=${searchToUse}|department=${departmentToUse ?? ""}`;
      if (!bypassCache) {
        const cached = userPageCache.get(cacheKey);
        if (cached) {
          setItems(cached.data);
          setMeta(cached.meta);
          setPage(cached.meta.page);
          return;
        }
      }

      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("limit", String(limitToUse));
      if (searchToUse) {
        params.set("search", searchToUse);
      }
      if (departmentToUse) {
        params.set("department_id", departmentToUse);
      }

      const response = await fetch(`/api/auth/users?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });

      const payload = await parseResponse<PaginatedUsers>(response);
      userPageCache.set(cacheKey, payload);
      setItems(payload.data);
      setMeta(payload.meta);
      setPage(payload.meta.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      if (manageLoading) setLoading(false);
    }
  }

  function apply_user_update(updated: UserItem) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
    );

    for (const [key, cached] of userPageCache.entries()) {
      userPageCache.set(key, {
        ...cached,
        data: cached.data.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      });
    }
  }

  async function loadDepartments() {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");

      const response = await fetch(`/api/department?${params.toString()}`, {
        ...fetchOptions,
        cache: "no-store",
      });
      const payload = await parseResponse<PaginatedDepartments>(response);
      setDepartments(payload.data);
    } catch {
      setDepartments([]);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadDepartments();
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
        department_id: departmentFilter,
        manageLoading: nextSearch === searchQuery,
      });
    }, delay);

    return () => {
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search and department-driven reload
  }, [searchInput, departmentFilter]);

  const columns = UserTableView(
    loading,
    (row) => setEditing(row),
    (row) => setAssigning(row),
  );

  async function addUser(values: {
    full_name: string;
    email: string;
    password: string;
    role: ManagedUserRole;
    department_id: string;
  }) {
    const full_name = values.full_name.trim();
    const email = values.email.trim();
    const password = values.password.trim();
    const department_id = values.department_id.trim();

    if (!full_name || !email || !password || !department_id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/auth/create-user", {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name,
          email,
          password,
          role: values.role,
          department_id,
        }),
      });
      await parseResponse<UserItem>(response);
      userPageCache.clear();
      await loadPage(page, { manageLoading: false, bypassCache: true });
      setCreating(false);
      setSuccess(`Added ${full_name}. Temporary password: ${password}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add user");
    } finally {
      setLoading(false);
    }
  }

  async function assignRole(
    id: string,
    values: {
      role: ManagedUserRole;
      department_id: string;
    },
  ) {
    const department_id = values.department_id.trim();
    if (!department_id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/update-user", {
        ...fetchOptions,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          role: values.role,
          department_id,
        }),
      });
      const updated = await parseResponse<UserItem>(response);
      apply_user_update(updated);
      userPageCache.clear();
      await loadPage(page, { manageLoading: false, bypassCache: true });
      setAssigning(null);
      setSuccess(
        `Assigned ${updated.full_name || updated.email || "user"} as ${values.role.replace("_", " ")}.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign role");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(
    id: string,
    values: {
      full_name: string;
      email: string;
      role?: ManagedUserRole;
      department_id?: string;
      password?: string;
    },
  ) {
    const full_name = values.full_name.trim();
    const email = values.email.trim();
    if (!full_name || !email) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/auth/update-user", {
        ...fetchOptions,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          full_name,
          email,
          ...(values.role ? { role: values.role } : {}),
          ...(values.department_id
            ? { department_id: values.department_id }
            : {}),
          password: values.password,
        }),
      });
      const updated = await parseResponse<UserItem>(response);
      apply_user_update(updated);
      userPageCache.clear();
      await loadPage(page, { manageLoading: false, bypassCache: true });
      setEditing(null);
      setSuccess(
        values.password
          ? `Updated ${full_name}. New temporary password: ${values.password}`
          : `Updated ${full_name}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name or email"
            className="w-full sm:flex-1"
          />
          <Dropdown
            options={[
              { value: ALL_DEPARTMENTS, label: "All departments" },
              ...departments.map((department) => ({
                value: department.id,
                label: department.name,
              })),
            ]}
            value={departmentFilter ?? ALL_DEPARTMENTS}
            onChange={(value) =>
              setDepartmentFilter(value === ALL_DEPARTMENTS ? null : value)
            }
            placeholder="All departments"
            isSearchable={departments.length > 8}
            className="w-full sm:w-56"
          />
        </div>
        <button
          type="button"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setCreating(true);
          }}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add user
        </button>
      </div>

      {loading || error || success ? (
        <div className="mb-3">
          <AsyncStatus
            loading={loading && !creating && !editing && !assigning}
            error={creating || editing || assigning ? null : error}
            success={success}
            loadingMessage="Loading users..."
          />
        </div>
      ) : null}

      <TableView
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage={
          searchQuery || departmentFilter
            ? "No users match your filters."
            : "No users yet—use Add to create one."
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

      {creating ? (
        <AddUserDialog
          loading={loading}
          error={error}
          departments={departments}
          onSave={(values) => {
            void addUser(values);
          }}
          onClose={() => {
            setCreating(false);
            setError(null);
          }}
        />
      ) : null}

      {assigning ? (
        <AssignRoleDialog
          key={assigning.id}
          row={assigning}
          loading={loading}
          error={error}
          departments={departments}
          onSave={(values) => {
            void assignRole(assigning.id, values);
          }}
          onClose={() => {
            setAssigning(null);
            setError(null);
          }}
        />
      ) : null}

      {editing ? (
        <EditUserDialog
          key={editing.id}
          row={editing}
          loading={loading}
          error={error}
          departments={departments}
          onSave={(values) => {
            void updateUser(editing.id, values);
          }}
          onClose={() => {
            setEditing(null);
            setError(null);
          }}
        />
      ) : null}
    </section>
  );
}
