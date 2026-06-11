import { useState } from "react";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [response, setResponse] = useState("");

  const analyzeRepo = async () => {
    const res = await fetch("http://localhost:5000/clone-repo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoUrl,
      }),
    });

    const data = await res.json();
    setResponse(data.message);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>CodeMentor AI 🚀</h1>

      <input
        type="text"
        placeholder="Enter GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{
          width: "400px",
          padding: "10px",
        }}
      />

      <button
        onClick={analyzeRepo}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Analyze
      </button>

      <h3>{response}</h3>
    </div>
  );
}

export default App;