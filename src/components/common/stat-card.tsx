import type { LucideIcon } from "lucide-react";

export type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Session or period change. Omit to hide the trend badge. */
  delta?: number;
  className?: string;
};

function TrendBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        ↑ {delta}
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
        ↓ {Math.abs(delta)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
      − 0
    </span>
  );
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 ${className}`}
    >
      <Icon
        aria-hidden
        className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 text-violet-200/70"
        strokeWidth={1.25}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
          </span>
          {delta !== undefined ? <TrendBadge delta={delta} /> : null}
        </div>

        <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900">
          {value}
        </p>
        <p className="mt-1 text-sm font-medium text-violet-600">{label}</p>
      </div>
    </div>
  );
}
