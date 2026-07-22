# 🚀 CodeMentor AI

> **AI-Powered Codebase Assistant for understanding, analyzing, and documenting GitHub repositories using Retrieval-Augmented Generation (RAG).**

CodeMentor AI helps developers quickly understand unfamiliar codebases by combining semantic code search, vector embeddings, and Large Language Models. Instead of manually exploring hundreds of files, users can ask questions in natural language and receive context-aware answers grounded in the repository's source code.

---

## ✨ Features

* 🤖 AI-powered GitHub repository analysis
* 🔍 Semantic code search using vector embeddings
* 💬 Natural language Q&A over codebases
* 📝 Automatic README generation
* 📄 Intelligent code summarization
* 🐞 AI-assisted bug detection
* 🔒 Security insight generation
* 🧠 Context-aware Retrieval-Augmented Generation (RAG)
* 📂 Repository indexing with semantic chunking
* ⚡ Fast similarity search using ChromaDB

---

## 🛠 Tech Stack

### Frontend

* React.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* ChromaDB (Vector Database)

### AI & Machine Learning

* Google Gemini API
* LangChain
* Vector Embeddings
* Retrieval-Augmented Generation (RAG)

---

## ⚙️ How It Works

1. User submits a GitHub repository URL.
2. The repository is cloned and scanned.
3. Source code is split into semantic chunks.
4. Each chunk is converted into vector embeddings.
5. Embeddings are stored in ChromaDB.
6. User queries are embedded and matched against indexed code.
7. Relevant code context is retrieved.
8. Gemini generates an accurate, repository-aware response.

---

## 🚀 Key Highlights

* Indexed **5,000+ code chunks** for semantic search.
* Implemented a complete **Retrieval-Augmented Generation (RAG)** pipeline.
* Reduced manual code exploration through intelligent semantic retrieval.
* Generated AI-powered documentation, summaries, and repository insights.
* Produced context-aware responses using LangChain and Gemini.

---

## 📂 Core Capabilities

### 🔍 Semantic Repository Search

Understand large repositories instantly through embedding-based retrieval.

### 📖 Code Summarization

Generate concise explanations of files, folders, classes, and functions.

### 📝 README Generation

Automatically create structured project documentation based on repository contents.

### 🐞 Bug Detection

Identify potential implementation issues and code smells using LLM reasoning.

### 🔒 Security Analysis

Highlight common security risks and provide improvement suggestions.

### 💬 Repository Chat

Ask questions like:

* How does authentication work?
* Explain the folder structure.
* Where is JWT implemented?
* What database models exist?
* Explain the API flow.
* Identify potential bugs.
* Generate a README for this repository.
* Are there any security vulnerabilities?

---

## 🏗 Architecture

```text
GitHub Repository
        │
        ▼
Repository Cloning
        │
        ▼
Code Parsing & Chunking
        │
        ▼
Vector Embeddings
        │
        ▼
ChromaDB
        │
        ▼
Semantic Retrieval
        │
        ▼
Gemini API
        │
        ▼
AI-Powered Responses
```

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/CodeMentor-AI.git

cd CodeMentor-AI

npm install

npm run dev
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_uri

GOOGLE_API_KEY=your_gemini_api_key
```

---

## 🎯 Use Cases

* Developer onboarding
* Open-source contribution
* Technical interviews
* Repository documentation
* Code reviews
* Software architecture exploration
* Security analysis
* Learning unfamiliar projects

---

## 🔮 Future Enhancements

* Multi-repository indexing
* Team workspaces
* GitHub OAuth
* Pull request reviews
* Repository comparison
* Code dependency visualization
* PDF documentation export
* Multi-LLM support

---

## 👩‍💻 Author

**Diya Jindal**

Computer Science Engineering Student passionate about Backend Development, AI Applications, Large Language Models, and Scalable Software Engineering.
