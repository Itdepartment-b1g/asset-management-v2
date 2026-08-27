import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { ManagedUserRole } from "@/components/lib/user-roles";
import type {
  UserDepartment,
  UserItem,
} from "@/components/users/table-views/user-table-view";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedUsers = {
  data: UserItem[];
  meta: PaginationMeta;
};

export type FetchUsersInput = {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string | null;
  bypassCache?: boolean;
};

export type CreateUserInput = {
  full_name: string;
  email: string;
  password: string;
  role: ManagedUserRole;
  department_id: string;
};

export type UpdateUserInput = {
  id: string;
  full_name?: string;
  email?: string;
  role?: ManagedUserRole;
  department_id?: string;
  password?: string;
};

type ApiError = { error: string };

const fetchOptions: RequestInit = {
  credentials: "include",
};

const userPageCache = new Map<string, PaginatedUsers>();
const USER_CACHE_VERSION = "v1";

export function clearUserPageCache() {
  userPageCache.clear();
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

type UsersState = {
  items: UserItem[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (input?: FetchUsersInput) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const search = input?.search?.trim() ?? "";
    const department_id = input?.department_id?.trim() || "";
    const bypassCache = input?.bypassCache ?? false;

    const cacheKey = `/api/auth/users|${USER_CACHE_VERSION}|page=${page}|limit=${limit}|search=${search}|department=${department_id}`;

    if (!bypassCache) {
      const cached = userPageCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) {
      params.set("search", search);
    }
    if (department_id) {
      params.set("department_id", department_id);
    }

    const response = await fetch(`/api/auth/users?${params.toString()}`, {
      ...fetchOptions,
      cache: "no-store",
    });
    const payload = await parseResponse<PaginatedUsers>(response);
    userPageCache.set(cacheKey, payload);
    return payload;
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (input: CreateUserInput) => {
    const response = await fetch("/api/auth/create-user", {
      ...fetchOptions,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseResponse<UserItem>(response);
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async (input: UpdateUserInput) => {
    const response = await fetch("/api/auth/update-user", {
      ...fetchOptions,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseResponse<UserItem>(response);
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<PaginatedUsers>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load users";
      })
      .addCase(createUser.pending, (state) => {
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        clearUserPageCache();
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to add user";
      })
      .addCase(updateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<UserItem>) => {
          clearUserPageCache();
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
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update user";
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export type { UserDepartment, UserItem };
export default usersSlice.reducer;
