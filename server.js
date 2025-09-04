const express = require("express");
const XLSX = require("xlsx");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors()); // разрешаем запросы с Netlify
app.use(express.json());

// сохраняем Excel
app.post("/save", (req, res) => {
  try {
    const data = req.body;
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, path.join(__dirname, "data.xlsx"));
    res.sendStatus(200);
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    res.status(500).send("Ошибка сохранения файла");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
