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

const Services = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentService({
      name: '',
      description: '',
      duration: '',
      price: '',
    });
  };

  const handleSave = () => {
    // Add your save logic here
    if (isEditing) {
      // Update existing service
    } else {
      // Add new service
    }
    handleClose();
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    // Add your delete logic here
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Услуги</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Добавить услугу
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название услуги</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Длительность (ч)</TableCell>
              <TableCell>Цена (₽)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.duration}</TableCell>
                <TableCell>{service.price}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(service)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(service.id)}>
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
          {isEditing ? 'Редактировать услугу' : 'Добавить новую услугу'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название услуги"
            fullWidth
            value={currentService.name}
            onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            value={currentService.description}
            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Длительность (ч)"
            fullWidth
            type="number"
            value={currentService.duration}
            onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Цена (₽)"
            fullWidth
            type="number"
            value={currentService.price}
            onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
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

export default Services;