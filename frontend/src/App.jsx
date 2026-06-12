import { useState } from "react";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const analyzeRepo = async () => {
    try {
      setLoading(true);

      const cloneRes = await fetch(
        "http://localhost:5000/clone-repo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl,
          }),
        }
      );

      const cloneData = await cloneRes.json();

      setRepoName(cloneData.repoName);

      await fetch(
        "http://localhost:5000/store-repo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoName: cloneData.repoName,
          }),
        }
      );

      alert("Repository analyzed!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/ask-repo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoName,
            question,
          }),
        }
      );

      const data = await res.json();

      setAnswer(data.answer);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>CodeMentor AI 🚀</h1>

      <input
        type="text"
        placeholder="GitHub Repository URL"
        value={repoUrl}
        onChange={(e) =>
          setRepoUrl(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <button
        onClick={analyzeRepo}
      >
        Analyze Repository
      </button>

      <hr />

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
        }}
      />

      <button
        onClick={askQuestion}
        style={{
          marginTop: "10px",
        }}
      >
        Ask AI
      </button>

      {loading && (
        <p>Loading...</p>
      )}

      {answer && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
          }}
        >
          <h3>AI Answer</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;