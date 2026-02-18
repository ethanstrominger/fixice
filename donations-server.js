// Node.js Express server to handle donation saving
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8081;
app.use(express.json());

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.post('/save-donation', (req, res) => {
  const { amount } = req.body;
  if (typeof amount === 'number' && amount > 0) {
    const line = `${new Date().toISOString()} $${amount}\n`;
    const filePath = path.join(__dirname, 'donations.txt');
    fs.appendFile(filePath, line, err => {
      if (err) return res.status(500).send('Error saving donation');
      res.send('Donation saved');
    });
  } else {
    res.status(400).send('Invalid amount');
  }
});

app.listen(PORT, () => {
  console.log(`Donation server running on port ${PORT}`);
  console.log(`Static content served from ${distPath}`);
});
