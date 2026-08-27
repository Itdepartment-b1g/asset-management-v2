"use client";

import { X } from "lucide-react";
import { useState } from "react";

import Dropdown from "@/components/common/dropdown";
import type { UserDepartment, UserItem } from "../table-views/user-table-view";
import {
  managed_user_role_options,
  type ManagedUserRole,
} from "@/components/lib/user-roles";

type AssignRoleDialogProps = {
  row: UserItem;
  loading: boolean;
  error?: string | null;
  departments: UserDepartment[];
  onSave: (values: { role: ManagedUserRole; department_id: string }) => void;
  onClose: () => void;
};

export default function AssignRoleDialog({
  row,
  loading,
  error = null,
  departments,
  onSave,
  onClose,
}: AssignRoleDialogProps) {
  const [role, set_role] = useState<ManagedUserRole>("employee");
  const [department_id, set_department_id] = useState<string | null>(
    row.department_id,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Assign role"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">Assign role</h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <p className="font-medium text-zinc-900">
            {row.full_name || row.email || "User"}
          </p>
          {row.email ? <p className="mt-1">{row.email}</p> : null}
          <p className="mt-2 text-xs text-zinc-500">
            Users without an assigned role are treated as employee by default.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!department_id) return;

            onSave({
              role,
              department_id,
            });
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">Role</span>
            <Dropdown
              options={[...managed_user_role_options]}
              value={role}
              onChange={(value) => set_role(value as ManagedUserRole)}
              placeholder="Select a role"
              isSearchable={false}
            />
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
              disabled={loading || !department_id}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Assign role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
