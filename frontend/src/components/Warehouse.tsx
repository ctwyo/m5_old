import { useState, useEffect } from "react"; // Убрали useMemo, так как он теперь в EquipmentTable
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store"; // Импортируем AppDispatch
import {
  logout,
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
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";
import AppBar from "./AppBar"; // Новый компонент
import NavigationDrawer from "./NavigationDrawer"; // Новый компонент, обновлённый
import EquipmentTable from "./EquipmentTable"; // Импортируем новый компонент
import { useWarehouses } from "../features/warehouses/hooks"; // Импортируем хук для складов
import {
  selectWarehouses,
  selectWarehouseLoading,
  selectWarehouseError,
} from "../features/warehouses/warehouseSlice"; // Импортируем селекторы для складов

const drawerWidth = 240; // Сохраняем ширину Drawer для совместимости
const MAIN_WAREHOUSE_ID = "main_warehouse_id"; // Фиксированный ID основного склада для инженера

export default function Warehouse() {
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
  const warehouses = useSelector(selectWarehouses); // Данные складов
  const warehouseLoading = useSelector(selectWarehouseLoading);
  const warehouseError = useSelector(selectWarehouseError);

  // Перенаправление на /login, если не авторизован (только для проверки)
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null; // Рендерим только для авторизованных пользователей

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
            /* equipmentLoading || */ // Убрали, так как теперь в EquipmentTable
            userLoading) && <CircularProgress />}
          {warehousesError && <Alert severity="error">{warehousesError}</Alert>}
          {warehouseError && <Alert severity="error">{warehouseError}</Alert>}
          {/* {equipmentError && <Alert severity="error">{equipmentError}</Alert>} */}{" "}
          {/* Убрали, так как теперь в EquipmentTable */}
          {userError && <Alert severity="error">{userError}</Alert>}
          {!warehousesLoading &&
            !warehouseLoading &&
            /* !equipmentLoading && */ // Убрали, так как теперь в EquipmentTable
            !userLoading &&
            !warehousesError &&
            !warehouseError &&
            /* !equipmentError && */ // Убрали, так как теперь в EquipmentTable
            !userError && (
              <>
                <TextField
                  fullWidth
                  margin="none"
                  label="Поиск оборудования (название или серийный номер)"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)} // Используем handleSearchChange
                  sx={{ mb: 1, bgcolor: "background.paper", borderRadius: 1 }}
                />
                <EquipmentTable
                  selectedWarehouseId={selectedWarehouseId}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </>
            )}
        </Box>
      </Box>
    </Box>
  );
}
