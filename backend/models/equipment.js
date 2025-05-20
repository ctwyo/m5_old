import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true, // Индекс для быстрого поиска по ID оборудования
  },
  name: {
    type: String,
    required: true,
    index: true, // Индекс для поиска по названию (например, в поиске)
  },
  serialNumber: {
    type: String,
    default: null,
    index: true, // Индекс для поиска по серийному номеру (если указан)
  },
  warehouseId: {
    type: String, // Убираем ref, если это не ObjectId
    required: true,
    index: true, // Индекс для быстрого поиска по складу
  },
  status: {
    type: String,
    enum: ["Доступно", "Выдано", "Установлено"],
    default: "Доступно",
    index: true, // Индекс для фильтрации по статусу
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  shopId: {
    type: String,
    default: null,
    index: true, // Индекс для фильтрации по магазину (если оборудование установлено)
  },
  engineerId: {
    type: String, // Убираем ref, если это не ObjectId
    ref: "User", // Оставляем только для информации, но тип — String
    default: null,
    index: true, // Индекс для фильтрации по инженеру (если оборудование выдано)
  },
});

// Создание индексов
equipmentSchema.index({ warehouseId: 1, name: 1, status: 1 }); // Составной индекс для ускорения запросов

export default mongoose.model("Equipment", equipmentSchema);
