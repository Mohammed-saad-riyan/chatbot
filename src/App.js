import React, { useState, useEffect } from "react";
import { pdfContent } from "./pdfContent.js";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/google/flan-t5-large";
const HF_API_KEY = "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"; // Replace with your actual API key

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const findRelevantContent = (query) => {
    const keywords = query.toLowerCase().split(" ");
    let relevantContent = "";

    Object.entries(pdfContent).forEach(([filename, content]) => {
      const lowerContent = content.toLowerCase();
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        relevantContent += `${content}\n\n`;
      }
    });

    return relevantContent.trim();
  };

  const generateAnswer = async (query, context) => {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Answer the following question based on the given context. If the answer is not in the context, say "Sorry, I don't have enough information to answer that right now, but I'd be happy to help if you could provide a bit more detail!"

Context: ${context}

Question: ${query}

Answer:`,
      }),
    });

    const result = await response.json();
    return result[0].generated_text;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const relevantContent = findRelevantContent(query);

    if (relevantContent) {
      try {
        const generatedAnswer = await generateAnswer(query, relevantContent);
        setAnswer(generatedAnswer);
      } catch (error) {
        console.error("Error generating answer:", error);
        setAnswer(
          "Sorry, there was an error generating the answer. Please try again."
        );
      }
    } else {
      setAnswer("Sorry, I don't have enough information to answer that right now, but I'd be happy to help if you could provide a bit more detail!");
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <h1>MJCET AWS Cloud Club Q&A System</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Ask a question about MJCET AWS Cloud Club"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
      {answer && (
        <div>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
