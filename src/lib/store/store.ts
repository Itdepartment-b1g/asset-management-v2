import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/store/slices/auth-slices";
import legendsReducer from "@/lib/store/slices/legend-slice";
import locationsReducer from "@/lib/store/slices/location-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    legends: legendsReducer,
    locations: locationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
