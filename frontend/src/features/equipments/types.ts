export interface Equipment {
  id: string; // Уникальный идентификатор оборудования
  name: string; // Название оборудования
  serialNumber?: string; // Серийный номер (опционально)
  warehouseId: string; // ID склада, где хранится оборудование
  status: "Доступно" | "Выдано" | "Установлено"; // Статус оборудования
  quantity: number; // Количество единиц оборудования
  createdAt?: string; // Дата создания записи
  updatedAt?: string; // Дата последнего обновления
  shopId?: string; // ID магазина (если установлено)
  engineerId?: string; // ID инженера (если выдано)
}
