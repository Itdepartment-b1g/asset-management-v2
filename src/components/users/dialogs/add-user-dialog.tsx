"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

import Dropdown from "@/components/common/dropdown";
import {
  DEFAULT_TEMP_PASSWORD,
  managed_user_role_options,
  type ManagedUserRole,
} from "@/components/lib/user-roles";
import type { UserDepartment } from "../table-views/user-table-view";

type AddUserDialogProps = {
  loading: boolean;
  error: string | null;
  departments: UserDepartment[];
  onSave: (values: {
    full_name: string;
    email: string;
    password: string;
    role: ManagedUserRole;
    department_id: string;
  }) => void;
  onClose: () => void;
};

export default function AddUserDialog({
  loading,
  error,
  departments,
  onSave,
  onClose,
}: AddUserDialogProps) {
  const [full_name, set_full_name] = useState("");
  const [email, set_email] = useState("");
  const [role, set_role] = useState<ManagedUserRole>("employee");
  const [department_id, set_department_id] = useState<string | null>(null);
  const [copied, set_copied] = useState(false);

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(DEFAULT_TEMP_PASSWORD);
      set_copied(true);
      window.setTimeout(() => set_copied(false), 1500);
    } catch {
      // The parent error banner handles copy failures if needed.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add user"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">Add user</h3>
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
              password: DEFAULT_TEMP_PASSWORD,
              role,
              department_id: department_id ?? "",
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
              placeholder="Add user name"
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
              placeholder="user@company.com"
            />
          </label>

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
            {departments.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Add a department in Categories first.
              </p>
            ) : null}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700">
              Temporary password
            </span>
            <div className="flex gap-2">
              <input
                value={DEFAULT_TEMP_PASSWORD}
                readOnly
                disabled={loading}
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-violet-50 px-4 py-2.5 text-sm outline-none disabled:opacity-50"
              />
              <button
                type="button"
                aria-label={copied ? "Password copied" : "Copy password"}
                disabled={loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                onClick={() => void copyPassword()}
              >
                {copied ? (
                  <Check aria-hidden className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy aria-hidden className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              {copied
                ? "Password copied."
                : "Every new user signs in with this default password."}
            </p>
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
                !department_id
              }
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
