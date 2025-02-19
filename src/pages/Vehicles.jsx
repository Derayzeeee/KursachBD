import React, { useState } from 'react';
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

  const handleSave = () => {
    // Add your save logic here
    if (isEditing) {
      // Update existing vehicle
    } else {
      // Add new vehicle
    }
    handleClose();
  };

  const handleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    // Add your delete logic here
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