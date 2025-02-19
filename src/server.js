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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicles table
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        license_plate TEXT,
        vin TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Services table
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration REAL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER,
        service_id INTEGER,
        status TEXT DEFAULT 'pending',
        start_date DATETIME,
        completion_date DATETIME,
        total_price REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // Parts inventory table
    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        min_quantity INTEGER DEFAULT 5,
        price REAL,
        supplier TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Parts used in orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_parts (
        order_id INTEGER,
        part_id INTEGER,
        quantity INTEGER,
        price_per_unit REAL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (part_id) REFERENCES inventory(id),
        PRIMARY KEY (order_id, part_id)
      )
    `);
  });
}

// API Endpoints

// Clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/clients', (req, res) => {
  const { name, phone, email, address } = req.body;
  db.run(
    'INSERT INTO clients (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [name, phone, email, address],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Vehicles
app.get('/api/vehicles', (req, res) => {
  db.all(`
    SELECT v.*, c.name as client_name 
    FROM vehicles v 
    LEFT JOIN clients c ON v.client_id = c.id 
    ORDER BY v.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/vehicles', (req, res) => {
  const { client_id, make, model, year, license_plate, vin } = req.body;
  db.run(
    'INSERT INTO vehicles (client_id, make, model, year, license_plate, vin) VALUES (?, ?, ?, ?, ?, ?)',
    [client_id, make, model, year, license_plate, vin],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Services
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/services', (req, res) => {
  const { name, description, duration, price } = req.body;
  db.run(
    'INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)',
    [name, description, duration, price],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Orders
app.get('/api/orders', (req, res) => {
  db.all(`
    SELECT o.*, v.make, v.model, v.license_plate, s.name as service_name
    FROM orders o
    LEFT JOIN vehicles v ON o.vehicle_id = v.id
    LEFT JOIN services s ON o.service_id = s.id
    ORDER BY o.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const { vehicle_id, service_id, status, start_date, total_price, notes } = req.body;
  db.run(
    'INSERT INTO orders (vehicle_id, service_id, status, start_date, total_price, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [vehicle_id, service_id, status, start_date, total_price, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Inventory
app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/inventory', (req, res) => {
  const { name, category, quantity, min_quantity, price, supplier } = req.body;
  db.run(
    'INSERT INTO inventory (name, category, quantity, min_quantity, price, supplier) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, quantity, min_quantity, price, supplier],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update endpoints
app.put('/api/clients/:id', (req, res) => {
  const { name, phone, email, address } = req.body;
  db.run(
    'UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
    [name, phone, email, address, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.put('/api/vehicles/:id', (req, res) => {
  const { client_id, make, model, year, license_plate, vin } = req.body;
  db.run(
    'UPDATE vehicles SET client_id = ?, make = ?, model = ?, year = ?, license_plate = ?, vin = ? WHERE id = ?',
    [client_id, make, model, year, license_plate, vin, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.put('/api/orders/:id', (req, res) => {
  const { status, completion_date, total_price, notes } = req.body;
  db.run(
    'UPDATE orders SET status = ?, completion_date = ?, total_price = ?, notes = ? WHERE id = ?',
    [status, completion_date, total_price, notes, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.put('/api/inventory/:id', (req, res) => {
  const { quantity, price } = req.body;
  db.run(
    'UPDATE inventory SET quantity = ?, price = ? WHERE id = ?',
    [quantity, price, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Delete endpoints
app.delete('/api/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const validTables = ['clients', 'vehicles', 'services', 'orders', 'inventory'];
  
  if (!validTables.includes(table)) {
    res.status(400).json({ error: 'Invalid table name' });
    return;
  }

  db.run(`DELETE FROM ${table} WHERE id = ?`, id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Add these handlers to the new server.js

// More detailed error handling for sales
app.post('/api/orders', (req, res) => {
  const { vehicle_id, service_id, status, start_date, total_price, notes, parts } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // Create the order
      db.run(
        'INSERT INTO orders (vehicle_id, service_id, status, start_date, total_price, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [vehicle_id, service_id, status, start_date, total_price, notes],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          const order_id = this.lastID;

          // Add parts to the order if any
          if (parts && parts.length > 0) {
            const stmt = db.prepare('INSERT INTO order_parts (order_id, part_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)');
            
            parts.forEach(part => {
              stmt.run([order_id, part.id, part.quantity, part.price]);
              
              // Update inventory
              db.run(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
                [part.quantity, part.id]
              );
            });
            
            stmt.finalize();
          }

          db.run('COMMIT');
          res.json({ id: order_id, message: "Order created successfully" });
        }
      );
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });
});

// Add detailed error logging
function logError(operation, error) {
  console.error(`Error during ${operation}: ${error.message}`);
  console.error('Stack:', error.stack);
}

// Add proper database cleanup
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      logError('database closing', err);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

// Add inventory threshold checks
app.post('/api/inventory', (req, res) => {
  const { name, category, quantity, min_quantity, price, supplier } = req.body;
  
  db.run(
    'INSERT INTO inventory (name, category, quantity, min_quantity, price, supplier) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, quantity, min_quantity, price, supplier],
    function(err) {
      if (err) {
        logError('adding inventory item', err);
        return res.status(500).json({ error: err.message });
      }

      // Check if quantity is below minimum
      if (quantity <= min_quantity) {
        // You could add notification logic here
        console.warn(`Low inventory alert: ${name} is below minimum quantity`);
      }

      res.json({
        id: this.lastID,
        name,
        category,
        quantity,
        min_quantity,
        price,
        supplier,
        status: quantity <= min_quantity ? 'low' : 'ok'
      });
    }
  );
});