import { useMemo, useState } from "react";
import "./App.css";
import { useEffect } from "react";

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

  useEffect(() => {
  speakText(
    "Hi! Ask me about your route plan, schedule, priorities, construction impacts, or travel plans for today."
  );
}, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  function extractAssistantReply(data) {
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    data = data[0];
  }

  return (
    data.reply ||
    data.user_message ||
    data.output ||
    data.text ||
    data.response ||
    data.message ||
    data?.json?.reply ||
    data?.json?.user_message ||
    data?.output?.[0]?.content?.[0]?.text ||
    "Sorry, I did not receive a valid response."
  );
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    console.warn("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-CA";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
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

      const rawData = await response.json();
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      const assistantReply = extractAssistantReply(data);

      const missingEvents =
      data.missing_location_events ||
      data.json?.missing_location_events ||
      [];

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: assistantReply,
        missing_location_events: missingEvents,
      },
    ]);

    const speechText =
      missingEvents.length > 0
        ? assistantReply +
          " " +
          missingEvents
            .map(
              (event) =>
                `${event.title}, for ${event.person}, at ${event.start_time_display}.`
            )
            .join(" ")
        : assistantReply;

    speakText(speechText);
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

  function speakText(text) {
      if (!("speechSynthesis" in window)) {
        console.warn("Text-to-speech is not supported in this browser.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-CA";
      utterance.rate = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    }

      return (
        <div className="page">
          <div className="chat-container">
            <h1>Agentic Vehicle Assistant</h1>

            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div>{msg.text}</div>

    {msg.missing_location_events?.length > 0 && (
      <div className="missing-events">
        {msg.missing_location_events.map((event, i) => (
          <div key={i} className="missing-event">
            <div>
              • {event.title} ({event.person} at {event.start_time_display})
            </div>

            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit event
              </a>
            )}
          </div>
        ))}
      </div>
    )}
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
          <button onClick={stopSpeaking}>
            Stop voice
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;