"use client";

import { useState, useRef, useEffect } from "react";

// ── Typewriter hook ────────────────────────────────────────
function useTypewriter(text, speed = 120) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);

    const words = text.split(" ");
    let index = 0;

    const interval = setInterval(() => {
      if (index >= words.length) {
        setDone(true);
        clearInterval(interval);
        return;
      }

      const currentWord = words[index];
      index += 1;

      setDisplayed((prev) =>
        prev ? `${prev} ${currentWord}` : currentWord
      );
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ── Assistant bubble with typewriter ──────────────────────
function AssistantBubble({ msg, index, playingIndex, playAudio, stopAudio }) {
  const { displayed, done } = useTypewriter(msg.typing ? msg.text : "");
  const [audioReady, setAudioReady] = useState(false);
  const ttsStarted = useRef(false);

  useEffect(() => {
    if (done && msg.audioUrl) setAudioReady(true);
  }, [done, msg.audioUrl]);

  useEffect(() => {
    if (!msg.typing && msg.audioUrl && !ttsStarted.current) {
      ttsStarted.current = true;
      setAudioReady(true);
    }
  }, [msg.audioUrl, msg.typing]);

  const textToShow = msg.typing ? displayed : msg.text;

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0, background: "#eff6ff", color: "#1a56db" }}>
        AI
      </div>
      <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "16px", borderBottomLeftRadius: "4px", fontSize: "14px", lineHeight: "1.6", background: "#f3f4f6", color: "#111827" }}>
        <div>
          {textToShow}
          {msg.typing && !done && (
            <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#1a56db", marginLeft: "3px", verticalAlign: "middle", animation: "blink 0.8s infinite" }} />
          )}
        </div>

        {msg.typing && done && !msg.audioUrl && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⏳</span> Preparing audio...
          </div>
        )}

        {audioReady && msg.audioUrl && (
          <div style={{ marginTop: "8px" }}>
            {playingIndex === index ? (
              <button
                onClick={stopAudio}
                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                ⏹ Stop
              </button>
            ) : (
              <button
                onClick={() => playAudio(msg.audioUrl, index)}
                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                🔊 Hear answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages]         = useState([]);
  const [history, setHistory]           = useState([]);
  const [textInput, setTextInput]       = useState("");
  const [isRecording, setIsRecording]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");
  const [playingIndex, setPlayingIndex] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const chatEndRef       = useRef(null);
  const audioRef         = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingIndex(null);
  };

  const playAudio = (audioUrl, index) => {
    stopAudio();
    const audio = new Audio(`/api/${audioUrl}`);
    audioRef.current = audio;
    setPlayingIndex(index);
    audio.play();
    audio.onended = () => setPlayingIndex(null);
  };

  const updateHistory = (question, answer) => {
    setHistory((prev) => [
      ...prev,
      { role: "user",      content: question },
      { role: "assistant", content: answer   },
    ]);
  };

  const clearConversation = () => {
    stopAudio();
    setMessages([]);
    setHistory([]);
    setError("");
  };

  // ── Text question ──────────────────────────────────
  const handleTextSend = async () => {
    if (!textInput.trim() || isLoading) return;

    const question = textInput.trim();
    const assistantId = crypto.randomUUID();

    setTextInput("");
    setError("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: question, isVoice: false },
    ]);

    const formData = new FormData();
    formData.append("question", question);
    formData.append("history", JSON.stringify(history));

    try {
      const res = await fetch("/api/ask-text/", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id:       assistantId,
          role:     "assistant",
          text:     data.answer,
          audioUrl: null,
          typing:   true,
        },
      ]);

      updateHistory(question, data.answer);
      setIsLoading(false);

      // TTS in background simultaneously
      const ttsFormData = new FormData();
      ttsFormData.append("text", data.answer);
      ttsFormData.append("language", data.language || "en");

      try {
        const ttsRes = await fetch("/api/tts/", { method: "POST", body: ttsFormData });
        if (!ttsRes.ok) return;
        const ttsData = await ttsRes.json();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, audioUrl: ttsData.audio_url }
              : msg
          )
        );
      } catch (ttsError) {
        console.error("TTS failed:", ttsError);
      }

    } catch (e) {
      setError(e.message);
      setIsLoading(false);
    }
  };

  // ── Voice question ─────────────────────────────────
  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true);
    setError("");

    const assistantId = crypto.randomUUID();

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("history", JSON.stringify(history));

    try {
      const res = await fetch("/api/ask/", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
      const data = await res.json();

      setMessages((prev) => {
        const aiIndex = prev.length + 1;
        const updated = [
          ...prev,
          { id: crypto.randomUUID(), role: "user",      text: data.question, isVoice: true  },
          { id: assistantId,         role: "assistant",  text: data.answer,   audioUrl: data.audio_url, typing: false },
        ];

        // Auto-play after state is set using the correct index
        if (data.audio_url) {
          setTimeout(() => playAudio(data.audio_url, aiIndex), 200);
        }

        return updated;
      });

      updateHistory(data.question, data.answer);

    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setError("");
    stopAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current   = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        sendAudioToBackend(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{ background: "#1a56db", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>
          🎓 Student Voice Assistant
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer" }}>
            Login
          </button>
          <button style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "none", background: "#fff", color: "#1a56db", cursor: "pointer" }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 500, color: "#111827", marginBottom: "6px" }}>
            Welcome, Student 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Ask anything in Hindi, English, or Hinglish — Class 5 to 10
          </p>
        </div>

        {/* Chat Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>

          {/* Card Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>AI Tutor</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearConversation}
                style={{ fontSize: "12px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px" }}
              >
                🗑 Clear chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ height: "380px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
                <p style={{ fontSize: "13px" }}>Press the mic or type to start asking</p>
              </div>
            ) : (
              messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={msg.id} style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexDirection: "row-reverse" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0, background: "#f0fdf4", color: "#16a34a" }}>
                      You
                    </div>
                    <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "16px", borderBottomRightRadius: "4px", fontSize: "14px", lineHeight: "1.6", background: "#1a56db", color: "#fff" }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <AssistantBubble
                    key={msg.id}
                    msg={msg}
                    index={i}
                    playingIndex={playingIndex}
                    playAudio={playAudio}
                    stopAudio={stopAudio}
                  />
                )
              )
            )}

            {isLoading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500 }}>AI</div>
                <div style={{ padding: "12px 16px", background: "#f3f4f6", borderRadius: "16px", borderBottomLeftRadius: "4px", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((delay) => (
                    <div key={delay} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9ca3af", animation: `bounce 1.2s ${delay}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Recording bar */}
          {isRecording && (
            <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626" }} />
              Recording... press mic again to stop and send
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Type your question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextSend(); }}
              disabled={isLoading || isRecording}
              style={{ flex: 1, padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "24px", fontSize: "14px", color: "#111827", background: "#f9fafb", outline: "none" }}
            />
            <button
              onClick={handleTextSend}
              disabled={isLoading || isRecording || !textInput.trim()}
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#1a56db", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isLoading || isRecording || !textInput.trim()) ? 0.4 : 1 }}
              title="Send"
            >
              ➤
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              style={{ width: "38px", height: "38px", borderRadius: "50%", border: "none", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: isRecording ? "#dc2626" : "#f0fdf4", color: isRecording ? "#fff" : "#16a34a", opacity: isLoading ? 0.4 : 1 }}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              🎤
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", padding: "8px 16px", borderTop: "1px solid #f3f4f6" }}>
            Supports Hindi · English · Hinglish · and more Indian languages
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}