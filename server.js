const express = require("express");
const { Octokit } = require("@octokit/rest");
const XLSX = require("xlsx");

const app = express();
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "ibragimovf";
const REPO = "sherin";
const FILE_PATH = "data.xlsx"; // ⚠️ путь к файлу внутри репо

// сохранить Excel
app.post("/save", async (req, res) => {
  try {
    const data = req.body;

    // создаём excel из массива
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // получаем sha последнего файла
    let fileData;
    try {
      fileData = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: FILE_PATH,
      });
    } catch (e) {
      // если файла нет, sha будет null
      fileData = { data: { sha: null } };
    }

    // коммитим новый excel
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      message: "update data.xlsx",
      content: buffer.toString("base64"),
      sha: fileData.data.sha,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    res.status(500).json({ error: "Ошибка сохранения" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
