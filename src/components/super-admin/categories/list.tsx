"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import Tabs from "@/components/common/tabs";

import CategoryStats from "./card-views/category-stats";
import LegendPanel from "./modules/legend-panel";
import LocationPanel from "./modules/location-panel";
import HolderPanel from "./modules/holder-panel";
import DepartmentPanel from "./modules/department-panel";
import ConditionPanel from "./modules/condition-panel";

export default function SuperAdminCategoriesList() {
  const [tab, setTab] = useState<string>("location");

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Categories</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add and maintain the lookup values used across the asset system.
        </p>
      </header>

      <CategoryStats activeTab={tab} />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "location",
            label: "Location",
            icon: <MapPin aria-hidden className="h-4 w-4" />,
            content: <LocationPanel />,
          },
          {
            id: "holder",
            label: "Shared Pools",
            icon: <UsersRound aria-hidden className="h-4 w-4" />,
            content: <HolderPanel />,
          },
          {
            id: "department",
            label: "Departments",
            icon: <Building2 aria-hidden className="h-4 w-4" />,
            content: <DepartmentPanel />,
          },
          {
            id: "condition",
            label: "Conditions",
            icon: <ClipboardCheck aria-hidden className="h-4 w-4" />,
            content: (
              <ConditionPanel />
            ),
          },
          {
            id: "legend",
            label: "Legend",
            icon: <Palette aria-hidden className="h-4 w-4" />,
            content: <LegendPanel />,
          },
        ]}
      />
    </div>
  );
}
