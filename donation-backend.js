const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());

const CSV_FILE = path.join(__dirname, 'donations.csv');

// Ensure CSV file has header
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'amount,datetime\n');
}

app.post('/api/donate', (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const now = new Date();
  const datetime = now.toISOString().replace('T', ' ').substring(0, 19);
  const line = `${amount},${datetime}\n`;
  fs.appendFile(CSV_FILE, line, err => {
    if (err) return res.status(500).json({ error: 'Failed to save' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Donation backend running on http://localhost:${PORT}`);
});
