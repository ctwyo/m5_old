export type User = {
  id: string; // Уникальный идентификатор пользователя
  username: string; // Логин пользователя
  fullName: string; // Полное имя
  role: "admin" | "storekeeper" | "engineer" | "courier"; // Роль пользователя
  email: string; // Почта
  createdAt?: string; // Дата создания аккаунта
  updatedAt?: string; // Дата последнего обновления
  warehouseId?: string;
  warehouseName?: string;
};

export type UserState = {
  user: User | null; // Текущий пользователь (null, если не авторизован)
  isAuthenticated: boolean; // Флаг авторизации
  loading: boolean; // Флаг загрузки данных
  error: string | null; // Ошибка при аутентификации
  sessionId?: string | null;
};
