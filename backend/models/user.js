import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true, // Индекс для быстрого поиска по имени пользователя
  },
  fullName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "storekeeper", "courier", "engineer"],
    required: true,
    index: true, // Индекс для фильтрации по роли (например, для авторизации)
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // Индекс для быстрого поиска по email
  },
  password: {
    type: String,
    required: true,
  },
  warehouseId: {
    type: String,
    default: null,
    ref: "Warehouse", // Ссылка на склад для курьеров
    index: true, // Индекс для быстрого поиска по warehouseId
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Хеширование пароля перед сохранением
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Проверка пароля
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Создание индексов
userSchema.index({ username: 1, role: 1 }); // Составной индекс для ускорения сложных запросов

export default mongoose.model("User", userSchema);
