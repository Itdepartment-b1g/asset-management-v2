"use client";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export function paginateItems<T>(
  allItems: T[],
  page: number,
  limit = 10,
): { items: T[]; meta: PaginationMeta } {
  const total = allItems.length;
  const total_pages = total === 0 ? 0 : Math.ceil(total / limit);
  const safePage =
    total_pages === 0 ? 1 : Math.min(Math.max(page, 1), total_pages);
  const start = (safePage - 1) * limit;

  return {
    items: allItems.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      total_pages,
      has_next_page: safePage < total_pages,
      has_prev_page: safePage > 1 && total_pages > 0,
    },
  };
}

type PaginationProps = {
  meta: PaginationMeta;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** When provided, shows a "Rows per page" selector on the left. */
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
};

export default function Pagination({
  meta,
  disabled = false,
  onPrev,
  onNext,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  className = "mt-4",
}: PaginationProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {onLimitChange ? (
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Rows per page
            <select
              value={meta.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              disabled={disabled}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-violet-600 disabled:opacity-50"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-50 disabled:hover:text-zinc-500"
          onClick={onPrev}
          disabled={!meta.has_prev_page || disabled}
        >
          Previous
        </button>
        <span className="text-xs text-zinc-500">
          Page <span className="font-medium text-zinc-700">{meta.page}</span>{" "}
          of{" "}
          <span className="font-medium text-zinc-700">{meta.total_pages}</span>
        </span>
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
          onClick={onNext}
          disabled={!meta.has_next_page || disabled}
        >
          Next
        </button>
      </div>
    </div>
  );
}
