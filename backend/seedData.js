// seedData.js
import mongoose from "mongoose";
import User from "./models/user.js";
import Warehouse from "./models/warehouse.js";
import Equipment from "./models/equipment.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Подключение к MongoDB
const connectDB = async () => {
  try {
    console.log(
      "Попытка подключения к MongoDB с URI:",
      process.env.MONGODB_URI
    );
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB подключен успешно для seed-данных");
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error);
    process.exit(1);
  }
};

// Функция для хеширования пароля с отладкой
const hashPassword = async (password, username) => {
  try {
    console.log(`Хешируем пароль для ${username}:`, password); // Вывод исходного пароля
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    console.log(`Хеш пароля для ${username}:`, hashed); // Вывод хеша
    return hashed;
  } catch (error) {
    console.error(`Ошибка хеширования пароля для ${username}:`, error);
    throw error;
  }
};

// Генерация случайных данных
const generateRandomId = (prefix, length = 6) => {
  return `${prefix}_${Math.random()
    .toString(36)
    .substr(2, length)
    .toUpperCase()}`;
};

const isUnique = async (model, field, value) => {
  const exists = await model.exists({ [field]: value });
  return !exists;
};

const generateUniqueRandomId = async (
  model,
  prefix,
  field = "warehouseId",
  length = 6
) => {
  let id;
  do {
    id = generateRandomId(prefix, length);
  } while (!(await isUnique(model, field, id)));
  return id;
};

const generateRandomName = () => {
  const adjectives = ["Основной", "Второй", "Третий", "Северный", "Южный"];
  const nouns = ["Склад", "Хранилище", "База", "Логистика", "Центр"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`;
};

const generateRandomLocation = () => {
  const cities = [
    "Москва",
    "Санкт-Петербург",
    "Новосибирск",
    "Екатеринбург",
    "Казань",
    "Нижний Новгород",
    "Челябинск",
    "Омск",
    "Самара",
    "Ростов-на-Дону",
  ];
  return cities[Math.floor(Math.random() * cities.length)];
};

const generateRandomEquipmentName = () => {
  const types = ["Компьютер", "Принтер", "Сканер", "Монитор", "Клавиатура"];
  const brands = ["HP", "Dell", "Canon", "Samsung", "Logitech"];
  return `${brands[Math.floor(Math.random() * brands.length)]} ${
    types[Math.floor(Math.random() * types.length)]
  }`;
};

const generateRandomSerialNumber = () => {
  return `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

// Создание тестовых данных
const seedData = async () => {
  try {
    // Очистка существующих данных (опционно)
    console.log("Очистка существующих данных...");
    await User.deleteMany({});
    await Warehouse.deleteMany({});
    await Equipment.deleteMany({});

    // Создание пользователей (оставляем как есть)
    const users = await User.create([
      {
        username: "admin1",
        fullName: "Администратор Один",
        role: "admin",
        email: "admin1@example.com",
        password: await hashPassword("admin123", "admin1"), // Хешируем пароль с отладкой
      },
      {
        username: "storekeeper1",
        fullName: "Иван Иванов",
        role: "storekeeper",
        email: "ivan@example.com",
        password: await hashPassword("store123", "storekeeper1"), // Хешируем пароль с отладкой
      },
      {
        username: "courier1",
        fullName: "Пётр Петров",
        role: "courier",
        email: "petr@example.com",
        password: await hashPassword("courier123", "courier1"), // Хешируем пароль с отладкой
        warehouseId: "wh_001", // Привязываем к первому складу
      },
      {
        username: "engineer1",
        fullName: "Алексей Сидоров",
        role: "engineer",
        email: "alexey@example.com",
        password: await hashPassword("engineer123", "engineer1"), // Хешируем пароль с отладкой
      },
    ]);

    // Вывод username и исходного пароля каждого пользователя (до хеширования)
    console.log("\nИсходные данные пользователей:");
    users.forEach((user) => {
      console.log(
        `Username: ${user.username}, Пароль: ${getOriginalPassword(
          user.username
        )}`
      );
    });

    // Создание 5000 складов
    console.log("Создание 5000 складов...");
    const warehouses = [];
    for (let i = 0; i < 5000; i++) {
      const warehouseId = await generateUniqueRandomId(Warehouse, "wh");
      warehouses.push({
        warehouseId,
        warehouseName: generateRandomName(),
        location: generateRandomLocation(),
        capacity: Math.floor(Math.random() * 1000) + 500, // Случайная вместимость от 500 до 1500
        status: "active",
        managerId: users.find((u) => u.role === "storekeeper")._id, // Привязываем к storekeeper1
      });
    }
    await Warehouse.insertMany(warehouses);
    console.log("5000 складов успешно созданы.");

    // Создание 5000 единиц оборудования
    console.log("Создание 5000 единиц оборудования...");
    const equipment = [];
    for (let i = 0; i < 5000; i++) {
      const warehouse =
        warehouses[Math.floor(Math.random() * warehouses.length)];
      const equipmentId = await generateUniqueRandomId(Equipment, "eq", "id");
      equipment.push({
        id: equipmentId,
        name: generateRandomEquipmentName(),
        serialNumber: generateRandomSerialNumber(),
        warehouseId: warehouse.warehouseId, // Строка, как в модели
        status: ["Доступно", "Выдано", "Установлено"][
          Math.floor(Math.random() * 3)
        ], // Случайный статус
        quantity: Math.floor(Math.random() * 10) + 1, // Количество от 1 до 10
        shopId: Math.random() < 0.3 ? generateRandomId("shop") : null, // Шанс 30%, что shopId есть
        engineerId:
          Math.random() < 0.4
            ? users.find((u) => u.role === "engineer")._id.toString()
            : null, // Шанс 40%, что engineerId есть, преобразуем в строку
      });
    }
    await Equipment.insertMany(equipment);
    console.log("5000 единиц оборудования успешно созданы.");

    console.log("Тестовые данные успешно созданы:");
    console.log(
      "Пользователи:",
      users.map((u) => u.username)
    );
    console.log(
      "Случайный пример складов:",
      warehouses.slice(0, 5).map((w) => w.warehouseName)
    );
    console.log(
      "Случайный пример оборудования:",
      equipment.slice(0, 5).map((e) => e.name)
    );
    process.exit(0);
  } catch (error) {
    console.error("Ошибка создания тестовых данных:", error);
    process.exit(1);
  }
};

// Функция для получения исходного пароля (известного тебе заранее)
const getOriginalPassword = (username) => {
  const passwords = {
    admin1: "admin123",
    storekeeper1: "store123",
    courier1: "courier123",
    engineer1: "engineer123",
  };
  return passwords[username] || "неизвестно";
};

// Выполнение скрипта
(async () => {
  await connectDB();
  await seedData();
})();
