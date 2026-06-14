import { useState } from "react";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
const [summary, setSummary] = useState("");
  useState("");
const [readme, setReadme] = useState("");
const [architecture, setArchitecture] =
  useState("");
const [techStack, setTechStack] = useState("");
const [bugs, setBugs] = useState("");
const [securityReport, setSecurityReport] =
  useState("");

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



  const generateSummary = async () => {

  try {

    setLoading(true);

    const res = await fetch(
      "http://localhost:5000/repo-summary",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          repoName,
        }),
      }
    );

    const data = await res.json();

    setSummary(data.summary);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
  console.log("Repo Name:", repoName);
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
setSources(data.sources || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const generateArchitecture =
  async () => {

    const res = await fetch(
      "http://localhost:5000/repo-architecture",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          repoName,
        }),
      }
    );

    const data =
      await res.json();

    setArchitecture(
      data.architecture
    );
};





const detectTechStack =
  async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/tech-stack",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            repoName,
          }),
        }
      );

      const data =
        await res.json();

      setTechStack(
        data.techStack
      );

    } catch (error) {

      console.error(error);

    }
};

const findBugs = async () => {

  const res = await fetch(
    "http://localhost:5000/find-bugs",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        repoName,
      }),
    }
  );

  const data = await res.json();

  setBugs(data.bugs);
};


const securityScan = async () => {

  try {

    const res = await fetch(
      "http://localhost:5000/security-scan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          repoName,
        }),
      }
    );

    const data =
      await res.json();

    setSecurityReport(
      data.report
    );

  } catch (error) {

    console.error(error);

  }
};

const generateReadme = async () => {

  try {

    const res = await fetch(
      "http://localhost:5000/generate-readme",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          repoName,
        }),
      }
    );

    const data =
      await res.json();

    setReadme(
      data.readme
    );

  } catch (error) {

    console.error(error);

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



<button
  onClick={generateSummary}
  style={{
    marginLeft: "10px"
  }}
>
  Generate Summary
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

          <h3>Sources</h3>

<ul>
  {sources.map((source, index) => (
    <li key={index}>{source}</li>
  ))}
</ul>

        </div>
      )}


      {summary && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Repository Summary</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {summary}
    </pre>
  </div>
)}

<button
  onClick={generateArchitecture}
  style={{
    marginLeft: "10px"
  }}
>
  Generate Architecture
</button>




{architecture && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Architecture</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {architecture}
    </pre>
  </div>
)}
<button
  onClick={detectTechStack}
  style={{
    marginLeft: "10px"
  }}
>
  Detect Tech Stack
</button>

{techStack && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Tech Stack</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {techStack}
    </pre>
  </div>
)}


<button
  onClick={findBugs}
  style={{
    marginLeft: "10px"
  }}
>
  Find Bugs
</button>

{bugs && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Bug Analysis</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {bugs}
    </pre>
  </div>
)}



<button
  onClick={securityScan}
  style={{
    marginLeft: "10px"
  }}
>
  Security Scan
</button>

{securityReport && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Security Report</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {securityReport}
    </pre>
  </div>
)}

<button
  onClick={generateReadme}
  style={{
    marginLeft: "10px"
  }}
>
  Generate README
</button>

{readme && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ddd",
    }}
  >
    <h3>Generated README</h3>

    <pre
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {readme}
    </pre>
  </div>
)}

    </div>
  );
}




export default App;