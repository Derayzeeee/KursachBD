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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    clientId: ''
  });

  useEffect(() => {
        fetchVehicles();
      }, []);
    
      const fetchVehicles = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/vehicles');
          const data = await response.json();
          setVehicles(data);
        } catch (error) {
          console.error('Error fetching vehicles:', error);
        }
      };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentVehicle({
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      vin: '',
      clientId: ''
    });
  };

  const handleSave = async () => {
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/vehicles/${currentVehicle.id}`
        : 'http://localhost:3001/api/vehicles';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentVehicle),
      });

      if (response.ok) {
        fetchVehicles();
        handleClose();
      } else {
        console.error('Error saving vehicles:', await response.text());
      }
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  };

  const handleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchVehicles();
        } else {
          console.error('Error deleting vehicle:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Автомобили</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Добавить автомобиль
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Марка</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Год</TableCell>
              <TableCell>Гос. номер</TableCell>
              <TableCell>VIN</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.make}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.vin}</TableCell>
                <TableCell>{vehicle.clientName}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(vehicle)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle.id)}>
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
          {isEditing ? 'Редактировать автомобиль' : 'Добавить новый автомобиль'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Марка"
            fullWidth
            value={currentVehicle.make}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, make: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Модель"
            fullWidth
            value={currentVehicle.model}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Год выпуска"
            fullWidth
            type="number"
            value={currentVehicle.year}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, year: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Гос. номер"
            fullWidth
            value={currentVehicle.licensePlate}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, licensePlate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="VIN"
            fullWidth
            value={currentVehicle.vin}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, vin: e.target.value })}
          />
          <TextField
            margin="dense"
            label="ID клиента"
            fullWidth
            value={currentVehicle.clientId}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, clientId: e.target.value })}
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

export default Vehicles;