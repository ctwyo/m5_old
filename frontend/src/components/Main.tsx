import { useState, useEffect, useMemo } from "react"; // Добавили useMemo для оптимизации
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store"; // Импортируем AppDispatch
import {
  logout,
  checkAuth,
  fetchCurrentUser,
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
  selectUserError,
} from "../features/users/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CssBaseline,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";
import AppBar from "./AppBar"; // Новый компонент
import NavigationDrawer from "./NavigationDrawer"; // Новый компонент, обновлённый
import {
  fetchEquipment,
  selectEquipment,
  selectEquipmentLoading,
  selectEquipmentError,
} from "../features/equipments/equipmentSlice"; // Загружаем оборудование
import { useWarehouses } from "../features/warehouses/hooks"; // Импортируем хук для складов
import {
  fetchWarehouses,
  selectWarehouses,
  selectWarehouseLoading,
  selectWarehouseError,
} from "../features/warehouses/warehouseSlice"; // Импортируем действия и селекторы для складов

const drawerWidth = 240; // Сохраняем ширину Drawer для совместимости
const MAIN_WAREHOUSE_ID = "main_warehouse_id"; // Фиксированный ID основного склада для инженера

export default function Main() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null
  ); // Состояние для выбранного склада
  const [searchTerm, setSearchTerm] = useState(""); // Состояние для поиска оборудования
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);
  const dispatch = useDispatch<AppDispatch>(); // Явно указываем тип AppDispatch
  const navigate = useNavigate();
  const location = useLocation();
  const {
    warehouses: userWarehouses,
    loading: warehousesLoading,
    error: warehousesError,
  } = useWarehouses(); // Используем отфильтрованные склады
  const equipment = useSelector(selectEquipment); // Данные оборудования
  const equipmentLoading = useSelector(selectEquipmentLoading);
  const equipmentError = useSelector(selectEquipmentError);
  const warehouses = useSelector(selectWarehouses); // Данные складов
  const warehouseLoading = useSelector(selectWarehouseLoading);
  const warehouseError = useSelector(selectWarehouseError);

  // Проверка авторизации и загрузка данных при монтировании
  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated) {
        try {
          await dispatch(checkAuth()).unwrap(); // Проверяем авторизацию при загрузке
        } catch (err) {
          console.error("Ошибка проверки авторизации:", err);
        }
      }
      if (isAuthenticated) {
        dispatch(fetchCurrentUser()); // Загружаем данные текущего пользователя
        dispatch(fetchEquipment());
        dispatch(fetchWarehouses());
      }
    };
    checkAuthentication();
  }, [dispatch, isAuthenticated]);

  // Проверка авторизации (если не авторизован, перенаправляем на /login)
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null; // Рендерим только для авторизованных пользователей

  console.log("User:", user);
  console.log("User Warehouses:", userWarehouses);
  console.log("All Warehouses from Redux:", warehouses);
  console.log("Warehouse Loading:", warehouseLoading);
  console.log("Warehouse Error:", warehouseError);
  console.log("User Loading:", userLoading);
  console.log("User Error:", userError);

  // Оптимизированная фильтрация оборудования с useMemo
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesWarehouse = selectedWarehouseId
        ? item.warehouseId === selectedWarehouseId
        : true; // Если склад не выбран, ищем по всем складам
      const matchesSearch = [
        item.name.toLowerCase(),
        item.serialNumber?.toLowerCase() || "",
      ]
        .join(" ")
        .includes(searchTerm.toLowerCase());
      return matchesWarehouse && matchesSearch;
    });
  }, [equipment, selectedWarehouseId, searchTerm]); // Зависимости для оптимизации

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <CssBaseline />
      <AppBar />
      <NavigationDrawer
        onWarehouseSelect={(warehouseId) => setSelectedWarehouseId(warehouseId)} // Обновили для поддержки null
        selectedWarehouseId={selectedWarehouseId} // Передаём выбранный склад
      />{" "}
      {/* Передаём функцию и выбранный склад */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          mt: "64px",
          p: 3,
          boxSizing: "border-box",
          height: "calc(100vh - 64px)", // Фиксированная высота, как в NavigationDrawer
          overflow: "auto", // Добавляем скролл, если контент превышает высоту
        }}
      >
        <Box sx={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {(warehousesLoading ||
            warehouseLoading ||
            equipmentLoading ||
            userLoading) && <CircularProgress />}
          {warehousesError && <Alert severity="error">{warehousesError}</Alert>}
          {warehouseError && <Alert severity="error">{warehouseError}</Alert>}
          {equipmentError && <Alert severity="error">{equipmentError}</Alert>}
          {userError && <Alert severity="error">{userError}</Alert>}
          {!warehousesLoading &&
            !warehouseLoading &&
            !equipmentLoading &&
            !userLoading &&
            !warehousesError &&
            !warehouseError &&
            !equipmentError &&
            !userError && (
              <>
                <TextField
                  fullWidth
                  margin="none"
                  label="Поиск оборудования (название или серийный номер)"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Мгновенный поиск без delay
                  sx={{ mb: 1, bgcolor: "background.paper", borderRadius: 1 }}
                />
                {selectedWarehouseId ? (
                  <Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: "calc(100vh - 200px)", // Ограничиваем высоту таблицы для скролла
                        overflow: "auto", // Скролл внутри таблицы, если нужно
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Серийный номер</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Количество</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredEquipment.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                {item.serialNumber || "Не указан"}
                              </TableCell>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {filteredEquipment.length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Оборудование не найдено
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: "calc(100vh - 200px)", // Ограничиваем высоту таблицы для скролла
                        overflow: "auto", // Скролл внутри таблицы, если нужно
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Серийный номер</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Количество</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredEquipment.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.serialNumber || ""}</TableCell>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {filteredEquipment.length === 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Оборудование не найдено
                      </Alert>
                    )}
                  </Box>
                )}
              </>
            )}
        </Box>
      </Box>
    </Box>
  );
}
