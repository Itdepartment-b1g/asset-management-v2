import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
  } from "@reduxjs/toolkit";

  export type Legend = {
    id: string;
    name: string;
    color: string;
    created_by_id: string | null;
    created_at: string;
    updated_at: string;
  }

  export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  }

  export type PaginatedLegends = {
    data: Legend[];
    meta: PaginationMeta;
  }

  type ApiError = { error: string };

  const fetchOptions: RequestInit = {
    credentials: "include",
  }
  
  async function parseResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if(!response.ok){
        const message = (data as ApiError).error ?? "Request failed";
        const error = new Error(message) as Error & { status?: number};
        error.status = response.status;
        throw error;
    }
    return data as T;
  }

  type LegendsState = {
    items: Legend[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
  }

  const initialState: LegendsState = {
    items: [],
    meta: null,
    loading: false,
    error: null,
  }

  export const fetchLegends = createAsyncThunk(
    "legends/fetchAll",
    async (input?: { page?: number; limit?: number }) => {
        const params = new URLSearchParams();

        if(input?.page !== undefined){
            params.set("page", String(input.page));
        }

        if(input?.limit !== undefined){
            params.set("limit", String(input.limit));
        }

        const query = params.toString();
        const response = await fetch(
            query ? `/api/legend?${query}` : "/api/legend",
            {
                ...fetchOptions,
                cache: "no-store",
            },
        );
        return parseResponse<PaginatedLegends>(response);
    }
  )

  export const addLegend = createAsyncThunk(
    "legends/create",
    async ({ name, color }: { name: string; color: string }) => {
        const response = await fetch("/api/legend", {
            ...fetchOptions,
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, color}),
        });
        return parseResponse<Legend>(response);
    }
  )

  export const editLegend = createAsyncThunk(
    "legends/update",
    async ({ id, name, color }: { id: string; name: string; color: string }) => {
        const response = await fetch("/api/legend", {
            ...fetchOptions,
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id, name, color}),
        });
        return parseResponse<Legend>(response);
    }
  )

  export const deleteLegend = createAsyncThunk(
    "legends/delete",
    async (id: string) => {
        const response = await fetch(`/api/legend?id=${id}`, {
            ...fetchOptions,
            method: "DELETE",
        });
        return parseResponse<Legend>(response);
    }
  )

  const legendSlice = createSlice({
    name: "legends",
    initialState,
    reducers: {
        clearLegendsError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLegends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchLegends.fulfilled,
                (state, action: PayloadAction<PaginatedLegends>) => {
                    state.loading = false;
                    state.items = action.payload.data;
                    state.meta = action.payload.meta;
                },
            )
            .addCase(fetchLegends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to load legends";
            })
            .addCase(
                addLegend.fulfilled,
                (state, action: PayloadAction<Legend>) => {
                    state.items.unshift(action.payload);
                },
            )
            .addCase(
                editLegend.fulfilled,
                (state, action: PayloadAction<Legend>) => {
                    const index = state.items.findIndex(
                        (item) => item.id === action.payload.id,
                    );
                    if (index !== -1) {
                        state.items[index] = action.payload;
                    }
                },
            )
            .addCase(
                deleteLegend.fulfilled,
                (state, action: PayloadAction<Legend>) => {
                    state.items = state.items.filter(
                        (item) => item.id !== action.payload.id,
                    );
                },
            );
    },
  })

  export const { clearLegendsError } = legendSlice.actions;
  export default legendSlice.reducer;