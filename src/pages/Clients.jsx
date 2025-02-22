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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import * as XLSX from 'xlsx';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState('default');
  const [currentClient, setCurrentClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredContactMethod: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        console.error('Error fetching data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleExport = async () => {
    try {
      const dataToExport = clients.map(client => ({
        'ФИО': client.name,
        'Телефон': client.phone,
        'Email': client.email,
        'Адрес': client.address,
        'Дата регистрации': new Date(client.created_at).toLocaleDateString('ru-RU'),
        'Предпочитаемый способ связи': client.preferredContactMethod
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Настройка ширины столбцов
      const wscols = [
        { wch: 30 }, // ФИО
        { wch: 15 }, // Телефон
        { wch: 25 }, // Email
        { wch: 40 }, // Адрес
        { wch: 15 }, // Дата регистрации
        { wch: 25 }  // Предпочитаемый способ связи
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, 'Клиенты');
      XLSX.writeFile(wb, `clients_export_${new Date().toLocaleDateString()}.xlsx`);
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
              name: item['ФИО'],
              phone: item['Телефон'],
              email: item['Email'],
              address: item['Адрес'],
              preferredContactMethod: item['Предпочитаемый способ связи']
            }));

            for (const client of formattedData) {
              await fetch('http://localhost:3001/api/clients', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(client),
              });
            }
            
            await fetchClients();
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

  const handleOpen = () => {
    setIsEditing(false);
    setCurrentClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      preferredContactMethod: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      preferredContactMethod: ''
    });
    setActionType('default');
  };

  const handleEdit = (client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = isEditing
        ? `http://localhost:3001/api/clients/${currentClient.id}`
        : 'http://localhost:3001/api/clients';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentClient),
      });

      if (response.ok) {
        await fetchClients();
        handleClose();
      } else {
        alert('Ошибка при сохранении данных');
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Ошибка при сохранении данных');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/clients/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchClients();
        } else {
          alert('Ошибка при удалении клиента');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Ошибка при удалении клиента');
      }
    }
  };

  const handleViewVehicles = (clientId) => {
    // Навигация к странице автомобилей клиента
    console.log('View vehicles for client:', clientId);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Клиенты</Typography>
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
              Добавить клиента
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
                    <DirectionsCarIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Редактировать клиента' : 'Добавить клиента'}
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
            label="Предпочитаемый способ связи"
            fullWidth
            value={currentClient.preferredContactMethod}
            onChange={(e) => setCurrentClient({ ...currentClient, preferredContactMethod: e.target.value })}
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

export default Clients;