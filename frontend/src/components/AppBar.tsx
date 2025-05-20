import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout, selectUserLoading } from "../features/users/userSlice"; // Убедитесь, что путь правильный
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Иконка для профиля/выхода

const drawerWidth = 240;

export default function AppBar() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const loading = useSelector(selectUserLoading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    // Логика для мобильного Drawer будет в NavigationDrawer
    console.log("Drawer toggle clicked");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <MuiAppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "64px", // Высота AppBar, чтобы индикатор загрузки был по центру
          }}
        >
          <CircularProgress />
        </Box>
      </MuiAppBar>
    );
  }

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: "100%",
      }}
    >
      <Box sx={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <Toolbar
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // Выравнивание элементов по центру по вертикали
            padding: "0 16px", // Фиксированные отступы для Toolbar
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }} // Уменьшаем отступ для компактности
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 1, // Уменьшаем отступ для компактности
                fontSize: { xs: "1rem", sm: "1.5rem" }, // Уменьшаем текст на мобильных
                flexShrink: 0, // Предотвращаем сжатие текста
              }}
            >
              М5
              {isAuthenticated && user && ` | ${user.fullName}`}
            </Typography>
          </Box>
          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              variant="contained"
              color="error"
              sx={{
                ml: "auto", // Сдвигаем кнопку вправо
                width: "auto", // Автоматическая ширина по содержимому
                minWidth: "100px", // Минимальная ширина
                display: "flex", // Выравниваем содержимое
                alignItems: "center",
                gap: 1, // Расстояние между иконкой и текстом
              }}
            >
              <AccountCircleIcon />
              Выйти
            </Button>
          )}
        </Toolbar>
      </Box>
    </MuiAppBar>
  );
}
