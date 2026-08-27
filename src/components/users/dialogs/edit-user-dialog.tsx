"use client";

import { RefreshCw, X } from "lucide-react";
import { useState } from "react";

import Dropdown from "@/components/common/dropdown";
import type { UserDepartment, UserItem } from "../table-views/user-table-view";
import {
  DEFAULT_TEMP_PASSWORD,
  is_managed_user_role,
  managed_user_role_options,
  type ManagedUserRole,
} from "@/components/lib/user-roles";

type EditUserDialogProps = {
  row: UserItem;
  loading: boolean;
  error?: string | null;
  departments: UserDepartment[];
  onSave: (values: {
    full_name: string;
    email: string;
    role?: ManagedUserRole;
    department_id?: string;
    password?: string;
  }) => void;
  onClose: () => void;
};

export default function EditUserDialog({
  row,
  loading,
  error = null,
  departments,
  onSave,
  onClose,
}: EditUserDialogProps) {
  const is_super_admin = row.role === "super_admin";
  const [full_name, set_full_name] = useState(row.full_name ?? "");
  const [email, set_email] = useState(row.email ?? "");
  const [role, set_role] = useState<ManagedUserRole>(
    is_managed_user_role(row.role) ? row.role : "employee",
  );
  const [department_id, set_department_id] = useState<string | null>(
    row.department_id,
  );
  const [password, set_password] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit user"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">Edit user</h3>
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
            onSave({
              full_name,
              email,
              role: is_super_admin ? undefined : role,
              department_id: department_id ?? undefined,
              password: password.trim() || undefined,
            });
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Full name</span>
            <input
              value={full_name}
              onChange={(event) => set_full_name(event.target.value)}
              disabled={loading}
              required
              autoFocus
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => set_email(event.target.value)}
              disabled={loading}
              required
              className="rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Role</span>
            {is_super_admin ? (
              <input
                value="Super admin"
                disabled
                className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm text-zinc-600"
              />
            ) : (
              <Dropdown
                options={[...managed_user_role_options]}
                value={role}
                onChange={(value) => set_role(value as ManagedUserRole)}
                placeholder="Select a role"
                isSearchable={false}
              />
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Department</span>
            <Dropdown
              options={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              value={department_id}
              onChange={set_department_id}
              placeholder={
                departments.length === 0
                  ? "No departments yet"
                  : "Select a department"
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">
              New password
            </span>
            <div className="flex gap-2">
              <input
                value={password}
                onChange={(event) => set_password(event.target.value)}
                disabled={loading}
                placeholder="Leave blank to keep current password"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none focus:border-violet-600 disabled:opacity-50"
              />
              <button
                type="button"
                aria-label="Generate temporary password"
                disabled={loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                onClick={() => set_password(DEFAULT_TEMP_PASSWORD)}
              >
                <RefreshCw aria-hidden className="h-4 w-4" />
              </button>
            </div>
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
              disabled={
                loading ||
                full_name.trim().length === 0 ||
                email.trim().length === 0 ||
                (!is_super_admin && !department_id)
              }
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
