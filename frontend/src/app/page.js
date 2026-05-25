"use client";

import { useState, useRef, useEffect } from "react";

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

  // ── Voice question ─────────────────────────────────
  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true);
    setError("");

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

      const userIndex = messages.length;
      const aiIndex   = messages.length + 1;

      setMessages((prev) => [
        ...prev,
        { role: "user",      text: data.question, isVoice: true  },
        { role: "assistant", text: data.answer,   audioUrl: data.audio_url, autoPlay: true },
      ]);

      updateHistory(data.question, data.answer);

      // Auto-play for voice questions
      if (data.audio_url) {
        setTimeout(() => playAudio(data.audio_url, aiIndex), 200);
      }
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

  // ── Text question ──────────────────────────────────
  const handleTextSend = async () => {
    if (!textInput.trim() || isLoading) return;

    const question = textInput.trim();
    setTextInput("");
    setError("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question, isVoice: false },
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
        { role: "assistant", text: data.answer, audioUrl: data.audio_url, autoPlay: false },
      ]);
      updateHistory(question, data.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
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
              messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>

                  {/* Avatar */}
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0, background: msg.role === "user" ? "#f0fdf4" : "#eff6ff", color: msg.role === "user" ? "#16a34a" : "#1a56db" }}>
                    {msg.role === "user" ? "You" : "AI"}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "16px", fontSize: "14px", lineHeight: "1.6", background: msg.role === "user" ? "#1a56db" : "#f3f4f6", color: msg.role === "user" ? "#fff" : "#111827", borderBottomRightRadius: msg.role === "user" ? "4px" : "16px", borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px" }}>
                    <div>{msg.text}</div>

                    {/* Audio controls for assistant */}
                    {msg.role === "assistant" && msg.audioUrl && (
                      <div style={{ marginTop: "8px" }}>
                        {playingIndex === i ? (
                          <button
                            onClick={stopAudio}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            ⏹ Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => playAudio(msg.audioUrl, i)}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            🔊 Hear answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading */}
            {isLoading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500 }}>AI</div>
                <div style={{ padding: "12px 16px", background: "#f3f4f6", borderRadius: "16px", borderBottomLeftRadius: "4px", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9ca3af", animation: `bounce 1.2s ${delay}s infinite` }} />
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

            {/* Send button */}
            <button
              onClick={handleTextSend}
              disabled={isLoading || isRecording || !textInput.trim()}
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#1a56db", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isLoading || isRecording || !textInput.trim()) ? 0.4 : 1 }}
              title="Send"
            >
              ➤
            </button>

            {/* Mic button */}
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
      `}</style>
    </div>
  );
}