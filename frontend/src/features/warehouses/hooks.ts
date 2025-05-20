// src/features/warehouses/hooks.ts
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Warehouse } from "./types";
import {
  selectWarehouses,
  selectWarehouseLoading,
  selectWarehouseError,
  selectWarehouseTotal,
} from "./warehouseSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { fetchWarehouses } from "./warehouseSlice";
import debounce from "lodash/debounce";
import { useEffect } from "react";

export const useWarehouses = (
  params: {
    search?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  } = {}
) => {
  const dispatch = useDispatch<AppDispatch>();
  const warehouses = useSelector(selectWarehouses);
  const total = useSelector(selectWarehouseTotal);
  const loading = useSelector(selectWarehouseLoading);
  const error = useSelector(selectWarehouseError);
  const user = useSelector((state: RootState) => state.user.user);

  // Debounced функция для отправки запроса
  const debouncedFetchWarehouses = debounce(
    (newParams) => dispatch(fetchWarehouses(newParams)),
    200 // Задержка 300 мс
  );

  // Загружаем склады при изменении параметров
  useEffect(() => {
    debouncedFetchWarehouses(params);

    return () => {
      debouncedFetchWarehouses.cancel(); // Очистка debounce при размонтировании
    };
  }, [
    dispatch,
    params.search,
    params.warehouseId,
    params.page,
    params.limit,
    params.sort,
  ]);

  // Функция фильтрации складов на основе роли и warehouseId пользователя
  const getUserWarehouses = (
    warehouses: Warehouse[],
    userRole?: string,
    userWarehouseId?: string
  ): Warehouse[] => {
    if (!userRole) return [];

    switch (userRole) {
      case "storekeeper":
        return warehouses; // Все склады для кладовщика
      case "courier":
        return userWarehouseId
          ? warehouses.filter((w) => w.warehouseId === userWarehouseId)
          : []; // Только свой склад для курьера
      case "engineer":
        return warehouses.filter((w) => w.warehouseId === "main_warehouse_id"); // Только основной склад для инженера
      case "admin":
        return warehouses; // Все склады для админа
      default:
        return [];
    }
  };

  const userWarehouses = getUserWarehouses(
    warehouses,
    user?.role,
    user?.warehouseId
  );

  return { warehouses: userWarehouses, total, loading, error };
};
