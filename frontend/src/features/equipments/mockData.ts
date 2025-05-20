// src/mocks/MockData.ts
import { Warehouse } from "../warehouses/types";
import { Equipment } from "./types"; // Убедитесь, что путь правильный

export const mockWarehouses: Warehouse[] = generateRandomWarehouses(50);
export const mockEquipment: Equipment[] = generateRandomEquipment(50);

function generateRandomWarehouses(count: number): Warehouse[] {
  const locations = [
    "Москва",
    "Санкт-Петербург",
    "Казань",
    "Новосибирск",
    "Екатеринбург",
    "Нижний Новгород",
    "Челябинск",
    "Самара",
    "Ростов-на-Дону",
    "Уфа",
  ];

  const statuses = ["active", "inactive", "maintenance"];
  const warehouseNames = [
    "Основной склад",
    "Склад оборудования",
    "Логистический центр",
    "Технический склад",
    "Резервный склад",
  ];

  const warehouses: Warehouse[] = [
    // Основной склад для инженера
    {
      warehouseId: "main_warehouse_id",
      warehouseName: "Основной склад",
      location: "Москва",
      capacity: 1000,
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      managerId: "user_1",
      equipmentCount: 500,
      lastInventoryDate: new Date().toISOString(),
    },
  ];

  for (let i = 1; i <= count - 1; i++) {
    warehouses.push({
      warehouseId: `wh_${i.toString().padStart(3, "0")}`,
      warehouseName: `${
        warehouseNames[Math.floor(Math.random() * warehouseNames.length)]
      } #${i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      capacity: Math.floor(Math.random() * 1000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      managerId: `user_${Math.floor(Math.random() * 10) + 1}`,
      equipmentCount: Math.floor(Math.random() * 500),
      lastInventoryDate: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
      ).toISOString(),
    });
  }

  return warehouses;
}

function generateRandomEquipment(count: number): Equipment[] {
  const equipmentNames = [
    "Компьютер",
    "Принтер",
    "Сканер",
    "Монитор",
    "Роутер",
  ];
  const statuses = ["Доступно", "Выдано", "Установлено"];
  const warehouseIds = mockWarehouses.map((w) => w.warehouseId);

  const equipment: Equipment[] = [];

  for (let i = 1; i <= count; i++) {
    equipment.push({
      id: `eq_${i.toString().padStart(3, "0")}`,
      name: equipmentNames[Math.floor(Math.random() * equipmentNames.length)],
      serialNumber:
        Math.random() > 0.3
          ? `SN${Math.floor(Math.random() * 1000000).toString()}`
          : undefined, // 70% шанс наличия серийного номера
      warehouseId:
        warehouseIds[Math.floor(Math.random() * warehouseIds.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      quantity: Math.floor(Math.random() * 10) + 1, // От 1 до 10 единиц
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return equipment;
}
