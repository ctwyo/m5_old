// controllers/warehouseController.js
import Warehouse from "../models/warehouse.js";
import { redisClient } from "../app.js"; // Импортируем redisClient

export const createWarehouse = async (req, res) => {
  const { warehouseId, warehouseName, location, capacity, status, managerId } =
    req.body;

  try {
    const warehouse = await Warehouse.create({
      warehouseId, // Уникальный идентификатор склада как строка
      warehouseName,
      location,
      capacity,
      status: status || "active", // Значение по умолчанию
      managerId, // Ссылка на пользователя (ObjectId или строка, в зависимости от модели)
    });

    // Очищаем кэш после создания нового склада
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      await redisClient.del("warehouses:*"); // Удаляем все кэшированные записи складов
    } catch (redisError) {
      console.error("Ошибка Redis при очистке кэша складов:", redisError);
    }

    res.status(201).json(warehouse);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка создания склада", error: error.message });
  }
};

export const getWarehouses = async (req, res) => {
  const { search, warehouseId, page, limit, sort } = req.query; // Добавляем warehouseId для фильтрации
  const cacheKey = `warehouses:${JSON.stringify({
    search,
    warehouseId,
    page,
    limit,
    sort,
  })}`;

  try {
    // Проверяем кэш с обработкой ошибок Redis
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.error("Ошибка Redis при чтении кэша складов:", redisError);
      // Продолжаем с MongoDB, если Redis недоступен
    }

    let query = { status: "active" };
    if (warehouseId) query = { ...query, warehouseId }; // Фильтрация по warehouseId
    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), "i"); // Экранируем специальные символы
      query = {
        ...query,
        $or: [
          { warehouseName: searchRegex },
          { warehouseId: searchRegex },
          { location: searchRegex },
        ],
      };
    }

    const pageNum = parseInt(page) || 0; // Нумерация страниц начинается с 0
    const limitNum = parseInt(limit) || 100;
    const skip = pageNum * limitNum;

    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOptions = { [field]: order === "desc" ? -1 : 1 };
    } else {
      sortOptions = { warehouseName: 1 }; // Сортировка по имени склада по умолчанию
    }

    const warehouses = await Warehouse.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort(sortOptions)
      .select(
        "warehouseId warehouseName location capacity equipmentCount status managerId"
      );

    const total = await Warehouse.countDocuments(query);

    const response = {
      data: warehouses, // Возвращаем массив складов в поле data
      total,
      page: pageNum,
      limit: limitNum,
    };

    // Сохраняем в кэш с обработкой ошибок
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    } catch (redisError) {
      console.error("Ошибка Redis при записи кэша складов:", redisError);
    }

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка получения складов", error: error.message });
  }
};

export const getWarehouseById = async (req, res) => {
  const { id } = req.params; // Получаем warehouseId или _id из URL

  try {
    // Проверяем кэш для конкретного склада
    const cacheKey = `warehouse:${id}`;
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.error("Ошибка Redis при чтении кэша склада:", redisError);
    }

    // Ищем склад по warehouseId (строка) или _id (ObjectId), в зависимости от модели
    const warehouse = await Warehouse.findOne({ warehouseId: id })
      .select(
        "warehouseId warehouseName location capacity equipmentCount status managerId"
      )
      .lean(); // Используем .lean() для более быстрого ответа

    if (!warehouse) {
      return res.status(404).json({ message: "Склад не найден" });
    }

    // Сохраняем в кэш с обработкой ошибок
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(warehouse));
    } catch (redisError) {
      console.error("Ошибка Redis при записи кэша склада:", redisError);
    }

    res.json(warehouse);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка получения склада", error: error.message });
  }
};

// Функция для экранирования специальных символов в регулярных выражениях
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
