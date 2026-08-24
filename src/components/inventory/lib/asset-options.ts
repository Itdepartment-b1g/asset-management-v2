export const ASSET_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "stored", label: "Stored" },
] as const;

export type AssetStatus = (typeof ASSET_STATUS_OPTIONS)[number]["value"];

export function example_asset_code_name(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `B1G-ASSET-${year}${month}-0001`;
}

export function format_condition_label(
  value: { name: string } | string | null | undefined,
) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.name;
}

export function format_status_label(value: string | null | undefined) {
  const match = ASSET_STATUS_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value ?? "—";
}
