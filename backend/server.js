const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const app = express();

app.use(cors());
app.use(express.json());


async function getAllFiles(dirPath) {
  let files = [];

  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);

    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const nestedFiles = await getAllFiles(fullPath);
      files = [...files, ...nestedFiles];
    } else {
      files.push(fullPath);
    }
  }

  return files;
}



async function readRepositoryFiles(repoPath) {
  const files = await getAllFiles(repoPath);

  const fileContents = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf-8");

      fileContents.push({
        path: file,
        content,
      });
    } catch (error) {
      console.log(`Skipping file: ${file}`);
    }
  }

  return fileContents;
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodeMentor AI Backend Running 🚀",
  });
});

app.post("/clone-repo", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
    }

    const repoName = repoUrl
      .split("/")
      .pop()
      .replace(".git", "");

    const repoPath = path.join(__dirname, "uploads", repoName);

    const git = simpleGit();

    await git.clone(repoUrl, repoPath);

    res.json({
      success: true,
      message: "Repository cloned successfully!",
      repoName,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to clone repository",
    });
  }
});



app.post("/scan-repo", async (req, res) => {
  try {
    const { repoName } = req.body;

    const repoPath = path.join(
      __dirname,
      "uploads",
      repoName
    );

    const files = await getAllFiles(repoPath);

    res.json({
      success: true,
      totalFiles: files.length,
      files,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to scan repository",
    });
  }
});



app.post("/read-repo", async (req, res) => {
  try {
    const { repoName } = req.body;

    const repoPath = path.join(
      __dirname,
      "uploads",
      repoName
    );

    const files = await readRepositoryFiles(repoPath);

    res.json({
      success: true,
      totalFiles: files.length,
      files,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to read repository",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});