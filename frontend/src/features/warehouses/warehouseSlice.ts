// features/warehouses/warehouseSlice.ts
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Warehouse } from "./types";

interface WarehouseState {
  warehouses: Warehouse[]; // Только массив складов
  loading: boolean;
  error: string | null;
  selectedWarehouse?: Warehouse | null;
  total: number; // Добавляем общее количество для пагинации
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  error: null,
  selectedWarehouse: null,
  total: 0,
};

// Асинхронное действие для получения складов из бэкенда
export const fetchWarehouses = createAsyncThunk<
  { data: Warehouse[]; total: number },
  {
    search?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  },
  { rejectValue: string }
>(
  "warehouse/fetchWarehouses",
  async (
    { search, warehouseId, page = 0, limit = 100, sort },
    { rejectWithValue }
  ) => {
    try {
      console.log("Отправка запроса на http://localhost:3000/api/warehouses");
      let url = `http://localhost:3000/api/warehouses?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (warehouseId) url += `&warehouseId=${encodeURIComponent(warehouseId)}`;
      if (sort) url += `&sort=${encodeURIComponent(sort)}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      console.log("Ответ от сервера:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка HTTP:", response.status, errorText);
        throw new Error(
          `Не удалось загрузить склады: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Полученные данные складов:", data);
      return { data: data.data as Warehouse[], total: data.total }; // Извлекаем массив data и total
    } catch (error) {
      console.error("Ошибка при загрузке складов:", error);
      return rejectWithValue(error.message || "Ошибка загрузки складов");
    }
  }
);

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setSelectedWarehouse: (state, action: PayloadAction<Warehouse | null>) => {
      state.selectedWarehouse = action.payload;
    },
    updateWarehouseStatus: (
      state,
      action: PayloadAction<{
        warehouseId: string;
        status: "active" | "inactive" | "maintenance";
      }>
    ) => {
      const warehouse = state.warehouses.find(
        (w) => w.warehouseId === action.payload.warehouseId
      );
      if (warehouse) {
        warehouse.status = action.payload.status;
        warehouse.updatedAt = new Date().toISOString();
      }
    },
    updateWarehouse: (state, action: PayloadAction<Warehouse>) => {
      const index = state.warehouses.findIndex(
        (w) => w.warehouseId === action.payload.warehouseId
      );
      if (index !== -1) {
        state.warehouses[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Загрузка складов началась...");
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.data; // Сохраняем только массив data
        state.total = action.payload.total; // Сохраняем общее количество
        console.log("Склады успешно загружены:", action.payload.data);
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка загрузки складов";
        console.error("Ошибка загрузки складов:", action.payload);
      });
  },
});

export const { setSelectedWarehouse, updateWarehouseStatus, updateWarehouse } =
  warehouseSlice.actions;
export default warehouseSlice.reducer;
export const selectWarehouses = createSelector(
  (state) => state.warehouse.warehouses,
  (warehouses) => warehouses
);
export const selectWarehouseLoading = (state: { warehouse: WarehouseState }) =>
  state.warehouse.loading;
export const selectWarehouseError = (state: { warehouse: WarehouseState }) =>
  state.warehouse.error;
export const selectSelectedWarehouse = (state: { warehouse: WarehouseState }) =>
  state.warehouse.selectedWarehouse;
export const selectWarehouseTotal = (state: { warehouse: WarehouseState }) =>
  state.warehouse.total;
