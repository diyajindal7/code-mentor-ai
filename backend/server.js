const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./config/db");
const Chunk = require("./models/Chunk");

app.use(cors());
app.use(express.json());

const ALLOWED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".java",
  ".py",
  ".cpp",
  ".c",
  ".json",
  ".md",
  ".sql"
];

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);



async function getAllFiles(dirPath) {
  let files = [];

  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);

    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {

  if (
    item === ".git" ||
    item === "node_modules" ||
    item === "dist" ||
    item === "build"
  ) {
    continue;
  }

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

    if (
      file.includes("package-lock.json") ||
      file.includes("yarn.lock")
    ) {
      continue;
    }

    try {

      const ext = path.extname(file);

      console.log("Checking:", file);
      console.log("Extension:", ext);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        continue;
      }

      const content = await fs.readFile(
        file,
        "utf-8"
      );

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



function chunkText(text, chunkSize = 1000) {
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(
      text.slice(i, i + chunkSize)
    );
  }

  return chunks;
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

    if (await fs.pathExists(repoPath)) {
  await fs.remove(repoPath);
}

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
console.log("SUMMARY REPO:", repoName);
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


app.post("/chunk-repo", async (req, res) => {
  try {
    const { repoName } = req.body;

    const repoPath = path.join(
      __dirname,
      "uploads",
      repoName
    );

    const files = await readRepositoryFiles(repoPath);

    const chunks = [];

    for (const file of files) {
      const fileChunks = chunkText(file.content);

      fileChunks.forEach((chunk, index) => {
        chunks.push({
          filePath: file.path,
          chunkNumber: index + 1,
          content: chunk,
        });
      });
    }

    res.json({
      success: true,
      totalChunks: chunks.length,
      chunks,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to chunk repository"
    });
  }
});

const PORT = process.env.PORT || 5000;



app.get("/test-gemini", async (req, res) => {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const result = await model.generateContent(
      "Say hello from CodeMentor AI"
    );

   res.json({
  success: true,
  response: result.response.text()
});
  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

console.log("Calling connectDB...");

connectDB();

console.log("connectDB finished");

app.post("/store-repo", async (req, res) => {
  try {

    const { repoName } = req.body;

    const repoPath = path.join(
      __dirname,
      "uploads",
      repoName
    );

    const files = await readRepositoryFiles(
      repoPath
    );


    await Chunk.deleteMany({
  repoName
});
    let savedChunks = 0;

    for (const file of files) {

      const fileChunks = chunkText(
        file.content
      );

      for (
        let i = 0;
        i < fileChunks.length;
        i++
      ) {

        await Chunk.create({
          repoName,
          filePath: file.path,
          chunkNumber: i + 1,
          content: fileChunks[i]
        });

        savedChunks++;
      }
    }

    res.json({
      success: true,
      savedChunks
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});



app.post("/ask-repo", async (req, res) => {
  try {

    const { repoName, question } = req.body;
    const isDatabaseQuestion =
  question.toLowerCase().includes("database") ||
  question.toLowerCase().includes("table") ||
  question.toLowerCase().includes("schema") ||
  question.toLowerCase().includes("sql") ||
  question.toLowerCase().includes("mysql");


const isAuthQuestion =
  question.toLowerCase().includes("login") ||
  question.toLowerCase().includes("signup") ||
  question.toLowerCase().includes("auth") ||
  question.toLowerCase().includes("jwt") ||
  question.toLowerCase().includes("token") ||
  question.toLowerCase().includes("password");

const isFrontendQuestion =
  question.toLowerCase().includes("frontend") ||
  question.toLowerCase().includes("ui") ||
  question.toLowerCase().includes("react") ||
  question.toLowerCase().includes("page") ||
  question.toLowerCase().includes("component");

const isBackendQuestion =
  question.toLowerCase().includes("backend") ||
  question.toLowerCase().includes("api") ||
  question.toLowerCase().includes("route") ||
  question.toLowerCase().includes("controller") ||
  question.toLowerCase().includes("server");

const stopWords = [
  "how",
  "what",
  "where",
  "when",
  "why",
  "are",
  "the",
  "does",
  "is",
  "in",
  "of",
  "to"
];
const keywords = question
  .toLowerCase()
  .split(" ")
  .filter(
    word =>
      word.length > 2 &&
      !stopWords.includes(word)
  );

let allChunks = await Chunk.find({
  repoName
});

if (isDatabaseQuestion) {

  allChunks = allChunks.filter(chunk => {
    const path = chunk.filePath.toLowerCase();

    return (
      path.endsWith(".sql") ||
      path.includes("schema") ||
      path.includes("database") ||
      path.includes("model")
    );
  });

}
else if (isAuthQuestion) {

  allChunks = allChunks.filter(chunk => {
    const path = chunk.filePath.toLowerCase();

    return (
      path.includes("auth") ||
      path.includes("user") ||
      path.includes("login") ||
      path.includes("signup") ||
      path.includes("jwt") ||
      path.includes("middleware")
    );
  });

}
else if (isFrontendQuestion) {

  allChunks = allChunks.filter(chunk => {
    const path = chunk.filePath.toLowerCase();

    return (
      path.includes("frontend") ||
      path.includes("component") ||
      path.includes("page") ||
      path.endsWith(".jsx") ||
      path.endsWith(".tsx")
    );
  });

}
else if (isBackendQuestion) {

  allChunks = allChunks.filter(chunk => {
    const path = chunk.filePath.toLowerCase();

    return (
      path.includes("route") ||
      path.includes("controller") ||
      path.includes("service") ||
      path.includes("middleware") ||
      path.includes("server")
    );
  });

}
console.log("Database:", isDatabaseQuestion);
console.log("Auth:", isAuthQuestion);
console.log("Frontend:", isFrontendQuestion);
console.log("Backend:", isBackendQuestion);

console.log(
  "Relevant Chunks:",
  allChunks.length
);

console.log("Database Question:", isDatabaseQuestion);
console.log("Relevant Chunks Found:", allChunks.length);

allChunks.forEach(chunk => {
  console.log(chunk.filePath);
});

let rankedChunks = allChunks
  .map(chunk => {

    const content =
      chunk.content.toLowerCase();

    let score = 0;

    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score++;
      }
    });

    return {
      ...chunk.toObject(),
      score
    };

  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 15);

 if (allChunks.length <= 20) {
  rankedChunks = allChunks
    .slice(0, 20)
    .map(chunk => ({
      ...chunk.toObject(),
      score: 0
    }));
}

  const context = rankedChunks
  .map(chunk => {

    const cleanPath = chunk.filePath
      .replace(
        path.join(__dirname, "uploads") + "\\",
        ""
      )
      .replaceAll("\\", "/");

    return `
FILE: ${cleanPath}

${chunk.content}
`;
  })
  .join("\n\n");

 const sources = [
  ...new Set(
    rankedChunks.map(chunk =>
      chunk.filePath
        .replace(
          path.join(__dirname, "uploads") + "\\",
          ""
        )
        .replaceAll("\\", "/")
    )
  )
];
    console.log(
  rankedChunks.map(c => ({
    score: c.score
  }))
);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
Repository Context:

${context}

Question:
${question}

Answer based only on the repository context above.Answer ONLY using the repository context.


When possible, mention the exact file names that contain the information.
Do not infer or invent tables, files, functions, or technologies.
Never mention local file system paths such as
C:\Users\...

When referring to files, use only relative paths such as:

backend/models/Chunk.js
backend/routes/requests.js
schema.sql

Keep answers concise and developer-friendly.

If information is not present in the context, reply:

"Not found in repository context."
`;

    const result =
      await model.generateContent(prompt);

   res.json({
  success: true,
  answer: result.response.text(),
  sources
});

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});



app.post("/repo-summary", async (req, res) => {
  try {
 setLoading(true);
    const { repoName } = req.body;

   const allChunks = await Chunk.find({
  repoName
});

const chunks = allChunks
  .sort(() => 0.5 - Math.random())
  .slice(0, 100);


    console.log(
  "Chunks Found:",
  chunks.length
);

    const context = chunks
      .map(chunk => chunk.content)
      .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });
      const sources = [
  ...new Set(
    chunks.map(chunk => chunk.filePath)
  )
];

    const prompt = `
You are analyzing a software repository.
Return ONLY the top 5 findings.
Maximum 200 words.
Use bullet points.
Based ONLY on the provided repository code and files:

1. Project Overview
2. Main Problem Solved
3. Tech Stack
4. Authentication Flow
5. Database Models
6. Key Features
7. Frontend Structure
8. Backend Structure

Do not invent technologies.
If information is missing, say "Not found in provided files".

Repository Content:

${context}
`;

    const result =
      await model.generateContent(prompt);

   res.json({
  success: true,
  summary: result.response.text(),
  sources
});

  } catch (error) {

    console.error(error);

    if (error.status === 429) {

      return res.status(429).json({
        success: false,
        message:
          "Gemini quota exceeded. Please try again later."
      });

    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }finally {
    setLoading(false);
  }

});


app.post("/repo-architecture", async (req, res) => {
  try {
    setLoading(true);

    const { repoName } = req.body;

    const chunks = await Chunk.find({
      repoName
    }).limit(50);

    const context = chunks
      .map(chunk => chunk.content)
      .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

    const prompt = `
Analyze this repository.
Return ONLY the top 5 findings.
Maximum 200 words.
Use bullet points.
Return ONLY:

1. Project Type
2. Architecture Diagram
3. Frontend Stack
4. Backend Stack
5. Database
6. External Services

Keep the entire answer under 300 words.

Use ASCII diagrams.

Be concise.

Repository Content:

${context}
`;

    const result =
      await model.generateContent(prompt);

    res.json({
      success: true,
      architecture:
        result.response.text()
    });

  } catch (error) {

    console.error(error);

    if (error.status === 429) {

      return res.status(429).json({
        success: false,
        message:
          "Gemini quota exceeded. Please try again later."
      });

    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }finally {
    setLoading(false);
  }

});


app.post("/tech-stack", async (req, res) => {
  try {
setLoading(true);
    const { repoName } = req.body;

   const techChunks = await Chunk.find({
  repoName,
  $or: [
    { filePath: { $regex: "package.json", $options: "i" } },
    { filePath: { $regex: "requirements.txt", $options: "i" } },
    { filePath: { $regex: "pom.xml", $options: "i" } },
    { filePath: { $regex: "build.gradle", $options: "i" } },
    { filePath: { $regex: "vite.config", $options: "i" } },
    { filePath: { $regex: "composer.json", $options: "i" } },
    { filePath: { $regex: "go.mod", $options: "i" } }
  ]
});

    const context = techChunks
  .map(chunk => chunk.content)
  .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

   const prompt = `
Analyze the repository.
Return ONLY the top 5 findings.
Maximum 200 words.
Use bullet points.
Return ONLY:

Frontend:
Backend:
Database:
Authentication:
Deployment:
Analyze ONLY the provided repository files.

Return ONLY technologies that are directly visible in:
- package.json
- Dockerfile
- docker-compose.yml
- nginx configs
- AWS configs
- source code imports

Do not guess.

If a technology is not explicitly found,
write "Not Found".

Do NOT list every dependency from package.json.

Only mention major technologies actually used by the project.

Keep the answer under 100 words.
`;

    const result =
      await model.generateContent(prompt);

    res.json({
      success: true,
      techStack:
        result.response.text()
    });

  } catch (error) {

    console.error(error);

    if (error.status === 429) {

      return res.status(429).json({
        success: false,
        message:
          "Gemini quota exceeded. Please try again later."
      });

    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }finally {
    setLoading(false);
  }

});


app.post("/find-bugs", async (req, res) => {
  try {
  setLoading(true);
    const { repoName } = req.body;

    const chunks = await Chunk.find({
      repoName
    }).limit(100);

    const context = chunks
      .map(chunk => chunk.content)
      .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

    const prompt = `
Analyze ONLY the provided code.
Find only the top 5 most likely bugs.

Format:
- File
- Bug
- Fix

Maximum 200 words.
Do not provide generic advice.
Only report issues supported by the code context.

Repository:

${context}
`;

    const result =
      await model.generateContent(prompt);

    res.json({
      success: true,
      bugs: result.response.text()
    });

  } catch (error) {

  console.error(error);

  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error:
        "Gemini API quota exceeded. Please try again later."
    });
  }

  res.status(500).json({
    success: false,
    error: error.message
  });
}
finally {
    setLoading(false);
  }
});


app.post("/security-scan", async (req, res) => {
  try {
  setLoading(true);
    const { repoName } = req.body;

    const chunks = await Chunk.find({
      repoName
    }).limit(100);

    const context = chunks
      .map(chunk => chunk.content)
      .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });

    const prompt = `
Analyze this repository.

Return:
1. Vulnerability
2. Severity
3. Fix

Maximum 5 issues.
Maximum 250 words.

Repository:

${context}
`;

    const result =
      await model.generateContent(prompt);

    res.json({
      success: true,
      report: result.response.text()
    });

  } catch (error) {

    console.error(error);

    if (error.status === 429) {

      return res.status(429).json({
        success: false,
        message:
          "Gemini quota exceeded. Please try again later."
      });

    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
  finally {
    setLoading(false);
  }

});

app.post("/generate-readme", async (req, res) => {
  try {
    setLoading(true);

    const { repoName } = req.body;

    const chunks = await Chunk.find({
      repoName
    }).limit(100);

    const context = chunks
      .map(chunk => chunk.content)
      .join("\n\n");

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });

    const prompt = `
Analyze this repository and generate a professional README.
Return ONLY the top 5 findings.
Maximum 200 words.
Use bullet points.
Include:

# Project Name

## Overview

## Features

## Tech Stack

## Installation

## Usage

## Folder Structure

Only use information present in the repository.

Repository Content:

${context}
`;

    const result =
      await model.generateContent(prompt);

    res.json({
      success: true,
      readme:
        result.response.text()
    });

  }catch (error) {

    console.error(error);

    if (error.status === 429) {

      return res.status(429).json({
        success: false,
        message:
          "Gemini quota exceeded. Please try again later."
      });

    }

    res.status(500).json({
      success: false,
      message: error.message
    });

  }finally {
    setLoading(false);
  }

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});