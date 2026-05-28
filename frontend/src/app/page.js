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
  const [isTranscribing, setIsTranscribing] = useState(false); // STT in progress
  const [error, setError]               = useState("");
  const [playingIndex, setPlayingIndex] = useState(null);

  // ── Student learning profile ───────────────────────
  const [classLevel, setClassLevel]         = useState("5");
  const [board, setBoard]                   = useState("CBSE");
  const [answerLanguage, setAnswerLanguage] = useState("en");
  const [profileCompleted, setProfileCompleted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const chatEndRef       = useRef(null);
  const audioRef         = useRef(null);
  const abortControllerRef = useRef(null);  // for cancelling fetch
  const cancelledRef       = useRef(false); // track if user cancelled

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null; // remove listener before pausing
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingIndex(null);
  };

  const playAudio = (audioUrl, index) => {
    // Stop any currently playing audio first
    stopAudio();

    const audio = new Audio(`/api/${audioUrl}`);
    audioRef.current = audio;

    // Small delay to let browser settle after pause()
    setTimeout(() => {
      // Check audio is still the current one (user may have cancelled)
      if (audioRef.current !== audio) return;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingIndex(index);
            audio.onended = () => setPlayingIndex(null);
          })
          .catch((e) => {
            // Ignore AbortError — it means play was interrupted intentionally
            if (e.name !== "AbortError") {
              console.error("Audio play error:", e);
            }
            setPlayingIndex(null);
          });
      }
    }, 80);
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

  // ── Cancel ongoing voice processing ───────────────
  const cancelProcessing = () => {
    cancelledRef.current = true;

    // Abort the fetch request to backend
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setIsTranscribing(false);
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
    formData.append("class_level", classLevel);
    formData.append("board", board);
    formData.append("answer_language", answerLanguage);

    try {
      const res = await fetch("/api/ask-text", { method: "POST", body: formData });
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

      // TTS in background
      const ttsFormData = new FormData();
      ttsFormData.append("text", data.answer);
      ttsFormData.append("language", data.language || "en");

      try {
        const ttsRes = await fetch("/api/tts", { method: "POST", body: ttsFormData });
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

  // ── Voice: stop recording, show text in input box ─
  const stopRecordingAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;

    // collect chunks and transcribe
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const stream = mediaRecorderRef.current?.stream;
      if (stream) stream.getTracks().forEach((t) => t.stop());

      setIsRecording(false);
      setIsTranscribing(true);
      cancelledRef.current = false;

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("history", JSON.stringify(history));

      try {
        // Step 1: Send to /ask/ just for STT — get transcribed text back
        const res = await fetch("/api/ask", {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (cancelledRef.current) return; // user cancelled

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Server error");
        }

        const data = await res.json();

        setIsTranscribing(false);

        // Step 2: Put transcribed question in input box for user to review
        setTextInput(data.question);

        // Step 3: Store full response data temporarily
        // so when user clicks send we use the already-computed answer
        // Store it in a ref so handleTextSend can access it
        pendingVoiceDataRef.current = data;

      } catch (e) {
        if (e.name === "AbortError" || cancelledRef.current) {
          setIsTranscribing(false);
          return; // silently cancelled
        }
        setIsTranscribing(false);
        setError(e.message);
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Stores the voice response from backend temporarily
  // so send button can use it without re-calling backend
  const pendingVoiceDataRef = useRef(null);

  // ── Modified send — checks for pending voice data ─
  const handleSend = async () => {
    if (!textInput.trim() || isLoading) return;

    // If user recorded voice and backend already answered,
    // use that answer directly without calling backend again
    if (pendingVoiceDataRef.current) {
      const data = pendingVoiceDataRef.current;
      const question = textInput.trim(); // may be edited by user
      pendingVoiceDataRef.current = null;
      setTextInput("");
      setError("");

      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: question, isVoice: true },
        { id: assistantId, role: "assistant", text: data.answer, audioUrl: data.audio_url, typing: false },
      ]);

      updateHistory(question, data.answer);

      // Auto-play voice answer
      if (data.audio_url) {
        setTimeout(() => {
          setMessages((prev) => {
            const aiIndex = prev.findIndex((m) => m.id === assistantId);
            if (aiIndex !== -1) playAudio(data.audio_url, aiIndex);
            return prev;
          });
        }, 200);
      }

      return;
    }

    // Otherwise normal text send
    await handleTextSend();
  };

  const startRecording = async () => {
    setError("");
    stopAudio();
    pendingVoiceDataRef.current = null; // clear any previous pending data
    setTextInput(""); // clear input box

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current   = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  };

  // ── Profile screen ─────────────────────────────────
  if (!profileCompleted) {
    return (
      <div style={{ fontFamily: "sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
        <nav style={{ background: "#1a56db", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>
            🎓 Student Voice Assistant
          </span>
        </nav>

        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "56px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "18px", padding: "30px 26px", boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "42px", marginBottom: "10px" }}>👋</div>
              <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Welcome, Student</h1>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                Select your learning profile to get explanations suitable for you.
              </p>
            </div>

            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Select your class</label>
            <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} style={{ width: "100%", padding: "11px 12px", marginBottom: "18px", borderRadius: "9px", border: "1px solid #d1d5db", background: "#fff", fontSize: "14px", color: "#111827", outline: "none" }}>
              <option value="5">Class 5</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>

            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Select your board</label>
            <select value={board} onChange={(e) => setBoard(e.target.value)} style={{ width: "100%", padding: "11px 12px", marginBottom: "18px", borderRadius: "9px", border: "1px solid #d1d5db", background: "#fff", fontSize: "14px", color: "#111827", outline: "none" }}>
              <option value="CBSE">CBSE</option>
              <option value="RBSE">RBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="Other">Other</option>
            </select>

            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>Choose answer language</label>
            <select value={answerLanguage} onChange={(e) => setAnswerLanguage(e.target.value)} style={{ width: "100%", padding: "11px 12px", marginBottom: "26px", borderRadius: "9px", border: "1px solid #d1d5db", background: "#fff", fontSize: "14px", color: "#111827", outline: "none" }}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="hinglish">Hinglish</option>
            </select>

            <button
              onClick={() => setProfileCompleted(true)}
              style={{ width: "100%", padding: "12px 16px", border: "none", borderRadius: "10px", background: "#1a56db", color: "#fff", fontSize: "15px", fontWeight: 500, cursor: "pointer" }}
            >
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Loading dots */}
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

          {/* Transcribing status with cancel button */}
          {isTranscribing && (
            <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "13px", color: "#1a56db", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a56db", animation: "pulse 1s infinite" }} />
                Processing your voice...
              </div>
              <button
                onClick={cancelProcessing}
                style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "20px", border: "1px solid #bfdbfe", background: "#fff", color: "#1a56db", cursor: "pointer", fontWeight: 500 }}
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Recording bar */}
          {isRecording && (
            <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626", animation: "pulse 1s infinite" }} />
              Recording... press mic again to stop
            </div>
          )}

          {/* Transcribed text hint */}
          {!isRecording && !isTranscribing && pendingVoiceDataRef.current && textInput && (
            <div style={{ margin: "0 16px 8px", fontSize: "12px", color: "#6b7280", padding: "0 4px" }}>
              ✏️ Review or edit your question, then press Send
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder={isTranscribing ? "Transcribing your voice..." : "Type your question here..."}
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                // If user edits the transcribed text, clear pending voice data
                // so it goes through normal text send instead
                if (pendingVoiceDataRef.current) {
                  pendingVoiceDataRef.current = null;
                }
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              disabled={isLoading || isRecording || isTranscribing}
              style={{ flex: 1, padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "24px", fontSize: "14px", color: "#111827", background: isTranscribing ? "#f3f4f6" : "#f9fafb", outline: "none" }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || isRecording || isTranscribing || !textInput.trim()}
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#1a56db", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isLoading || isRecording || isTranscribing || !textInput.trim()) ? 0.4 : 1 }}
              title="Send"
            >
              ➤
            </button>

            {/* Mic button */}
            <button
              onClick={isRecording ? stopRecordingAndTranscribe : startRecording}
              disabled={isLoading || isTranscribing}
              style={{ width: "38px", height: "38px", borderRadius: "50%", border: "none", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: isRecording ? "#dc2626" : "#f0fdf4", color: isRecording ? "#fff" : "#16a34a", opacity: (isLoading || isTranscribing) ? 0.4 : 1 }}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}