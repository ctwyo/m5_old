// NavigationDrawer.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../features/users/userSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  Drawer as MuiDrawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Box,
  Toolbar,
  useMediaQuery,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import { useWarehouses } from "../features/warehouses/hooks";
import debounce from "lodash/debounce"; // Импортируем debounce для оптимизации

const drawerWidth = 240;
const MAIN_WAREHOUSE_ID = "main_warehouse_id";

interface NavigationDrawerProps {
  onWarehouseSelect: (warehouseId: string | null) => void;
  selectedWarehouseId?: string | null;
}

export default function NavigationDrawer({
  onWarehouseSelect,
  selectedWarehouseId,
}: NavigationDrawerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dispatchWarehouses = useDispatch(); // Отдельный dispatch для складов

  // Debounce для поиска складов
  const debouncedFetchWarehouses = debounce(
    (newSearch) =>
      dispatchWarehouses(
        useWarehouses({
          search: newSearch,
          page: 0,
          limit: 100,
          sort: "warehouseName:asc",
        })
      ),
    300
  );

  const { warehouses, loading, error } = useWarehouses({
    search: searchTerm,
    page: 0,
    limit: 100,
    sort: "warehouseName:asc",
  });

  // Обновляем поиск с debounce
  useEffect(() => {
    debouncedFetchWarehouses(searchTerm);

    return () => {
      debouncedFetchWarehouses.cancel();
    };
  }, [searchTerm, dispatchWarehouses]);

  // Обработчик нажатия клавиши Esc для сброса выбора склада
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedWarehouseId) {
        onWarehouseSelect(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWarehouseId, onWarehouseSelect]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleWarehouseClick = () => {
    setWarehouseOpen(!warehouseOpen);
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {isMobile && <Toolbar />}
      <List sx={{ flexGrow: 1, p: 3 }}>
        {isAuthenticated && (
          <>
            <TextField
              fullWidth
              label="Поиск склада"
              variant="outlined"
              margin="none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ paddingBottom: 1, bgcolor: "background.paper" }}
            />
            <ListItemButton onClick={handleWarehouseClick}>
              <ListItemIcon>
                <WarehouseIcon />
              </ListItemIcon>
              <ListItemText primary="Склады" />
              {warehouseOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={warehouseOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {warehouses.map((warehouse) => (
                  <ListItemButton
                    key={warehouse.warehouseId}
                    onClick={() => onWarehouseSelect(warehouse.warehouseId)}
                    sx={{
                      pl: 4,
                      backgroundColor:
                        selectedWarehouseId === warehouse.warehouseId
                          ? "rgba(144, 238, 144, 0.3)"
                          : "inherit",
                      "&:hover": {
                        backgroundColor:
                          selectedWarehouseId === warehouse.warehouseId
                            ? "rgba(144, 238, 144, 0.5)"
                            : "inherit",
                      },
                    }}
                  >
                    <ListItemText
                      primary={warehouse.warehouseName}
                      sx={{
                        fontWeight:
                          selectedWarehouseId === warehouse.warehouseId
                            ? "bold"
                            : "normal",
                      }}
                    />
                    {selectedWarehouseId === warehouse.warehouseId && (
                      <ListItemIcon sx={{ minWidth: 0, ml: 1 }}>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                    )}
                  </ListItemButton>
                ))}
                {warehouses.length === 0 && !loading && !error && (
                  <ListItemText
                    primary="Склады не найдены"
                    sx={{ pl: 4, color: "text.secondary" }}
                  />
                )}
              </List>
            </Collapse>
          </>
        )}
      </List>
      {loading && (
        <CircularProgress
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}
      {error && (
        <Alert severity="error" sx={{ p: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          display: { xs: "none", sm: "block" }, // Drawer только на десктопе
        }}
      >
        <MuiDrawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              position: "relative",
              height: "calc(100vh - 64px)", // Высота без AppBar
              top: (theme) => theme.spacing(8), // Отступ под AppBar
            },
          }}
          open
        >
          {drawer}
        </MuiDrawer>
      </Box>
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </MuiDrawer>
    </>
  );
}
