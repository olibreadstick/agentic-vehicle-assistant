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
      text: "Hi! Ask me about your route plan, schedule, priorities, construction impacts, or travel plans for today.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

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

  async function sendMessageText(textToSend) {
    const trimmedInput = textToSend.trim();

    if (!trimmedInput || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmedInput }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          chatInput: trimmedInput,
          sessionId,
          inputType: "voice_or_text",
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

  function sendMessage() {
    sendMessageText(input);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Voice recognition is not supported in this browser. Try using Chrome.",
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-CA";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessageText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not understand the voice input.",
        },
      ]);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
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
          {listening && <div className="message assistant">Listening...</div>}
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

          <button onClick={startVoiceInput} disabled={loading || listening}>
            🎤
          </button>

          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;