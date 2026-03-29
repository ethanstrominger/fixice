#!/usr/bin/env node

// Express backend for donation logging to PostgreSQL

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
// Load environment variables from .env in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const app = express();
console.log("Starting server with NODE_ENV =", process.env.NODE_ENV);

// Allow cross-origin requests from the frontend
app.use(cors({
  origin: [
    "https://fixice.org",
    "https://www.fixice.org",
    "http://localhost:8080",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
const port = process.env.PORT || 3000;

// PostgreSQL connection config (set these in your Render environment)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this env var
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Check that the fixice database exists and log result
async function checkDatabaseExists() {
  try {
    // Query current database name
    const result = await pool.query("SELECT current_database()");
    const dbName = result.rows[0].current_database;
    if (dbName === "fixice") {
      console.log("Connected to fixice database.");
    } else {
      console.warn(`Connected to database: ${dbName} (expected: fixice)`);
    }
  } catch (err) {
    console.error("Could not verify fixice database:", err.message);
  }
}
checkDatabaseExists();

app.use(bodyParser.json());

// Create tables if not exist (run once at startup)
pool.query(`CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`).catch(err => console.error('Error creating donations table:', err.message));


// Create analytics table if not exists
pool.query(`CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  ip_address TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`).catch(err => console.error('Error creating analytics table:', err.message));

// Add ip_address column to analytics if it does not exist (for deployment/migration)
pool.query(`ALTER TABLE analytics ADD COLUMN IF NOT EXISTS ip_address TEXT`).catch(err => {
  if (!/duplicate column/i.test(err.message)) {
    console.error('Error adding ip_address column to analytics:', err.message);
  }
});

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

async function logDonation(req, res) {
  const { amount, frequency } = req.body;
  if (!amount || !frequency)
    return res.status(400).json({ error: "Missing amount or frequency" });
  try {
    await pool.query(
      "INSERT INTO donations (amount, frequency) VALUES ($1, $2)",
      [amount, frequency],
    );
    console.log(`Donation logged: amount=${amount}, frequency=${frequency}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error inserting donation:", err.message);
    res.status(500).json({ error: "DB error" });
  }
}

async function listDonations(req, res) {
  try {
    const result = await pool.query(
      "SELECT amount, frequency, created_at FROM donations ORDER BY id DESC",
    );
    const total = result.rows.reduce((sum, d) => sum + Number(d.amount), 0);
    res.json({ donations: result.rows, total });
  } catch (err) {
    console.error('Error listing donations:', err.message);
    res.status(500).json({ error: "DB error" });
  }
}

// Health check / keep-alive endpoint — ping this every 10 min to prevent Render cold starts
app.get("/ping", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.post("/api/log-donation", logDonation);
app.get("/api/list-donations", listDonations);
// Record API: logs the url query parameter
async function handleRecordApi(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  // Get IP address (works behind proxies like Render)
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  if (Array.isArray(ip)) ip = ip[0];
  if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  try {
    await pool.query(
      'INSERT INTO analytics (url, ip_address) VALUES ($1, $2)',
      [url, ip]
    );
    console.log(`[RECORD] url = `, url, 'ip=', ip);
    res.json({ success: true });
  } catch (err) {
    console.error('Error recording analytics:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
}
app.get('/api/record', handleRecordApi);

// Serve static files (adjust path as needed)

function donateAmountRedirect(_req, res) {
  res.redirect('https://checkout.square.site/merchant/ML58Q933VJ8VR/checkout/G3FQAZYAV4Q6HURVAC7WA4ZZ');
}
app.get('/api/donate/', donateAmountRedirect);

app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
