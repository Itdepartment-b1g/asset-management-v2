"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
  /** Provide a value accessor to make this column sortable. */
  sortValue?: (row: T) => string | number;
};

type SortState = {
  key: string;
  direction: "asc" | "desc";
} | null;

type TableViewProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  /** Enables expandable rows (requires renderExpanded). Defaults to true. */
  isAccordion?: boolean;
  /** Provide to make rows expandable; clicking a row reveals this content below it. */
  renderExpanded?: (row: T) => ReactNode;
};

function SortIndicator({ direction }: { direction: "asc" | "desc" | null }) {
  const className = `ml-1.5 h-3.5 w-3.5 ${direction ? "" : "text-zinc-400"}`;

  if (direction === "asc") return <ArrowUp aria-hidden className={className} />;
  if (direction === "desc") return <ArrowDown aria-hidden className={className} />;
  return <ArrowUpDown aria-hidden className={className} />;
}

export default function TableView<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  isAccordion = true,
  renderExpanded,
}: TableViewProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [expandedKey, setExpandedKey] = useState<string | number | null>(null);

  const expandable = isAccordion && Boolean(renderExpanded);
  const columnCount = columns.length + (expandable ? 1 : 0);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;

    const { sortValue } = column;
    const factor = sort.direction === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => {
      const valueA = sortValue(a);
      const valueB = sortValue(b);

      if (typeof valueA === "string" || typeof valueB === "string") {
        return (
          String(valueA).localeCompare(String(valueB), undefined, {
            numeric: true,
            sensitivity: "base",
          }) * factor
        );
      }

      return (valueA - valueB) * factor;
    });
  }, [rows, columns, sort]);

  function handleSort(key: string) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  function handleRowClick(key: string | number) {
    setExpandedKey((current) => (current === key ? null : key));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {expandable && <th scope="col" className="w-10 px-4 py-3" />}
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              const direction = isSorted ? sort.direction : null;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    direction === "asc"
                      ? "ascending"
                      : direction === "desc"
                        ? "descending"
                        : undefined
                  }
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 ${column.className ?? ""}`}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={`inline-flex items-center uppercase tracking-wider transition-colors hover:text-zinc-800 ${
                        isSorted ? "text-violet-700" : ""
                      }`}
                    >
                      {column.header}
                      <SortIndicator direction={direction} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-10 text-center text-sm text-zinc-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const key = rowKey(row);
              const isExpanded = expandable && expandedKey === key;

              return (
                <Fragment key={key}>
                  <tr
                    onClick={expandable ? () => handleRowClick(key) : undefined}
                    aria-expanded={expandable ? isExpanded : undefined}
                    className={`hover:bg-zinc-50/80 ${expandable ? "cursor-pointer" : ""} ${
                      isExpanded ? "bg-violet-50/50" : ""
                    }`}
                  >
                    {expandable && (
                      <td className="px-4 py-3 text-zinc-400">
                        <ChevronDown
                          aria-hidden
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180 text-violet-600" : ""
                          }`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-zinc-700 ${column.className ?? ""}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr className="bg-violet-50/30">
                      <td colSpan={columnCount} className="px-4 py-4">
                        {renderExpanded?.(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
