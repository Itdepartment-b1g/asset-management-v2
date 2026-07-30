import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type Location = {
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

export type PaginatedLocations = {
  data: Location[];
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

type LocationsState = {
  items: Location[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
};

const initialState: LocationsState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchLocations = createAsyncThunk(
  "locations/fetchAll",
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
      query ? `/api/location?${query}` : "/api/location",
      {
        ...fetchOptions,
        cache: "no-store",
      },
    );
    return parseResponse<PaginatedLocations>(response);
  },
);

export const addLocation = createAsyncThunk(
  "locations/create",
  async (name: string) => {
    const response = await fetch("/api/location", {
      ...fetchOptions,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return parseResponse<Location>(response);
  },
);

export const editLocation = createAsyncThunk(
  "locations/update",
  async ({ id, name }: { id: string; name: string }) => {
    const response = await fetch("/api/location", {
      ...fetchOptions,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    return parseResponse<Location>(response);
  },
);

export const removeLocation = createAsyncThunk(
  "locations/delete",
  async (id: string) => {
    const response = await fetch(`/api/location?id=${id}`, {
      ...fetchOptions,
      method: "DELETE",
    });
    await parseResponse<Location>(response);
    return id;
  },
);

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    clearLocationsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLocations.fulfilled,
        (state, action: PayloadAction<PaginatedLocations>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load locations";
      })
      .addCase(
        addLocation.fulfilled,
        (state, action: PayloadAction<Location>) => {
          state.items.unshift(action.payload);
        },
      )
      .addCase(
        editLocation.fulfilled,
        (state, action: PayloadAction<Location>) => {
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id,
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        },
      )
      .addCase(
        removeLocation.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item.id !== action.payload,
          );
        },
      );
  },
});

export const { clearLocationsError } = locationsSlice.actions;
export default locationsSlice.reducer;
