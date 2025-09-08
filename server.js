const express = require("express");
const { Octokit } = require("@octokit/rest");
const XLSX = require("xlsx");

const app = express();
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "ibragimovf";
const REPO = "sherin";
const FILE_PATH = "data.xlsx"; // путь внутри репозитория

app.post("/save", async (req, res) => {
  try {
    const data = req.body;

    // создаём Excel
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // получаем SHA
    let sha = null;
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: FILE_PATH,
      });
      sha = fileData.sha;
      console.log("Текущий SHA:", sha);
    } catch (e) {
      console.log("Файл ещё не существует, создаём новый");
    }

    // пушим изменения
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      message: "update data.xlsx",
      content: buffer.toString("base64"),
      sha: sha || undefined,
    });

    console.log("Файл успешно сохранён в GitHub:", response.status);
    res.json({ ok: true });
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    res.status(500).json({ error: "Ошибка сохранения" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
