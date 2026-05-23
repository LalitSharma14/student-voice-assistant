"use client";

import { useState, useRef, useEffect } from "react";

const BACKEND = ""; // empty = uses Next.js proxy (/api/...)

export default function Home() {
  const [messages, setMessages]     = useState([]);
  const [textInput, setTextInput]   = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const chatEndRef        = useRef(null);
  const audioRef          = useRef(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send audio blob to backend ─────────────────────────
  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const res = await fetch("/api/ask/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }

      const data = await res.json();
      // data = { question, language, answer, audio_url }

      setMessages((prev) => [
        ...prev,
        { role: "user",      text: data.question },
        { role: "assistant", text: data.answer   },
      ]);

      // Play the TTS audio returned by backend
      if (data.audio_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(`/api/${data.audio_url}`);
        audioRef.current.play();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Voice recording ────────────────────────────────────
  const startRecording = async () => {
    setError("");
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

  // ── Text send (wraps text as audio via Web Speech, or just shows text) ──
  // NOTE: Your backend only accepts audio. For text, we use browser TTS to
  // convert to audio, OR you can add a /ask-text/ endpoint later.
  // For now, text input sends a message visually only (no backend call).
  const handleTextSend = async () => {
    if (!textInput.trim() || isLoading) return;

    const question = textInput.trim();
    setTextInput("");
    setError("");
    setIsLoading(true);

    // Optimistically show the user's question immediately
    setMessages((prev) => [...prev, { role: "user", text: question }]);

    try {
      const formData = new FormData();
      formData.append("question", question);

      const res = await fetch("/api/ask-text/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);

      // Play TTS audio
      if (data.audio_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(`/api/${data.audio_url}`);
        audioRef.current.play();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Voice Assistant</h1>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
              Login
            </button>
            <button className="bg-green-500 px-4 py-2 rounded-lg font-semibold">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-5xl font-bold text-blue-600 mb-4 text-center">
          Welcome Student 👋
        </h1>
        <p className="text-gray-700 text-lg mb-8 text-center">
          Ask anything using voice or text
        </p>

        <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-lg">

          {/* Chat Box */}
          <div className="h-64 border rounded-lg p-4 overflow-y-auto mb-4 bg-gray-50">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500">
                  Press 🎤 and ask your question in Hindi or English...
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg w-fit max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-blue-100 text-gray-800 ml-auto"
                        : "bg-green-100 text-gray-800"
                    }`}
                  >
                    <p>
                      <span className="font-bold">
                        {msg.role === "user" ? "You: " : "Assistant: "}
                      </span>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
                  ⏳ Thinking... please wait
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Recording status */}
          {isRecording && (
            <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              <span className="animate-pulse text-lg">🔴</span>
              Recording... Press 🎤 again to stop and send
            </div>
          )}

          {/* Input Section */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask your question... (use 🎤 for voice)"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextSend(); }}
              disabled={isLoading || isRecording}
              className="flex-1 border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 placeholder:text-gray-600"
            />

            <button
              onClick={handleTextSend}
              disabled={isLoading || isRecording || !textInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              Send
            </button>

            {/* Mic button — hold to record, press again to stop */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`transition text-white px-5 py-3 rounded-lg text-2xl disabled:opacity-50 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              🎤
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-400 text-center">
            Supports Hindi, English, and Hinglish • Class 5–10
          </p>
        </div>
      </div>
    </div>
  );
}