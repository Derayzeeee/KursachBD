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
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPart, setCurrentPart] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    price: '',
    supplier: ''
  });

  useEffect(() => {
      fetchInventory();
    }, []);
  
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/inventory');
        const data = await response.json();
        setParts(data);
      } catch (error) {
        console.error('Error fetching parts:', error);
      }
    };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentPart({
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      price: '',
      supplier: ''
    });
  };

  const handleSave = async () => {
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/inventory/${currentPart.id}`
        : 'http://localhost:3001/api/inventory';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPart),
      });

      if (response.ok) {
        fetchInventory();
        handleClose();
      } else {
        console.error('Error saving parts:', await response.text());
      }
    } catch (error) {
      console.error('Error saving parts:', error);
    }
  };

  const handleEdit = (part) => {
    setCurrentPart(part);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запчасть?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/parts/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchInventory();
        } else {
          console.error('Error deleting part:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting part:', error);
      }
    }
  };

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity <= minQuantity) {
      return <Chip label="Мало" color="error" size="small" />;
    } else if (quantity <= minQuantity * 1.5) {
      return <Chip label="Средне" color="warning" size="small" />;
    }
    return <Chip label="Достаточно" color="success" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Склад запчастей</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Добавить запчасть
        </Button>
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
                  <IconButton onClick={() => handleEdit(part)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(part.id)}>
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