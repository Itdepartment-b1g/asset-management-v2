import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type AssetHolder = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type Asset = {
  id: string;
  asset_name: string;
  code_name: string;
  currently_issued_to: AssetHolder | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedAssets = {
  data: Asset[];
  meta: PaginationMeta;
};

type ApiError = { error: string };

const fetchOptions: RequestInit = {
  credentials: "include",
};

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
  items: Asset[];
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
  async (input?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();

    if (input?.page !== undefined) {
      params.set("page", String(input.page));
    }
    if (input?.limit !== undefined) {
      params.set("limit", String(input.limit));
    }

    const query = params.toString();
    const response = await fetch(query ? `/api/asset?${query}` : "/api/asset", {
      ...fetchOptions,
      cache: "no-store",
    });
    return parseResponse<PaginatedAssets>(response);
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
    return parseResponse<Asset>(response);
  },
);

export const transferAsset = createAsyncThunk(
  "assets/transfer",
  async (input: {
    asset_id: string;
    to_user_id: string;
    remarks?: string;
  }) => {
    const response = await fetch("/api/asset-transfer", {
      ...fetchOptions,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseResponse<Asset>(response);
  },
);

export const removeAsset = createAsyncThunk(
  "assets/delete",
  async (id: string) => {
    const response = await fetch(`/api/asset?id=${id}`, {
      ...fetchOptions,
      method: "DELETE",
    });
    await parseResponse<Asset>(response);
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
      .addCase(addAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        state.items.unshift(action.payload);
      })
      .addCase(
        transferAsset.fulfilled,
        (state, action: PayloadAction<Asset>) => {
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
          state.items = state.items.filter((item) => item.id !== action.payload);
        },
      );
  },
});

export const { clearAssetsError } = assetsSlice.actions;
export default assetsSlice.reducer;
