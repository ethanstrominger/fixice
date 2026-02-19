// Express backend for donation logging to PostgreSQL
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
// Load environment variables from .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection config (set these in your Render environment)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this env var
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Check that the fixice database exists and log result
async function checkDatabaseExists() {
  try {
    // Query current database name
    const result = await pool.query('SELECT current_database()');
    const dbName = result.rows[0].current_database;
    if (dbName === 'fixice') {
      console.log('Connected to fixice database.');
    } else {
      console.warn(`Connected to database: ${dbName} (expected: fixice)`);
    }
  } catch (err) {
    console.error('Could not verify fixice database:', err.message);
  }
}
checkDatabaseExists();

app.use(bodyParser.json());

// Create table if not exists (run once at startup)
pool.query(`CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);


app.post('/api/log-donation', async (req, res) => {
  const { amount, frequency } = req.body;
  if (!amount || !frequency) return res.status(400).json({ error: 'Missing amount or frequency' });
  try {
    await pool.query(
      'INSERT INTO donations (amount, frequency) VALUES ($1, $2)',
      [amount, frequency]
    );
    console.log(`Donation logged: amount=${amount}, frequency=${frequency}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error inserting donation:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});

// Endpoint to list all donations
app.get('/api/list-donations', async (req, res) => {
  try {
    const result = await pool.query('SELECT amount, frequency, created_at FROM donations ORDER BY id DESC');
    // Calculate total
    const total = result.rows.reduce((sum, d) => sum + Number(d.amount), 0);
    res.json({ donations: result.rows, total });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Serve static files (adjust path as needed)
app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
