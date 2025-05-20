export interface Warehouse {
  warehouseId: string; // Уникальный идентификатор склада
  warehouseName: string; // Название склада
  location?: string; // Локация склада (например, город, адрес)
  capacity?: number; // Вместимость склада (в единицах оборудования или площади)
  status?: "active" | "inactive" | "maintenance"; // Статус склада
  createdAt?: string; // Дата создания аккаунта (ISO 8601, например, "2023-01-01T12:00:00Z")
  updatedAt?: string; // Дата последнего обновления (ISO 8601)
  managerId?: string; // ID менеджера или ответственного (связь с User)
  equipmentCount?: number; // Количество оборудования на складе
  equipments?: any[]; // Список оборудования на складе
}
