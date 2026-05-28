import { useMemo, useState } from "react";
import "./App.css";

const WEBHOOK_URL =
  "https://jbyutse.app.n8n.cloud/webhook/dfdb3619-6ae8-4a9d-8975-b8197ce5aede";

function App() {
  const sessionId = useMemo(() => {
    const existing = localStorage.getItem("agenticVehicleSessionId");

    if (existing) return existing;

    const newSessionId = crypto.randomUUID();
    localStorage.setItem("agenticVehicleSessionId", newSessionId);

    return newSessionId;
  }, []);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me about your route plan, schedule, priorities, weather, construction impacts, or travel plans for today.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function extractAssistantReply(data) {
    if (typeof data === "string") return data;

    return (
      data.reply ||
      data.output ||
      data.text ||
      data.response ||
      data.message ||
      data?.output?.[0]?.content?.[0]?.text ||
      "Sorry, I did not receive a valid response."
    );
  }

  async function sendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || loading) return;

    const userMessage = trimmedInput;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatInput: userMessage,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = extractAssistantReply(data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantReply,
        },
      ]);
    } catch (error) {
      console.error("Agent connection error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Error connecting to the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="chat-container">
        <h1>Agentic Vehicle Assistant</h1>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}

          {loading && <div className="message assistant">Thinking...</div>}
        </div>

        <div className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your plan..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={loading}
          />

          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;