"use client";

import {
  Archive,
  CheckCircle2,
  CircleOff,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import StatCard from "@/components/common/stat-card";
import type { AssetStatus } from "@/components/lib/asset-options";

export type AssetStatId = "active" | "inactive" | "stored" | "total";

type CardStatsProps = {
  /** Bump after create/delete so totals refetch. */
  refreshKey?: number;
  selectedId?: AssetStatId;
  onSelect?: (id: AssetStatId) => void;
};

type StatConfig = {
  id: AssetStatId;
  label: string;
  icon: LucideIcon;
  status?: AssetStatus;
};

const STATS: StatConfig[] = [
  { id: "total", label: "Assets created", icon: Package },
  { id: "active", label: "Active", icon: CheckCircle2, status: "active" },
  { id: "inactive", label: "Inactive", icon: CircleOff, status: "inactive" },
  { id: "stored", label: "Stored", icon: Archive, status: "stored" },
];

type Totals = Record<AssetStatId, number | null>;

const emptyTotals = (): Totals => ({
  active: null,
  inactive: null,
  stored: null,
  total: null,
});

async function fetchTotal(status?: string): Promise<number> {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("limit", "1");
  if (status) {
    params.set("status", status);
  }

  const response = await fetch(`/api/asset?${params.toString()}`, {
    credentials: "include",
  });
  const data = (await response.json()) as {
    meta?: { total?: number };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load count");
  }

  return data.meta?.total ?? 0;
}

export default function CardStats({
  refreshKey = 0,
  selectedId = "total",
  onSelect,
}: CardStatsProps) {
  const [totals, setTotals] = useState<Totals>(emptyTotals);
  const [initialLoading, setInitialLoading] = useState(true);
  const baselineRef = useRef<Totals>(emptyTotals());

  const loadTotals = useCallback(async () => {
    try {
      const [active, inactive, stored, total] = await Promise.all([
        fetchTotal("active"),
        fetchTotal("inactive"),
        fetchTotal("stored"),
        fetchTotal(),
      ]);
      setTotals({ active, inactive, stored, total });

      if (baselineRef.current.total === null) {
        baselineRef.current = { active, inactive, stored, total };
      }
    } catch {
      setTotals(emptyTotals());
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTotals();
  }, [loadTotals, refreshKey]);

  useEffect(() => {
    function onFocus() {
      void loadTotals();
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadTotals]);

  function valueFor(stat: StatConfig): string {
    const total = totals[stat.id];
    if (initialLoading && total === null) return "…";
    return total === null ? "—" : String(total);
  }

  function deltaFor(stat: StatConfig): number {
    const total = totals[stat.id];
    const baseline = baselineRef.current[stat.id];
    if (total === null || baseline === null) return 0;
    return total - baseline;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          value={valueFor(stat)}
          delta={deltaFor(stat)}
          selected={selectedId === stat.id}
          onClick={onSelect ? () => onSelect(stat.id) : undefined}
        />
      ))}
    </div>
  );
}
