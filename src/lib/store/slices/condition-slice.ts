import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
  } from "@reduxjs/toolkit";
  
  export type Condition = {
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
  
  export type PaginatedConditions = {
    data: Condition[];
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
  
  type ConditionsState = {
    items: Condition[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
  };
  
  const initialState: ConditionsState = {
    items: [],
    meta: null,
    loading: false,
    error: null,
  };
  
  export const fetchConditions = createAsyncThunk(
    "conditions/fetchAll",
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
        query ? `/api/condition?${query}` : "/api/condition",
        {
          ...fetchOptions,
          cache: "no-store",
        },
      );
      return parseResponse<PaginatedConditions>(response);
    },
  );
  
  export const addDepartment = createAsyncThunk(
    "conditions/create",
    async (name: string) => {
      const response = await fetch("/api/condition", {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return parseResponse<Condition>(response);
    },
  );
  
  export const editDepartment = createAsyncThunk(
    "conditions/update",
    async ({ id, name }: { id: string; name: string }) => {
      const response = await fetch("/api/condition", {
        ...fetchOptions,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      return parseResponse<Condition>(response);
    },
  );
  
    export const removeCondition = createAsyncThunk(
    "conditions/delete",
    async (id: string) => {
      const response = await fetch(`/api/condition?id=${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      await parseResponse<Condition>(response);
      return id;
    },
  );
  
  const conditionsSlice = createSlice({
    name: "conditions",
    initialState,
    reducers: {
      clearConditionsError(state) {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchConditions.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          fetchConditions.fulfilled,
          (state, action: PayloadAction<PaginatedConditions>) => {
            state.loading = false;
            state.items = action.payload.data;
            state.meta = action.payload.meta;
          },
        )
        .addCase(fetchConditions.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message ?? "Failed to load conditions";
        })
        .addCase(
          addDepartment.fulfilled,
            (state, action: PayloadAction<Condition>) => {
            state.items.unshift(action.payload);
          },
        )
        .addCase(
          editDepartment.fulfilled,
          (state, action: PayloadAction<Condition>) => {
            const index = state.items.findIndex(
              (item) => item.id === action.payload.id,
            );
            if (index !== -1) {
              state.items[index] = action.payload;
            }
          },
        )
        .addCase(
          removeCondition.fulfilled,
          (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(
              (item) => item.id !== action.payload,
            );
          },
        );
    },
  });
  
  export const { clearConditionsError } = conditionsSlice.actions;
  export default conditionsSlice.reducer;
  