import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type Category = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ApiError = { error: string };

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = (data as ApiError).error ?? "Request failed";
    throw new Error(message);
  }

  return data as T;
}

type CategoriesState = {
  items: Category[];
  loading: boolean;
  error: string | null;
};

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    return parseResponse<Category[]>(response);
  },
);

export const addCategory = createAsyncThunk(
  "categories/create",
  async (title: string) => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    return parseResponse<Category>(response);
  },
);

export const editCategory = createAsyncThunk(
  "categories/update",
  async ({ id, title }: { id: string; title: string }) => {
    const response = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title }),
    });
    return parseResponse<Category>(response);
  },
);

export const removeCategory = createAsyncThunk(
  "categories/delete",
  async (id: string) => {
    const response = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });
    await parseResponse<{ success: boolean }>(response);
    return id;
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load categories";
      })
      .addCase(
        addCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.items.unshift(action.payload);
        },
      )
      .addCase(
        editCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id,
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        },
      )
      .addCase(
        removeCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((item) => item.id !== action.payload);
        },
      );
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
