// src/mocks/mockUsers.ts
import { User } from "./types"; // Убедитесь, что путь правильный

export const mockUsers: User[] = [
  {
    id: "1",
    username: "warehouse1",
    role: "storekeeper",
    fullName: "Иван Иванов",
    email: "ivan@example.com",
    warehouseId: "01",
    warehouseName: "Основной склад",
  },
  {
    id: "2",
    username: "engineer1",
    role: "engineer",
    fullName: "Пётр Петров",
    email: "petr@example.com",
    warehouseId: "02",
    warehouseName: "Склад Пётр Петров",
  },
  {
    id: "3",
    username: "admin",
    role: "admin",
    fullName: "Анна Сидорова",
    email: "anna@example.com",
  },
  {
    id: "4",
    username: "masha",
    role: "admin",
    fullName: "Мария Михайловна",
    email: "anna@example.com",
  },
  {
    id: "5",
    username: "kylich",
    role: "courier",
    fullName: "Кулич Иван",
    email: "kylich@example.com",
    warehouseId: "wh_004",
    warehouseName: "Склад Кулич Иван",
  },
];
