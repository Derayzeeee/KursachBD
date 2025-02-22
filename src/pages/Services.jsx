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
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx';

const Services = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState('default');
  const [currentService, setCurrentService] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }  
  };

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

  const handleSave = async () => {
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/services/${currentService.id}`
        : 'http://localhost:3001/api/services';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentService),
      });

      if (response.ok) {
        fetchServices();
        handleClose();
      } else {
        console.error('Error saving service:', await response.text());
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setIsEditing(true);
    setOpen(true);
  };

  const handleExport = async () => {
    try {
      const dataToExport = services.map(service => ({
        'Название': service.name,
        'Описание': service.description,
        'Стоимость': service.price,
        'Длительность': service.duration,
        'Категория': service.category
      }));
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
  
      // Настройка ширины столбцов
      const wscols = [
        { wch: 30 }, // Название
        { wch: 40 }, // Описание
        { wch: 15 }, // Стоимость
        { wch: 15 }, // Длительность
        { wch: 20 }  // Категория
      ];
      ws['!cols'] = wscols;
  
      XLSX.utils.book_append_sheet(wb, ws, 'Услуги');
      XLSX.writeFile(wb, `services_export_${new Date().toLocaleDateString()}.xlsx`);
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
              name: item['Название'],
              description: item['Описание'],
              price: Number(item['Стоимость']),
              duration: item['Длительность'],
              category: item['Категория']
            }));
  
            for (const service of formattedData) {
              await fetch('http://localhost:3001/api/services', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(service),
              });
            }
            
            await fetchServices();
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

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/services/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchServices();
        } else {
          console.error('Error deleting service:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Услуги</Typography>
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
              Добавить услугу
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