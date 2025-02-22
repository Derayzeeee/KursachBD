import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState('default');
  const [currentOrder, setCurrentOrder] = useState({
    vehicleId: '',
    serviceId: '',
    date: '',
    status: 'pending',
    totalPrice: '',
    notes: ''
  });

  useEffect(() => {
      fetchOrders();
    }, []);
  
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentOrder({
      vehicleId: '',
      serviceId: '',
      date: '',
      status: 'pending',
      totalPrice: '',
      notes: ''
    });
  };

  const handleSave = async () => {
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/orders/${currentOrder.id}`
        : 'http://localhost:3001/api/orders';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentOrder),
      });

      if (response.ok) {
        fetchOrders();
        handleClose();
      } else {
        console.error('Error saving order:', await response.text());
      }
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const handleEdit = (order) => {
    setCurrentOrder(order);
    setIsEditing(true);
    setOpen(true);
  };

  const handleExport = async () => {
    try {
      const dataToExport = orders.map(order => ({
        '№ Заказа': order.id,
        'Автомобиль': order.vehicleId,
        'Услуга': order.serviceId,
        'Дата': new Date(order.date).toLocaleDateString(),
        'Статус': order.status,
        'Сумма': order.totalPrice,
        'Примечания': order.notes
      }));
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
  
      XLSX.utils.book_append_sheet(wb, ws, 'Заказы');
      XLSX.writeFile(wb, `orders_export_${new Date().toLocaleDateString()}.xlsx`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных');
    }
  };
  
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
              vehicleId: item['Автомобиль'],
              serviceId: item['Услуга'],
              date: item['Дата'],
              status: item['Статус'],
              totalPrice: item['Сумма'],
              notes: item['Примечания']
            }));
  
            for (const order of formattedData) {
              await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
              });
            }
            
            await fetchOrders();
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
      setTimeout(() => {
        setActionType('default');
      }, 100);
    }
  };

  // Добавьте эту функцию в компонент Orders
const getStatusInRussian = (status) => {
  const statusMap = {
    'pending': 'В ожидании',
    'in_progress': 'В работе',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || status;
};

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/orders/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchOrders();
        } else {
          console.error('Error deleting order:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Заказы</Typography>
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
              Новый заказ
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
              <TableCell>№ Заказа</TableCell>
              <TableCell>Автомобиль</TableCell>
              <TableCell>Услуга</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Примечания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.vehicleInfo}</TableCell>
                <TableCell>{order.serviceName}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{getStatusInRussian(order.status)}</TableCell>
                <TableCell>{order.totalPrice}</TableCell>
                <TableCell>{order.notes}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(order)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(order.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? 'Редактировать заказ' : 'Новый заказ'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="ID автомобиля"
            fullWidth
            value={currentOrder.vehicleId}
            onChange={(e) => setCurrentOrder({ ...currentOrder, vehicleId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="ID услуги"
            fullWidth
            value={currentOrder.serviceId}
            onChange={(e) => setCurrentOrder({ ...currentOrder, serviceId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Дата"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={currentOrder.date}
            onChange={(e) => setCurrentOrder({ ...currentOrder, date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Статус</InputLabel>
            <Select
              value={currentOrder.status}
              label="Статус"
              onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
            >
              <MenuItem value="pending">В ожидании</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="completed">Завершен</MenuItem>
              <MenuItem value="cancelled">Отменен</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Сумма"
            type="number"
            fullWidth
            value={currentOrder.totalPrice}
            onChange={(e) => setCurrentOrder({ ...currentOrder, totalPrice: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Примечания"
            fullWidth
            multiline
            rows={3}
            value={currentOrder.notes}
            onChange={(e) => setCurrentOrder({ ...currentOrder, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;