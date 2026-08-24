import { configureStore } from "@reduxjs/toolkit";
import assetsReducer, { addAsset } from "@/lib/store/slices/asset-slice";
import authReducer from "@/lib/store/slices/auth-slices";
import departmentsReducer from "@/lib/store/slices/department-slice";
import legendsReducer from "@/lib/store/slices/legend-slice";
import locationsReducer from "@/lib/store/slices/location-slice";
import conditionsReducer from "@/lib/store/slices/condition-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    legends: legendsReducer,
    locations: locationsReducer,
    departments: departmentsReducer,
    conditions: conditionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [addAsset.pending.type],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
