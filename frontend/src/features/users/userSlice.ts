import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState } from "./types"; // Убедитесь, что путь правильный

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

const initialState: UserState = {
  user: null, // Начальное состояние — пользователь не авторизован
  isAuthenticated: false, // Пользователь не авторизован по умолчанию
  loading: false,
  error: null,
};

// Асинхронное действие для логина через сервер
export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("user/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка авторизации: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Сохраняем токен в localStorage для использования в других запросах
    localStorage.setItem("token", data.token);
    return data; // Ожидаем { user: User, token: string }
  } catch (error) {
    return rejectWithValue(error.message || "Ошибка авторизации");
  }
});

// Асинхронное действие для получения текущего пользователя
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Токен не найден");
    }

    const response = await fetch("http://localhost:3000/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ошибка получения пользователя: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data; // Ожидаем объект User
  } catch (error) {
    return rejectWithValue(error.message || "Ошибка получения пользователя");
  }
});

// Асинхронное действие для проверки авторизации при загрузке
export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен не найден");
      }

      const response = await fetch("http://localhost:3000/api/users/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token"); // Удаляем неверный токен
        throw new Error(`Ошибка проверки авторизации: ${response.status}`);
      }

      const data = await response.json();
      return data; // Ожидаем объект User
    } catch (error) {
      return rejectWithValue(error.message || "Ошибка проверки авторизации");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Удаляем токен из localStorage при выходе
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка авторизации";
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Ошибка получения пользователя";
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Ошибка проверки авторизации";
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) =>
  state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) =>
  state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
