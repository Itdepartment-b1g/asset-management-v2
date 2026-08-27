"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AsyncStatus } from "@/components/common/async-status";
import Dropdown from "@/components/common/dropdown";
import Pagination from "@/components/common/pagination";
import SearchInput from "@/components/common/search-input";
import TableView from "@/components/common/table-view";
import type { ManagedUserRole } from "@/components/lib/user-roles";
import { getThunkErrorMessage } from "@/lib/store/error";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchDepartments } from "@/lib/store/slices/department-slice";
import {
  clearUserPageCache,
  clearUsersError,
  createUser,
  fetchUsers,
  updateUser,
  type UserItem,
} from "@/lib/store/slices/user-slice";

import AddUserDialog from "../dialogs/add-user-dialog";
import AssignRoleDialog from "../dialogs/assign-role-dialog";
import EditUserDialog from "../dialogs/edit-user-dialog";
import { UserTableView } from "../table-views/user-table-view";

const ALL_DEPARTMENTS = "all";

export default function UserPanel() {
  const dispatch = useAppDispatch();
  const {
    items,
    meta,
    loading: usersLoading,
    error: usersError,
  } = useAppSelector((state) => state.users);
  const departments = useAppSelector((state) => state.departments.items);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<UserItem | null>(null);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [mutating, setMutating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  async function loadPage(
    pageToLoad: number,
    opts?: {
      limit?: number;
      search?: string;
      department_id?: string | null;
      bypassCache?: boolean;
    },
  ) {
    const result = await dispatch(
      fetchUsers({
        page: pageToLoad,
        limit: opts?.limit ?? limit,
        search: opts?.search ?? searchQuery,
        department_id:
          opts?.department_id === undefined
            ? departmentFilter
            : opts.department_id,
        bypassCache: opts?.bypassCache,
      }),
    ).unwrap();

    setPage(result.meta.page);
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      void dispatch(fetchDepartments({ page: 1, limit: 100 }));
    }, 0);

    return () => {
      window.clearTimeout(t);
    };
  }, [dispatch]);

  useEffect(() => {
    const nextSearch = searchInput.trim();
    const delay = nextSearch === searchQuery ? 0 : 150;
    const t = window.setTimeout(() => {
      setSearchQuery(nextSearch);
      void loadPage(1, {
        search: nextSearch,
        department_id: departmentFilter,
      }).catch(() => {
        /* error stored in redux */
      });
    }, delay);

    return () => {
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search and department-driven reload
  }, [searchInput, departmentFilter]);

  const columns = UserTableView(
    usersLoading || mutating,
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

    setMutating(true);
    setDialogError(null);
    dispatch(clearUsersError());

    try {
      await dispatch(
        createUser({
          full_name,
          email,
          password,
          role: values.role,
          department_id,
        }),
      ).unwrap();
      clearUserPageCache();
      await loadPage(page, { bypassCache: true });
      setCreating(false);
      toast.success(`Added ${full_name}. Temporary password: ${password}`);
    } catch (e) {
      const message = getThunkErrorMessage(e, "Failed to add user");
      setDialogError(message);
      toast.error(message);
    } finally {
      setMutating(false);
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

    setMutating(true);
    setDialogError(null);
    dispatch(clearUsersError());

    try {
      const updated = await dispatch(
        updateUser({
          id,
          role: values.role,
          department_id,
        }),
      ).unwrap();
      clearUserPageCache();
      await loadPage(page, { bypassCache: true });
      setAssigning(null);
      toast.success(
        `Assigned ${updated.full_name || updated.email || "user"} as ${values.role.replace("_", " ")}.`,
      );
    } catch (e) {
      const message = getThunkErrorMessage(e, "Failed to assign role");
      setDialogError(message);
      toast.error(message);
    } finally {
      setMutating(false);
    }
  }

  async function saveUser(
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

    setMutating(true);
    setDialogError(null);
    dispatch(clearUsersError());

    try {
      await dispatch(
        updateUser({
          id,
          full_name,
          email,
          ...(values.role ? { role: values.role } : {}),
          ...(values.department_id
            ? { department_id: values.department_id }
            : {}),
          password: values.password,
        }),
      ).unwrap();
      clearUserPageCache();
      await loadPage(page, { bypassCache: true });
      setEditing(null);
      toast.info(
        values.password
          ? `Updated ${full_name}. New temporary password: ${values.password}`
          : `Updated ${full_name}`,
      );
    } catch (e) {
      const message = getThunkErrorMessage(e, "Failed to update user");
      setDialogError(message);
      toast.error(message);
    } finally {
      setMutating(false);
    }
  }

  const busy = usersLoading || mutating;

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
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
          onClick={() => {
            setDialogError(null);
            dispatch(clearUsersError());
            setCreating(true);
          }}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add user
        </button>
      </div>

      {usersLoading && !creating && !editing && !assigning ? (
        <div className="mb-3">
          <AsyncStatus
            loading
            error={null}
            success={null}
            loadingMessage="Loading users..."
          />
        </div>
      ) : null}

      {!creating && !editing && !assigning && usersError ? (
        <div className="mb-3">
          <AsyncStatus
            loading={false}
            error={usersError}
            success={null}
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
          disabled={busy}
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
          loading={mutating}
          error={dialogError}
          departments={departments}
          onSave={(values) => {
            void addUser(values);
          }}
          onClose={() => {
            setCreating(false);
            setDialogError(null);
          }}
        />
      ) : null}

      {assigning ? (
        <AssignRoleDialog
          key={assigning.id}
          row={assigning}
          loading={mutating}
          error={dialogError}
          departments={departments}
          onSave={(values) => {
            void assignRole(assigning.id, values);
          }}
          onClose={() => {
            setAssigning(null);
            setDialogError(null);
          }}
        />
      ) : null}

      {editing ? (
        <EditUserDialog
          key={editing.id}
          row={editing}
          loading={mutating}
          error={dialogError}
          departments={departments}
          onSave={(values) => {
            void saveUser(editing.id, values);
          }}
          onClose={() => {
            setEditing(null);
            setDialogError(null);
          }}
        />
      ) : null}
    </section>
  );
}
