// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());        // разрешаем запросы (если фронт будет дергать сервис напрямую)
app.use(express.json());

// health
app.get('/health', (req, res) => res.send('ok'));

// отдать data.xlsx
app.get('/data.xlsx', (req, res) => {
  const filePath = path.join(__dirname, 'data.xlsx');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).send('data.xlsx not found');
});

// сохранить (ожидает массив массивов, AOA)
app.post('/save', (req, res) => {
  try {
    const data = req.body;
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const filePath = path.join(__dirname, 'data.xlsx');
    XLSX.writeFile(wb, filePath);
    console.log(`Saved ${filePath}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
