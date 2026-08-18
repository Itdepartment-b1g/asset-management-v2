"use client";

import { Edit3 } from "lucide-react";

import type { TableColumn } from "@/components/common/table-view";

export type UserDepartment = {
  id: string;
  name: string;
};

export type UserCreatedBy = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type UserItem = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  department_id: string | null;
  department: UserDepartment | null;
  created_by_id: string | null;
  created_by: UserCreatedBy | null;
};

export function UserTableView(
  loading: boolean,
  onEdit: (row: UserItem) => void,
): TableColumn<UserItem>[] {
  return [
    {
      key: "full_name",
      header: "Name",
      sortValue: (row) => row.full_name ?? "",
      render: (row) => (
        <span className="font-medium text-zinc-900">
          {row.full_name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortValue: (row) => row.email ?? "",
      render: (row) => (
        <span className="text-zinc-600">{row.email || "—"}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => row.department?.name ?? "",
      render: (row) => (
        <span className="text-zinc-600">{row.department?.name || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortValue: (row) => row.role ?? "",
      render: (row) => (
        <span className="capitalize text-zinc-600">
          {row.role?.replace("_", " ") || "—"}
        </span>
      ),
    },
    {
      key: "created_by",
      header: "Created by",
      sortValue: (row) => row.created_by?.full_name ?? row.created_by_id ?? "",
      render: (row) => (
        <span className="text-zinc-600">
          {row.created_by?.full_name || row.created_by?.email || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={() => onEdit(row)}
            disabled={loading}
          >
            <Edit3 aria-hidden className="h-3.5 w-3.5 text-violet-700" />
            Edit
          </button>
        </div>
      ),
    },
  ];
}
