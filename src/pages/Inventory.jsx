import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx';

const Inventory = () => {
  // Состояния компонента
  const [parts, setParts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState('default');
  const [currentPart, setCurrentPart] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    price: '',
    supplier: ''
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchParts();
  }, []);

  // Получение данных с сервера
  const fetchParts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setParts(data);
      } else {
        console.error('Error fetching data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  // Экспорт в Excel
  const handleExport = async () => {
    try {
      const dataToExport = parts.map(part => ({
        'Название': part.name,
        'Категория': part.category,
        'Количество': part.quantity,
        'Мин. количество': part.minQuantity,
        'Цена': part.price,
        'Поставщик': part.supplier
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Настройка ширины столбцов
      const wscols = [
        { wch: 30 }, // Название
        { wch: 20 }, // Категория
        { wch: 15 }, // Количество
        { wch: 15 }, // Мин. количество
        { wch: 15 }, // Цена
        { wch: 30 }  // Поставщик
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, 'Склад');
      XLSX.writeFile(wb, `inventory_export_${new Date().toLocaleDateString()}.xlsx`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  // Импорт из Excel
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const importedData = XLSX.utils.sheet_to_json(worksheet);

            const formattedData = importedData.map(item => ({
              name: item['Название'],
              category: item['Категория'],
              quantity: Number(item['Количество']),
              minQuantity: Number(item['Мин. количество']),
              price: Number(item['Цена']),
              supplier: item['Поставщик']
            }));

            for (const part of formattedData) {
              await fetch('http://localhost:3001/api/inventory', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(part),
              });
            }
            
            await fetchParts();
            alert('Импорт успешно завершен');
          } catch (error) {
            console.error('Ошибка при импорте:', error);
            alert('Ошибка при импорте данных');
          }
        };
        reader.readAsBinaryString(file);
      }
    };

    input.click();
  };

  // Открытие диалога добавления
  const handleOpen = () => {
    setIsEditing(false);
    setCurrentPart({
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      price: '',
      supplier: ''
    });
    setOpen(true);
  };

  // Закрытие диалога
  const handleClose = () => {
    setOpen(false);
    setCurrentPart({
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      price: '',
      supplier: ''
    });
    setActionType('default');
  };

  // Редактирование записи
  const handleEdit = (part) => {
    setCurrentPart(part);
    setIsEditing(true);
    setOpen(true);
  };

  // Сохранение записи
  const handleSave = async () => {
    try {
      const url = isEditing
        ? `http://localhost:3001/api/inventory/${currentPart.id}`
        : 'http://localhost:3001/api/inventory';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPart),
      });

      if (response.ok) {
        await fetchParts();
        handleClose();
      } else {
        alert('Ошибка при сохранении данных');
      }
    } catch (error) {
      console.error('Error saving part:', error);
      alert('Ошибка при сохранении данных');
    }
  };

  // Удаление записи
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запчасть?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/inventory/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchParts();
        } else {
          alert('Ошибка при удалении записи');
        }
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('Ошибка при удалении записи');
      }
    }
  };

  // Получение статуса наличия
  const getStockStatus = (quantity, minQuantity) => {
    return quantity <= minQuantity ? 'Требуется пополнение' : 'В наличии';
  };

  // Обработчик изменения действия в селекте
  const handleActionChange = async (event) => {
    const action = event.target.value;
    setActionType(action);

    try {
      switch (action) {
        case 'add':
          handleOpen();
          break;
        case 'export':
          await handleExport();
          break;
        case 'import':
          await handleImport();
          break;
      }
    } finally {
      // Сброс значения селекта после выполнения действия
      setTimeout(() => {
        setActionType('default');
      }, 100);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Склад запчастей</Typography>
        <Select
          value={actionType}
          onChange={handleActionChange}
          size="small"
          sx={{ width: 200 }}
          displayEmpty
          renderValue={(selected) => "Функции"}
        >
          <MenuItem value="default" disabled>Функции</MenuItem>
          <MenuItem value="add">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon sx={{ mr: 1 }} />
              Добавить запчасть
            </Box>
          </MenuItem>
          <MenuItem value="export">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileDownloadIcon sx={{ mr: 1 }} />
              Экспорт в Excel
            </Box>
          </MenuItem>
          <MenuItem value="import">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileUploadIcon sx={{ mr: 1 }} />
              Импорт из Excel
            </Box>
          </MenuItem>
        </Select>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.category}</TableCell>
                <TableCell>{part.quantity}</TableCell>
                <TableCell>
                  {getStockStatus(part.quantity, part.minQuantity)}
                </TableCell>
                <TableCell>{part.price}</TableCell>
                <TableCell>{part.supplier}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(part)} title="Редактировать">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(part.id)} title="Удалить">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Редактировать запчасть' : 'Добавить запчасть'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={currentPart.name}
            onChange={(e) => setCurrentPart({ ...currentPart, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Категория"
            fullWidth
            value={currentPart.category}
            onChange={(e) => setCurrentPart({ ...currentPart, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Количество"
            type="number"
            fullWidth
            value={currentPart.quantity}
            onChange={(e) => setCurrentPart({ ...currentPart, quantity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Минимальное количество"
            type="number"
            fullWidth
            value={currentPart.minQuantity}
            onChange={(e) => setCurrentPart({ ...currentPart, minQuantity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Цена"
            type="number"
            fullWidth
            value={currentPart.price}
            onChange={(e) => setCurrentPart({ ...currentPart, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Поставщик"
            fullWidth
            value={currentPart.supplier}
            onChange={(e) => setCurrentPart({ ...currentPart, supplier: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;