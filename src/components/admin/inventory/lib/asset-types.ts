export type AssetLookup = {
  id: string;
  name: string;
};

export type AssetLegend = {
  id: string;
  name: string;
  color: string;
};

export type AssetUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  department?: AssetLookup | null;
};

export type AssetTransfer = {
  id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  from_holder_id: string | null;
  to_holder_id: string | null;
  from_location_id: string | null;
  to_location_id: string | null;
  remarks: string | null;
  transferred_by_id: string;
  transferred_at: string;
  from_user: AssetUser | null;
  to_user: AssetUser | null;
  from_holder: AssetLookup | null;
  to_holder: AssetLookup | null;
  transferred_by: AssetUser;
  from_location: AssetLookup | null;
  to_location: AssetLookup | null;
};

export type AssetPhotoMeta = {
  id: string;
  kind: "warranty" | "receipt";
  file_name: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

export type AssetListItem = {
  id: string;
  asset_name: string;
  code_name: string;
  current_condition: AssetLookup | null;
  status: "active" | "inactive" | "stored" | null;
  currently_issued_to_id: string | null;
  currently_issued_holder_id: string | null;
  created_at: string;
  updated_at: string;
  department: AssetLookup | null;
  location: AssetLookup | null;
  legend: AssetLegend | null;
  currently_issued_to: AssetUser | null;
  currently_issued_holder: AssetLookup | null;
};

export type AssetItem = AssetListItem & {
  serial_number: string | null;
  purchase_date: string | null;
  condition_assignment: AssetLookup | null;
  remarks: string | null;
  vendor_name: string | null;
  cost_value: number | null;
  salvage_value: number | null;
  warranty_end_date: string | null;
  useful_life_end_date: string | null;
  original_issue_date: string | null;
  created_by_id: string | null;
  created_by: AssetUser | null;
  photos: AssetPhotoMeta[];
  transfers: AssetTransfer[];
};

export function user_label(user: AssetUser | null | undefined) {
  if (!user) return "Unassigned";
  return user.full_name || user.email || user.id;
}

export function holder_label(holder: AssetLookup | null | undefined) {
  return holder?.name || "—";
}

export function issued_to_label(row: {
  currently_issued_to?: AssetUser | null;
  currently_issued_holder?: AssetLookup | null;
}) {
  if (row.currently_issued_to) {
    return user_label(row.currently_issued_to);
  }
  if (row.currently_issued_holder) {
    return row.currently_issued_holder.name;
  }
  return "Unassigned";
}
