import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/store/auth";
import legendsReducer from "@/lib/store/legend-slice";
import locationsReducer from "@/lib/store/location-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    legends: legendsReducer,
    locations: locationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
