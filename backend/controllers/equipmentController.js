// controllers/equipmentController.js
import Equipment from "../models/equipment.js";
import Warehouse from "../models/warehouse.js";
import { redisClient } from "../app.js"; // Импортируем redisClient из app.js

export const createEquipment = async (req, res) => {
  const {
    id,
    name,
    serialNumber,
    warehouseId,
    status,
    quantity,
    shopId,
    engineerId,
  } = req.body;

  try {
    const equipment = await Equipment.create({
      id,
      name,
      serialNumber,
      warehouseId, // Строка
      status,
      quantity,
      shopId,
      engineerId, // Строка
    });

    // Обновляем equipmentCount в Warehouse, используя warehouseId как строку
    await Warehouse.findOneAndUpdate(
      { warehouseId }, // Ищем по warehouseId как по строке
      { $inc: { equipmentCount: 1 } },
      { upsert: true, new: true } // Добавляем опции upsert, если склада нет
    );

    // Очищаем кэш после создания нового оборудования
    await redisClient.del("equipment:*"); // Удаляем все кэшированные записи оборудования

    res.status(201).json(equipment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка создания оборудования", error: error.message });
  }
};

export const getEquipment = async (req, res) => {
  const { search, warehouseId, page, limit, sort } = req.query;
  const cacheKey = `equipment:${JSON.stringify({
    search,
    warehouseId,
    page,
    limit,
    sort,
  })}`;

  try {
    // Проверяем кэш
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let query = {};
    if (warehouseId) query = { ...query, warehouseId };
    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), "i"); // Экранируем специальные символы для RegExp
      query = {
        ...query,
        $or: [{ name: searchRegex }, { serialNumber: searchRegex }],
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
      sortOptions = { name: 1 }; // Сортировка по имени по умолчанию
    }

    const equipment = await Equipment.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort(sortOptions)
      .select(
        "id name serialNumber warehouseId status quantity shopId engineerId updatedAt"
      );

    const total = await Equipment.countDocuments(query);

    const response = {
      data: equipment,
      total,
      page: pageNum,
      limit: limitNum,
    };

    // Сохраняем в кэш на 300 секунд (5 минут)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка получения оборудования", error: error.message });
  }
};

export const updateEquipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, engineerId, shopId } = req.body;

  try {
    const equipment = await Equipment.findOne({ id });
    if (!equipment)
      return res.status(404).json({ message: "Оборудование не найдено" });

    equipment.status = status || equipment.status;
    equipment.engineerId = engineerId || equipment.engineerId; // Строка
    equipment.shopId = shopId || equipment.shopId; // Строка
    equipment.updatedAt = new Date();
    await equipment.save();

    // Очищаем кэш после обновления
    await redisClient.del("equipment:*"); // Удаляем все кэшированные записи оборудования

    res.json(equipment);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка обновления оборудования",
      error: error.message,
    });
  }
};

// Функция для экранирования специальных символов в регулярных выражениях
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
