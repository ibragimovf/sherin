const express = require("express");
const { Octokit } = require("@octokit/rest");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "ibragimovf";
const REPO = "sherin";
const FILE_PATH = "https://github.com/ibragimovf/sherin/data.xlsx"; // путь в репо

// сохранить Excel
app.post("/save", async (req, res) => {
  try {
    const data = req.body;
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // получаем sha последнего файла
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
    });

    // коммитим новый файл
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      message: "update data.xlsx",
      content: buffer.toString("base64"),
      sha: fileData.sha,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сохранения" });
  }
});

app.listen(3000, () => console.log("Сервер запущен"));
