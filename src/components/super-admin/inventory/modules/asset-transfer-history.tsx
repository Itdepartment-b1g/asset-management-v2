"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Pagination, { paginateItems } from "@/components/common/pagination";
import TableView from "@/components/common/table-view";
import { formatDateTime } from "@/lib/format-date";

import type { AssetTransfer } from "../table-views/asset-table-view";
import {
  AssetTransferTableView,
  is_initial_assignment,
  user_label,
} from "../table-views/asset-transfer-table-view";

type HistoryView = "table" | "cards";

const VIEW_STORAGE_KEY = "asset-transfer-history-view";
const DEFAULT_LIMIT = 5;
const LIMIT_OPTIONS = [5, 10, 20];

type AssetTransferHistoryProps = {
  transfers: AssetTransfer[];
};

function read_stored_view(): HistoryView {
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "table" || stored === "cards") return stored;
  } catch {
    // Ignore storage errors (private mode, disabled storage).
  }
  return "table";
}

export default function AssetTransferHistory({
  transfers,
}: AssetTransferHistoryProps) {
  const [view, setView] = useState<HistoryView>("table");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    setView(read_stored_view());
  }, []);

  const { items, meta } = useMemo(
    () => paginateItems(transfers, page, limit),
    [transfers, page, limit],
  );

  const columns = useMemo(() => AssetTransferTableView(), []);

  useEffect(() => {
    if (page !== meta.page) setPage(meta.page);
  }, [page, meta.page]);

  const showPagination = transfers.length > DEFAULT_LIMIT || meta.total_pages > 1;

  function handleViewChange(next: HistoryView) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
  }

  return (
    <div className="col-span-full" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Transfer history
        </p>
        {transfers.length > 0 ? (
          <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
            <button
              type="button"
              aria-pressed={view === "table"}
              onClick={() => handleViewChange("table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                view === "table"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Table2 aria-hidden className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              type="button"
              aria-pressed={view === "cards"}
              onClick={() => handleViewChange("cards")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                view === "cards"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <LayoutGrid aria-hidden className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>
        ) : null}
      </div>

      {transfers.length === 0 ? (
        <p className="mt-1 text-zinc-800">No transfers yet.</p>
      ) : view === "table" ? (
        <div className="mt-2">
          <TableView
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            emptyMessage="No transfers yet."
            isAccordion={false}
          />
        </div>
      ) : (
        <ol className="mt-2 space-y-2">
          {items.map((transfer) => (
            <li
              key={transfer.id}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            >
              {is_initial_assignment(transfer) ? (
                <p className="text-zinc-800">
                  Initial assignment to {user_label(transfer.to_user)}
                </p>
              ) : (
                <p className="text-zinc-800">
                  {user_label(transfer.from_user)} → {user_label(transfer.to_user)}
                </p>
              )}
              <p className="mt-0.5 text-xs text-zinc-500">
                {formatDateTime(transfer.transferred_at)} · by{" "}
                {user_label(transfer.transferred_by)}
                {transfer.to_user?.department?.name
                  ? ` · ${transfer.to_user.department.name}`
                  : ""}
                {transfer.to_location?.name
                  ? ` · ${transfer.to_location.name}`
                  : ""}
                {transfer.remarks && transfer.remarks !== "Initial assignment"
                  ? ` · ${transfer.remarks}`
                  : ""}
              </p>
            </li>
          ))}
        </ol>
      )}

      {showPagination ? (
        <Pagination
          meta={meta}
          onPrev={() => setPage(meta.page - 1)}
          onNext={() => setPage(meta.page + 1)}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          limitOptions={LIMIT_OPTIONS}
          className="mt-3"
        />
      ) : null}
    </div>
  );
}
