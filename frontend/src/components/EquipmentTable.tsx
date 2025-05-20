// EquipmentTable.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectEquipment,
  selectEquipmentLoading,
  selectEquipmentError,
  fetchEquipment,
  selectEquipmentTotal,
} from "../features/equipments/equipmentSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Button,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";

interface EquipmentTableProps {
  selectedWarehouseId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function EquipmentTable({
  selectedWarehouseId,
  searchTerm: equipmentSearch,
  onSearchChange,
}: EquipmentTableProps) {
  const dispatch = useDispatch();
  const equipment = useSelector(selectEquipment);
  const equipmentLoading = useSelector(selectEquipmentLoading);
  const equipmentError = useSelector(selectEquipmentError);
  const total = useSelector(selectEquipmentTotal);
  const [currentPage, setCurrentPage] = useState(0);
  const [sort, setSort] = useState("name:asc");
  const itemsPerPage = 100;

  // Debounced функция для отправки запроса оборудования
  const debouncedFetchEquipment = debounce(
    (params) => dispatch(fetchEquipment(params)),
    300
  );

  // Загрузка данных при изменении параметров оборудования
  useEffect(() => {
    debouncedFetchEquipment({
      search: equipmentSearch,
      warehouseId: selectedWarehouseId,
      page: currentPage,
      limit: itemsPerPage,
      sort,
    });

    return () => {
      debouncedFetchEquipment.cancel();
    };
  }, [dispatch, equipmentSearch, selectedWarehouseId, currentPage, sort]);

  const handleSort = (field: string) => {
    setSort((prevSort) => {
      const [currentField, currentOrder] = prevSort.split(":");
      return currentField === field
        ? `${field}:${currentOrder === "asc" ? "desc" : "asc"}`
        : `${field}:asc`;
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (equipmentLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (equipmentError) {
    return <Alert severity="error">{equipmentError}</Alert>;
  }

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort("id")}>
                ID {sort === "id:asc" ? "↑" : sort === "id:desc" ? "↓" : ""}
              </TableCell>
              <TableCell onClick={() => handleSort("name")}>
                Название{" "}
                {sort === "name:asc" ? "↑" : sort === "name:desc" ? "↓" : ""}
              </TableCell>
              <TableCell onClick={() => handleSort("serialNumber")}>
                Серийный номер{" "}
                {sort === "serialNumber:asc"
                  ? "↑"
                  : sort === "serialNumber:desc"
                  ? "↓"
                  : ""}
              </TableCell>
              <TableCell onClick={() => handleSort("status")}>
                Статус{" "}
                {sort === "status:asc"
                  ? "↑"
                  : sort === "status:desc"
                  ? "↓"
                  : ""}
              </TableCell>
              <TableCell onClick={() => handleSort("quantity")}>
                Количество{" "}
                {sort === "quantity:asc"
                  ? "↑"
                  : sort === "quantity:desc"
                  ? "↓"
                  : ""}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.serialNumber || "Не указан"}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {equipment.length === 0 && !equipmentLoading && !equipmentError && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Оборудование не найдено
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
        <Button
          variant="contained"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          Назад
        </Button>
        <Typography sx={{ alignSelf: "center" }}>
          Страница {currentPage + 1} из {totalPages}
        </Typography>
        <Button
          variant="contained"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Далее
        </Button>
      </Box>
    </Box>
  );
}
