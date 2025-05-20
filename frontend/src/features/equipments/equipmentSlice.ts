import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Equipment, EquipmentState } from "./types";

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  selectedEquipment: Equipment | null;
  total: number;
}

const initialState: EquipmentState = {
  equipment: [],
  loading: false,
  error: null,
  selectedEquipment: null,
  total: 0,
};

export const fetchEquipment = createAsyncThunk<
  { data: Equipment[]; total: number },
  {
    search?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  },
  { rejectValue: string }
>(
  "equipment/fetchEquipment",
  async (
    { search, warehouseId, page = 0, limit = 100, sort },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен не найден");
      }

      let url = `http://localhost:3000/api/equipment?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (warehouseId) url += `&warehouseId=${encodeURIComponent(warehouseId)}`;
      if (sort) url += `&sort=${encodeURIComponent(sort)}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Ошибка загрузки оборудования: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return { data: data.data as Equipment[], total: data.total };
    } catch (error) {
      return rejectWithValue(
        error.message || "Не удалось загрузить оборудование"
      );
    }
  }
);

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    setSelectedEquipment: (state, action: PayloadAction<Equipment | null>) => {
      state.selectedEquipment = action.payload;
    },
    updateEquipmentStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: "Доступно" | "Выдано" | "Установлено";
      }>
    ) => {
      const equipment = state.equipment.find((e) => e.id === action.payload.id);
      if (equipment) {
        equipment.status = action.payload.status;
        equipment.updatedAt = new Date().toISOString();
      }
    },
    issueEquipment: (
      state,
      action: PayloadAction<{ id: string; engineerId: string }>
    ) => {
      const equipment = state.equipment.find((e) => e.id === action.payload.id);
      if (equipment) {
        equipment.status = "Выдано";
        equipment.engineerId = action.payload.engineerId;
        equipment.updatedAt = new Date().toISOString();
      }
    },
    installEquipment: (
      state,
      action: PayloadAction<{ id: string; shopId: string }>
    ) => {
      const equipment = state.equipment.find((e) => e.id === action.payload.id);
      if (equipment) {
        equipment.status = "Установлено";
        equipment.shopId = action.payload.shopId;
        equipment.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload.data;
        state.total = action.payload.total;
        if (process.env.NODE_ENV === "development") {
          console.log("Оборудование успешно загружено:", action.payload.data);
        }
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка загрузки оборудования";
        if (process.env.NODE_ENV === "development") {
          console.log("Ошибка загрузки оборудования:", state.error);
        }
      });
  },
});

export const {
  setSelectedEquipment,
  updateEquipmentStatus,
  issueEquipment,
  installEquipment,
} = equipmentSlice.actions;
export default equipmentSlice.reducer;
export const selectEquipment = createSelector(
  (state) => state.equipment.equipment,
  (equipment) => equipment
);
export const selectEquipmentLoading = (state: { equipment: EquipmentState }) =>
  state.equipment.loading;
export const selectEquipmentError = (state: { equipment: EquipmentState }) =>
  state.equipment.error;
export const selectSelectedEquipment = (state: { equipment: EquipmentState }) =>
  state.equipment.selectedEquipment;
export const selectEquipmentTotal = (state: { equipment: EquipmentState }) =>
  state.equipment.total;
