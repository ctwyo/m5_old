import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import warehouseReducer from "../features/warehouses/warehouseSlice";
import equipmentReducer from "../features/equipments/equipmentSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    warehouse: warehouseReducer,
    equipment: equipmentReducer,
  },
});

// Опционально: добавьте тип для совместимости с TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
