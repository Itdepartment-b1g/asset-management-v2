"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import StatCard from "@/components/common/stat-card";

type CategoryStatId = "location" | "department" | "condition" | "legend";

type CategoryStatsProps = {
  /** Refetch totals when the active tab changes (e.g. after CRUD in a panel). */
  activeTab: string;
};

type StatConfig = {
  id: CategoryStatId;
  label: string;
  icon: LucideIcon;
  available: boolean;
};

const STATS: StatConfig[] = [
  { id: "location", label: "Locations", icon: MapPin, available: true },
  {
    id: "department",
    label: "Departments",
    icon: Building2,
    available: true,
  },
  {
    id: "condition",
    label: "Conditions",
    icon: ClipboardCheck,
    available: true,
  },
  { id: "legend", label: "Legend", icon: Palette, available: true },
];

type Totals = {
  location: number | null;
  department: number | null;
  legend: number | null;
  condition: number | null;
};

async function fetchTotal(endpoint: string): Promise<number> {
  const response = await fetch(`${endpoint}?page=1&limit=1`, {
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

export default function CategoryStats({ activeTab }: CategoryStatsProps) {
  const [totals, setTotals] = useState<Totals>({
    location: null,
    department: null,
    condition: null,
    legend: null,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const baselineRef = useRef<Totals>({
    location: null,
    department: null,
    condition: null,
    legend: null,
  });

  const loadTotals = useCallback(async () => {
    try {
      const [location, department, legend, condition] = await Promise.all([
        fetchTotal("/api/location"),
        fetchTotal("/api/department"),
        fetchTotal("/api/legend"),
        fetchTotal("/api/condition"),
        ]);
      setTotals({ location, department, legend, condition });

      if (baselineRef.current.location === null) {
        baselineRef.current = { location, department, legend, condition };
      }
    } catch {
      setTotals((current) =>
        current.location === null &&
          current.department === null &&
          current.legend === null &&
          current.condition === null
          ? { location: null, department: null, legend: null, condition: current.condition }
          : { location: null, department: null, legend: null, condition: current.condition },
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTotals();
  }, [loadTotals, activeTab]);

  useEffect(() => {
    function onFocus() {
      void loadTotals();
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadTotals]);

  function valueFor(stat: StatConfig): string {
    if (!stat.available) return "0";

    const total =
      stat.id === "location"
        ? totals.location
        : stat.id === "department"
          ? totals.department
          : stat.id === "legend"
            ? totals.legend
            : stat.id === "condition"
              ? totals.condition
            : null;

    if (initialLoading && total === null) return "…";
    return total === null ? "—" : String(total);
  }

  function deltaFor(stat: StatConfig): number {
    if (!stat.available) return 0;

    const total =
      stat.id === "location"
        ? totals.location
        : stat.id === "department"
          ? totals.department
          : stat.id === "legend"
            ? totals.legend
            : stat.id === "condition"
              ? totals.condition
            : null;
    const baseline =
      stat.id === "location"
        ? baselineRef.current.location
        : stat.id === "department"
          ? baselineRef.current.department
          : stat.id === "legend"
            ? baselineRef.current.legend
            : stat.id === "condition"
              ? baselineRef.current.condition
            : null;

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
        />
      ))}
    </div>
  );
}
