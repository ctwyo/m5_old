// models/warehouse.js
import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  warehouseId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Индекс для быстрого поиска по warehouseId
  },
  warehouseName: {
    type: String,
    required: true,
    index: true, // Индекс для поиска по названию склада (например, в поиске)
  },
  location: {
    type: String,
    required: true,
    index: true, // Индекс для фильтрации или поиска по местоположению
  },
  capacity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active",
    index: true, // Индекс для фильтрации по статусу
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  managerId: {
    type: String,
    ref: "User",
    default: null,
    index: true, // Индекс для быстрого поиска по менеджеру
  },
  equipmentCount: {
    type: Number,
    default: 0,
  },
  lastInventoryDate: {
    type: Date,
    default: Date.now,
  },
});

// Создание индексов
warehouseSchema.index({ warehouseId: 1, warehouseName: 1 }); // Составной индекс для ускорения сложных запросов

export default mongoose.model("Warehouse", warehouseSchema);
