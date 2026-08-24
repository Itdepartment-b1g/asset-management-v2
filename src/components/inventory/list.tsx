"use client";

import AssetPanel from "./modules/asset-panel";

export default function InventoryList() {
  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Assets</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create assets, assign condition and status, and keep warranty and
          receipt photos with each record.
        </p>
      </header>

      <AssetPanel />
    </div>
  );
}
