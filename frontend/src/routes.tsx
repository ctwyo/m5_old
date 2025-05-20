import { Outlet, RouteObject } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import Main from "./components/Main"; // Обновлённый импорт
import Login from "./components/Login";
import { Navigate } from "react-router-dom";
import Warehouse from "./components/Warehouse";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/warehouse",
    element: (
      <ProtectedRoute>
        <Warehouse />
      </ProtectedRoute>
    ),
  },

  {
    path: "forgot-password",
    element: <div>Страница восстановления пароля</div>, // Заглушка
  },
  {
    path: "*",
    element: <div>404 - Страница не найдена</div>,
  },
];
