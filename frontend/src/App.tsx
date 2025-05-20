// App.tsx
import "./App.css";
import { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "./redux/store";
import {
  checkAuth,
  fetchCurrentUser,
  selectIsAuthenticated,
  selectUser,
  selectUserLoading,
} from "./features/users/userSlice";
import {
  fetchEquipment,
  selectEquipment,
  selectEquipmentLoading,
  selectEquipmentError,
} from "./features/equipments/equipmentSlice";
import { Box, CircularProgress } from "@mui/material";
import { fetchWarehouses } from "./features/warehouses/warehouseSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const loading = useSelector(selectUserLoading);

  // Проверяем авторизацию и загружаем данные только один раз
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const result = await dispatch(checkAuth()).unwrap();
        if (!mounted) return; // Проверяем, не размонтирован ли компонент

        if (result) {
          await dispatch(fetchCurrentUser()).unwrap();
          await dispatch(
            fetchWarehouses({ page: 0, limit: 100, sort: "warehouseName:asc" })
          ).unwrap();
          await dispatch(fetchEquipment()).unwrap();
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      }
    };

    if (mounted && !isAuthenticated) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [dispatch, isAuthenticated]); // Оставляем только необходимые зависимости

  // Перенаправление на основе роли пользователя и состояния загрузки
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (user?.role === "storekeeper") {
          navigate("/warehouse", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, user?.role, navigate, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const routing = useRoutes(routes);

  return <>{routing}</>;
}

export default App;
