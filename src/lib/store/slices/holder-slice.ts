import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type Holder = {
  id: string;
  name: string;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedHolders = {
  data: Holder[];
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

type HoldersState = {
  items: Holder[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
};

const initialState: HoldersState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchHolders = createAsyncThunk(
  "holders/fetchAll",
  async (input?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();

    if (input?.page !== undefined) {
      params.set("page", String(input.page));
    }
    if (input?.limit !== undefined) {
      params.set("limit", String(input.limit));
    }

    const query = params.toString();
    const response = await fetch(
      query ? `/api/holder?${query}` : "/api/holder",
      {
        ...fetchOptions,
        cache: "no-store",
      },
    );
    return parseResponse<PaginatedHolders>(response);
  },
);

export const addHolder = createAsyncThunk(
  "holders/create",
  async (name: string) => {
    const response = await fetch("/api/holder", {
      ...fetchOptions,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return parseResponse<Holder>(response);
  },
);

export const editHolder = createAsyncThunk(
  "holders/update",
  async ({ id, name }: { id: string; name: string }) => {
    const response = await fetch("/api/holder", {
      ...fetchOptions,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    return parseResponse<Holder>(response);
  },
);

export const removeHolder = createAsyncThunk(
  "holders/delete",
  async (id: string) => {
    const response = await fetch(`/api/holder?id=${id}`, {
      ...fetchOptions,
      method: "DELETE",
    });
    await parseResponse<Holder>(response);
    return id;
  },
);

const holdersSlice = createSlice({
  name: "holders",
  initialState,
  reducers: {
    clearHoldersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHolders.fulfilled,
        (state, action: PayloadAction<PaginatedHolders>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchHolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load shared pools";
      })
      .addCase(addHolder.fulfilled, (state, action: PayloadAction<Holder>) => {
        state.items.unshift(action.payload);
      })
      .addCase(editHolder.fulfilled, (state, action: PayloadAction<Holder>) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(
        removeHolder.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item.id !== action.payload,
          );
        },
      );
  },
});

export const { clearHoldersError } = holdersSlice.actions;
export default holdersSlice.reducer;
