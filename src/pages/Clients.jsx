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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DirectionsCar as CarIcon } from '@mui/icons-material';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    registrationDate: '',
    preferredContactMethod: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      registrationDate: '',
      preferredContactMethod: ''
    });
  };

  const handleSave = async () => {
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/clients/${currentClient.id}`
        : 'http://localhost:3001/api/clients';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentClient),
      });

      if (response.ok) {
        fetchClients();
        handleClose();
      } else {
        console.error('Error saving client:', await response.text());
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/clients/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchClients();
        } else {
          console.error('Error deleting client:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleViewVehicles = (clientId) => {
    // Navigate to vehicles page filtered by client
    // Implementation depends on your routing setup
    console.log('View vehicles for client:', clientId);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Клиенты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Добавить клиента
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ФИО</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell>Предпочитаемый способ связи</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{new Date(client.created_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{client.preferredContactMethod}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(client)} title="Редактировать">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)} title="Удалить">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewVehicles(client.id)} title="Автомобили клиента">
                    <CarIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Редактировать клиента' : 'Добавить нового клиента'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ФИО"
            fullWidth
            value={currentClient.name}
            onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Телефон"
            fullWidth
            value={currentClient.phone}
            onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentClient.email}
            onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Адрес"
            fullWidth
            multiline
            rows={2}
            value={currentClient.address}
            onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Дата регистрации"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={currentClient.created_at}
            onChange={(e) => setCurrentClient({ ...currentClient, created_at: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Предпочитаемый способ связи"
            select
            fullWidth
            value={currentClient.preferredContactMethod}
            onChange={(e) => setCurrentClient({ ...currentClient, preferredContactMethod: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="phone">Телефон</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </TextField>
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

export default Clients;