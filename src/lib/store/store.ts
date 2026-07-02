import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/store/auth";
import categoriesReducer from "@/lib/store/categories-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
