"use client";

import UserPanel from "./modules/user-panel";

export default function SuperAdminUsersList() {
  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create admin and employee accounts. They can sign in immediately with
          the generated temporary password.
        </p>
      </header>

      <UserPanel />
    </div>
  );
}
