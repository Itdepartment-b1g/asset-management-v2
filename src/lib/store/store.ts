import { configureStore } from "@reduxjs/toolkit";
import assetsReducer, { addAsset, editAsset } from "@/lib/store/slices/asset-slice";
import authReducer from "@/lib/store/slices/auth-slices";
import departmentsReducer from "@/lib/store/slices/department-slice";
import holdersReducer from "@/lib/store/slices/holder-slice";
import legendsReducer from "@/lib/store/slices/legend-slice";
import locationsReducer from "@/lib/store/slices/location-slice";
import conditionsReducer from "@/lib/store/slices/condition-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    legends: legendsReducer,
    locations: locationsReducer,
    holders: holdersReducer,
    departments: departmentsReducer,
    conditions: conditionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [addAsset.pending.type, editAsset.pending.type],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
