import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  login,
  logout,
  selectUser,
  selectIsAuthenticated,
  selectUserError,
  selectUserLoading,
} from "../features/users/userSlice";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  CircularProgress,
  AppBar,
} from "@mui/material";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectUserError);
  const navigate = useNavigate();
  const loading = useSelector(selectUserLoading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(credentials)).unwrap(); // Ожидаем результат и обрабатываем ошибки
      // navigate("/");
    } catch (err) {
      console.error("Ошибка входа:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (loading) {
    return (
      <AppBar
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
      </AppBar>
    );
  }

  if (isAuthenticated && user) {
    // navigate("/");
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Занимает всю высоту viewport
        bgcolor: "background.default", // Фоновый цвет по умолчанию (можно настроить)
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          maxWidth: 300,
          width: "100%",
          p: 3,
          bgcolor: "white", // Белый фон для формы
          borderRadius: 2,
          boxShadow: 1, // Лёгкая тень для выделения
          textAlign: "center", // Центрирование текста внутри формы
        }}
      >
        <Typography variant="h5" gutterBottom>
          Вход
        </Typography>
        <TextField
          fullWidth
          label="Имя пользователя"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Пароль"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: "100%" }}
        >
          Войти
        </Button>
      </Box>
    </Box>
  );
}
