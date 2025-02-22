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

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState('default');
  const [currentVehicle, setCurrentVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    clientId: '',
    clientName: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        console.error('Error fetching data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleExport = async () => {
    try {
      const dataToExport = vehicles.map(vehicle => ({
        'Марка': vehicle.make,
        'Модель': vehicle.model,
        'Год': vehicle.year,
        'Гос. номер': vehicle.licensePlate,
        'VIN': vehicle.vin,
        'ID клиента': vehicle.clientId,
        'Клиент': vehicle.clientName
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Настройка ширины столбцов
      const wscols = [
        { wch: 20 }, // Марка
        { wch: 20 }, // Модель
        { wch: 10 }, // Год
        { wch: 15 }, // Гос. номер
        { wch: 25 }, // VIN
        { wch: 15 }, // ID клиента
        { wch: 30 }  // Клиент
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, 'Автомобили');
      XLSX.writeFile(wb, `vehicles_export_${new Date().toLocaleDateString()}.xlsx`);
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
              make: item['Марка'],
              model: item['Модель'],
              year: Number(item['Год']),
              licensePlate: item['Гос. номер'],
              vin: item['VIN'],
              clientId: item['ID клиента']
            }));

            for (const vehicle of formattedData) {
              await fetch('http://localhost:3001/api/vehicles', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(vehicle),
              });
            }
            
            await fetchVehicles();
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
    setCurrentVehicle({
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      vin: '',
      clientId: '',
      clientName: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentVehicle({
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      vin: '',
      clientId: '',
      clientName: ''
    });
    setActionType('default');
  };

  const handleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = isEditing
        ? `http://localhost:3001/api/vehicles/${currentVehicle.id}`
        : 'http://localhost:3001/api/vehicles';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentVehicle),
      });

      if (response.ok) {
        await fetchVehicles();
        handleClose();
      } else {
        alert('Ошибка при сохранении данных');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Ошибка при сохранении данных');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchVehicles();
        } else {
          alert('Ошибка при удалении автомобиля');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Ошибка при удалении автомобиля');
      }
    }
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
        <Typography variant="h4">Автомобили</Typography>
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
              Добавить автомобиль
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
                  <IconButton onClick={() => handleEdit(vehicle)} title="Редактировать">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(vehicle.id)} title="Удалить">
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
          {isEditing ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
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
            type="number"
            fullWidth
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