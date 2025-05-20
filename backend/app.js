// app.js
import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "redis"; // Современный клиент redis для ES6 модулей

dotenv.config();

// Получаем __dirname для ES6 модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Подключение к MongoDB
connectDB();

// Настройка Redis
const redisClient = createClient({
  url: "redis://localhost:6379", // Адрес и порт, где запущен Redis
});

redisClient.on("error", (err) => {
  console.error("Ошибка Redis:", err.message, err.stack);
});

redisClient.on("connect", () => {
  console.log("Подключение к Redis успешно установлено");
});

redisClient.on("end", () => {
  console.log("Соединение с Redis закрыто");
});

// Асинхронное подключение к Redis перед запуском сервера
(async () => {
  try {
    await redisClient.connect(); // Подключение к Redis
    console.log("Redis клиент подключён и готов к работе");
    const pong = await redisClient.ping(); // Проверка подключения
    console.log("Redis ping response:", pong);
  } catch (err) {
    console.error("Ошибка подключения к Redis:", err);
  }
})();

// Middleware
app.use(express.json());

// Настройка CORS для разрешения запросов с фронтенда
app.use(
  cors({
    origin: "http://192.168.0.174:5173", // Разрешаем фронтенд на этом адресе
    credentials: true, // Если используете куки или авторизацию
  })
);

app.use("/api/users", userRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use(errorHandler);

// Если нужен статический фронт (опционально)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Экспортируем redisClient для использования в других модулях
export { redisClient };
