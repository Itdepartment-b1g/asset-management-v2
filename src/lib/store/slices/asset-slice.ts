import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  AssetItem,
  AssetListItem,
} from "@/components/inventory/lib/asset-types";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedAssets = {
  data: AssetListItem[];
  meta: PaginationMeta;
};

export type FetchAssetsInput = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | null;
};

type ApiError = { error: string };

const fetchOptions: RequestInit = {
  credentials: "include",
};

const assetPageCache = new Map<string, PaginatedAssets>();
const ASSET_CACHE_VERSION = "v5";

export function clearAssetPageCache() {
  assetPageCache.clear();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = (data as ApiError).error ?? "Request failed";
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

type AssetsState = {
  items: AssetListItem[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
};

const initialState: AssetsState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchAssets = createAsyncThunk(
  "assets/fetchAll",
  async (input?: FetchAssetsInput) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const search = input?.search?.trim() ?? "";
    const status = input?.status?.trim() || "";

    const cacheKey = `/api/asset|${ASSET_CACHE_VERSION}|page=${page}|limit=${limit}|search=${search}|status=${status}`;
    const cached = assetPageCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }

    const response = await fetch(`/api/asset?${params.toString()}`, {
      ...fetchOptions,
      cache: "no-store",
    });
    const payload = await parseResponse<PaginatedAssets>(response);
    assetPageCache.set(cacheKey, payload);
    return payload;
  },
);

export const fetchAssetById = createAsyncThunk(
  "assets/fetchById",
  async (id: string) => {
    const response = await fetch(`/api/asset?id=${encodeURIComponent(id)}`, {
      ...fetchOptions,
      cache: "no-store",
    });
    return parseResponse<AssetItem>(response);
  },
);

export const addAsset = createAsyncThunk(
  "assets/create",
  async (form: FormData) => {
    const response = await fetch("/api/asset", {
      ...fetchOptions,
      method: "POST",
      body: form,
    });
    return parseResponse<AssetItem>(response);
  },
);

export const editAsset = createAsyncThunk(
  "assets/update",
  async (form: FormData) => {
    const response = await fetch("/api/asset", {
      ...fetchOptions,
      method: "PATCH",
      body: form,
    });
    return parseResponse<AssetItem>(response);
  },
);

export const transferAsset = createAsyncThunk(
  "assets/transfer",
  async (input: {
    asset_id: string;
    to_user_id?: string | null;
    to_holder_id?: string | null;
    remarks?: string;
    location_id?: string;
  }) => {
    const response = await fetch("/api/asset-transfer", {
      ...fetchOptions,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseResponse<AssetItem>(response);
  },
);

export const removeAsset = createAsyncThunk(
  "assets/delete",
  async (id: string) => {
    const response = await fetch(`/api/asset?id=${id}`, {
      ...fetchOptions,
      method: "DELETE",
    });
    await parseResponse<AssetItem>(response);
    return id;
  },
);

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    clearAssetsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAssets.fulfilled,
        (state, action: PayloadAction<PaginatedAssets>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load assets";
      })
      .addCase(addAsset.fulfilled, (state, action: PayloadAction<AssetItem>) => {
        clearAssetPageCache();
        state.items.unshift(action.payload);
      })
      .addCase(editAsset.fulfilled, (state, action: PayloadAction<AssetItem>) => {
        clearAssetPageCache();
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
      })
      .addCase(
        transferAsset.fulfilled,
        (state, action: PayloadAction<AssetItem>) => {
          clearAssetPageCache();
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id,
          );
          if (index !== -1) {
            state.items[index] = {
              ...state.items[index],
              ...action.payload,
            };
          }
        },
      )
      .addCase(
        removeAsset.fulfilled,
        (state, action: PayloadAction<string>) => {
          clearAssetPageCache();
          state.items = state.items.filter(
            (item) => item.id !== action.payload,
          );
        },
      );
  },
});

export const { clearAssetsError } = assetsSlice.actions;
export default assetsSlice.reducer;
