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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Новый заказ
        </Button>
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
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.vehicleInfo}</TableCell>
                <TableCell>{order.serviceName}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.totalPrice}</TableCell>
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