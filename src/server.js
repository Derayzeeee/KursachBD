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

// Database initialization with additional fields
function initDatabase() {
  db.serialize(() => {
    // Add created_by and updated_by fields
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
    preferredContactMethod,
    created_at,
    created_by
  } = req.body;

  // Format the date properly
  const formattedCreatedAt = formatDate(created_at);
  const currentUser = created_by || 'system';

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
      formattedCreatedAt,
      currentUser,
      formattedCreatedAt,
      currentUser
    ],
    function(err) {
      if (err) {
        console.error('Error creating client:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Return the created client data
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
    created_at,
    updated_by
  } = req.body;

  const formattedCreatedAt = formatDate(created_at);
  const currentUser = updated_by || 'system';
  const updatedAt = formatDate(new Date().toISOString());

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
      formattedCreatedAt,
      updatedAt,
      currentUser,
      req.params.id
    ],
    (err) => {
      if (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Return the updated client data
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

// Get client by ID
app.get('/api/clients/:id', (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching client:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(row);
  });
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