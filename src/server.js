const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'database', 'service_station.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database successfully');
    initDatabase();
  }
});

// Database initialization
function initDatabase() {
  db.serialize(() => {
    // Clients table
    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        preferredContactMethod TEXT,
        created_at DATETIME,
        created_by TEXT,
        updated_at DATETIME,
        updated_by TEXT
      )
    `);

    // Services table
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration REAL NOT NULL,
        price REAL NOT NULL
      )
    `);

    // Vehicles table
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        licensePlate TEXT NOT NULL,
        vin TEXT NOT NULL,
        clientId INTEGER NOT NULL,
        FOREIGN KEY (clientId) REFERENCES clients (id)
      )
    `);

    // Inventory (parts) table
    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        minQuantity INTEGER NOT NULL,
        price REAL NOT NULL,
        supplier TEXT NOT NULL
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        serviceId INTEGER NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL,
        totalPrice REAL NOT NULL,
        notes TEXT,
        FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
        FOREIGN KEY (serviceId) REFERENCES services (id)
      )
    `);
  });
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
}

// CLIENTS ENDPOINTS

// Get all clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching clients:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new client
app.post('/api/clients', (req, res) => {
  const { 
    name, 
    phone, 
    email, 
    address, 
    preferredContactMethod 
  } = req.body;

  const currentDate = formatDate(new Date().toISOString());
  const currentUser = 'Derayzeeee';

  const sql = `
    INSERT INTO clients (
      name, 
      phone, 
      email, 
      address, 
      preferredContactMethod, 
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      name, 
      phone, 
      email, 
      address, 
      preferredContactMethod,
      currentDate,
      currentUser,
      currentDate,
      currentUser
    ],
    function(err) {
      if (err) {
        console.error('Error creating client:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM clients WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created client:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Update a client
app.put('/api/clients/:id', (req, res) => {
  const { 
    name, 
    phone, 
    email, 
    address, 
    preferredContactMethod,
    created_at
  } = req.body;

  const currentDate = formatDate(new Date().toISOString());
  const currentUser = 'Derayzeeee';

  const sql = `
    UPDATE clients SET 
      name = ?, 
      phone = ?, 
      email = ?, 
      address = ?, 
      preferredContactMethod = ?,
      created_at = ?,
      updated_at = ?,
      updated_by = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      name,
      phone,
      email,
      address,
      preferredContactMethod,
      created_at,
      currentDate,
      currentUser,
      req.params.id
    ],
    (err) => {
      if (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM clients WHERE id = ?',
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated client:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          if (!row) {
            res.status(404).json({ error: 'Client not found' });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a client
app.delete('/api/clients/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', req.params.id, (err) => {
    if (err) {
      console.error('Error deleting client:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Client deleted successfully' });
  });
});

// SERVICES ENDPOINTS

// Get all services
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', [], (err, rows) => {
    if (err) {
      console.error('Error fetching services:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new service
app.post('/api/services', (req, res) => {
  const { 
    name, 
    description, 
    duration, 
    price 
  } = req.body;

  const sql = `
    INSERT INTO services (
      name,
      description,
      duration,
      price
    ) VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [name, description, duration, price],
    function(err) {
      if (err) {
        console.error('Error creating service:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM services WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created service:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Update a service
app.put('/api/services/:id', (req, res) => {
  const { 
    name, 
    description, 
    duration, 
    price 
  } = req.body;

  const sql = `
    UPDATE services SET 
      name = ?, 
      description = ?, 
      duration = ?, 
      price = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [name, description, duration, price, req.params.id],
    (err) => {
      if (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM services WHERE id = ?',
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated service:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          if (!row) {
            res.status(404).json({ error: 'Service not found' });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a service
app.delete('/api/services/:id', (req, res) => {
  db.run('DELETE FROM services WHERE id = ?', req.params.id, (err) => {
    if (err) {
      console.error('Error deleting service:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  });
});

// VEHICLES ENDPOINTS

// Get all vehicles with client names
app.get('/api/vehicles', (req, res) => {
  const sql = `
    SELECT 
      vehicles.*,
      clients.name as clientName
    FROM vehicles
    LEFT JOIN clients ON vehicles.clientId = clients.id
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching vehicles:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new vehicle
app.post('/api/vehicles', (req, res) => {
  const {
    make,
    model,
    year,
    licensePlate,
    vin,
    clientId
  } = req.body;

  const sql = `
    INSERT INTO vehicles (
      make,
      model,
      year,
      licensePlate,
      vin,
      clientId
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [make, model, year, licensePlate, vin, clientId],
    function(err) {
      if (err) {
        console.error('Error creating vehicle:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const selectSql = `
        SELECT 
          vehicles.*,
          clients.name as clientName
        FROM vehicles
        LEFT JOIN clients ON vehicles.clientId = clients.id
        WHERE vehicles.id = ?
      `;

      db.get(
        selectSql,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created vehicle:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Update a vehicle
app.put('/api/vehicles/:id', (req, res) => {
  const {
    make,
    model,
    year,
    licensePlate,
    vin,
    clientId
  } = req.body;

  const sql = `
    UPDATE vehicles SET 
      make = ?,
      model = ?,
      year = ?,
      licensePlate = ?,
      vin = ?,
      clientId = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [make, model, year, licensePlate, vin, clientId, req.params.id],
    (err) => {
      if (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const selectSql = `
        SELECT 
          vehicles.*,
          clients.name as clientName
        FROM vehicles
        LEFT JOIN clients ON vehicles.clientId = clients.id
        WHERE vehicles.id = ?
      `;

      db.get(
        selectSql,
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated vehicle:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          if (!row) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  db.run('DELETE FROM vehicles WHERE id = ?', req.params.id, (err) => {
    if (err) {
      console.error('Error deleting vehicle:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  });
});

// INVENTORY ENDPOINTS

// Get all parts
app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory', [], (err, rows) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new part
app.post('/api/inventory', (req, res) => {
  const {
    name,
    category,
    quantity,
    minQuantity,
    price,
    supplier
  } = req.body;

  const sql = `
    INSERT INTO inventory (
      name,
      category,
      quantity,
      minQuantity,
      price,
      supplier
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [name, category, quantity, minQuantity, price, supplier],
    function(err) {
      if (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM inventory WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created inventory item:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Update a part
app.put('/api/inventory/:id', (req, res) => {
  const {
    name,
    category,
    quantity,
    minQuantity,
    price,
    supplier
  } = req.body;

  const sql = `
    UPDATE inventory SET 
      name = ?,
      category = ?,
      quantity = ?,
      minQuantity = ?,
      price = ?,
      supplier = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [name, category, quantity, minQuantity, price, supplier, req.params.id],
    (err) => {
      if (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM inventory WHERE id = ?',
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated inventory item:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          if (!row) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete a part
app.delete('/api/inventory/:id', (req, res) => {
  db.run('DELETE FROM inventory WHERE id = ?', req.params.id, (err) => {
    if (err) {
      console.error('Error deleting inventory item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  });
});

// ORDERS ENDPOINTS

// Get all orders with vehicle and service info
app.get('/api/orders', (req, res) => {
  const sql = `
    SELECT 
      orders.*,
      vehicles.make || ' ' || vehicles.model || ' (' || vehicles.licensePlate || ')' as vehicleInfo,
      services.name as serviceName
    FROM orders
    LEFT JOIN vehicles ON orders.vehicleId = vehicles.id
    LEFT JOIN services ON orders.serviceId = services.id
    ORDER BY orders.date DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new order
app.post('/api/orders', (req, res) => {
  const {
    vehicleId,
    serviceId,
    date,
    status,
    totalPrice,
    notes
  } = req.body;

  const sql = `
    INSERT INTO orders (
      vehicleId,
      serviceId,
      date,
      status,
      totalPrice,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [vehicleId, serviceId, date, status, totalPrice, notes],
    function(err) {
      if (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const selectSql = `
        SELECT 
          orders.*,
          vehicles.make || ' ' || vehicles.model || ' (' || vehicles.licensePlate || ')' as vehicleInfo,
          services.name as serviceName
        FROM orders
        LEFT JOIN vehicles ON orders.vehicleId = vehicles.id
        LEFT JOIN services ON orders.serviceId = services.id
        WHERE orders.id = ?
      `;

      db.get(
        selectSql,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('Error fetching created order:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Update an order
app.put('/api/orders/:id', (req, res) => {
  const {
    vehicleId,
    serviceId,
    date,
    status,
    totalPrice,
    notes
  } = req.body;

  const sql = `
    UPDATE orders SET 
      vehicleId = ?,
      serviceId = ?,
      date = ?,
      status = ?,
      totalPrice = ?,
      notes = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [vehicleId, serviceId, date, status, totalPrice, notes, req.params.id],
    (err) => {
      if (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const selectSql = `
        SELECT 
          orders.*,
          vehicles.make || ' ' || vehicles.model || ' (' || vehicles.licensePlate || ')' as vehicleInfo,
          services.name as serviceName
        FROM orders
        LEFT JOIN vehicles ON orders.vehicleId = vehicles.id
        LEFT JOIN services ON orders.serviceId = services.id
        WHERE orders.id = ?
      `;

      db.get(
        selectSql,
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Error fetching updated order:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          if (!row) {
            res.status(404).json({ error: 'Order not found' });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// Delete an order
app.delete('/api/orders/:id', (req, res) => {
  db.run('DELETE FROM orders WHERE id = ?', req.params.id, (err) => {
    if (err) {
      console.error('Error deleting order:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});