import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
  } from "@reduxjs/toolkit";
  
  export type Department = {
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
  
  export type PaginatedDepartments = {
    data: Department[];
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
  
  type DepartmentsState = {
    items: Department[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
  };
  
  const initialState: DepartmentsState = {
    items: [],
    meta: null,
    loading: false,
    error: null,
  };
  
  export const fetchDepartments = createAsyncThunk(
    "departments/fetchAll",
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
        query ? `/api/department?${query}` : "/api/department",
        {
          ...fetchOptions,
          cache: "no-store",
        },
      );
      return parseResponse<PaginatedDepartments>(response);
    },
  );
  
  export const addDepartment = createAsyncThunk(
    "department/create",
    async (name: string) => {
      const response = await fetch("/api/department", {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return parseResponse<Department>(response);
    },
  );
  
  export const editDepartment = createAsyncThunk(
    "departments/update",
    async ({ id, name }: { id: string; name: string }) => {
      const response = await fetch("/api/department", {
        ...fetchOptions,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      return parseResponse<Department>(response);
    },
  );
  
    export const removeDepartment = createAsyncThunk(
    "departments/delete",
    async (id: string) => {
      const response = await fetch(`/api/department?id=${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      await parseResponse<Department>(response);
      return id;
    },
  );
  
  const departmentsSlice = createSlice({
    name: "departments",
    initialState,
    reducers: {
      clearDepartmentsError(state) {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchDepartments.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          fetchDepartments.fulfilled,
          (state, action: PayloadAction<PaginatedDepartments>) => {
            state.loading = false;
            state.items = action.payload.data;
            state.meta = action.payload.meta;
          },
        )
        .addCase(fetchDepartments.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message ?? "Failed to load departments";
        })
        .addCase(
          addDepartment.fulfilled,
          (state, action: PayloadAction<Department>) => {
            state.items.unshift(action.payload);
          },
        )
        .addCase(
          editDepartment.fulfilled,
          (state, action: PayloadAction<Department>) => {
            const index = state.items.findIndex(
              (item) => item.id === action.payload.id,
            );
            if (index !== -1) {
              state.items[index] = action.payload;
            }
          },
        )
        .addCase(
          removeDepartment.fulfilled,
          (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(
              (item) => item.id !== action.payload,
            );
          },
        );
    },
  });
  
  export const { clearDepartmentsError } = departmentsSlice.actions;
  export default departmentsSlice.reducer;
  