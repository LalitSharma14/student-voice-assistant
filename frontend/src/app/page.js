"use client";
import { useState, useRef, useEffect, useCallback } from "react";

import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { SYLLABUS_DATA } from "../data/syllabus";
import { findDiagramForTopic } from "../data/diagramLibrary";

// ── Brand tokens ───────────────────────────────────────────
const B = {
  navy:        "#2b5888",
  navyDark:    "#1e3d5c",
  navyLight:   "#e8f0f8",
  red:         "#ff4566",
  redLight:    "#fff0f3",
  orange:      "#e45d3e",
  orangeLight: "#fdf0ec",
  warm:        "#ca8c5b",
  warmLight:   "#fdf6ef",
  white:       "#ffffff",
  bg:          "#f4f7fb",
  gray50:      "#f9fafb",
  gray100:     "#f3f4f6",
  gray200:     "#e5e7eb",
  gray300:     "#d1d5db",
  gray500:     "#6b7280",
  gray700:     "#374151",
  gray900:     "#111827",
  green:       "#16a34a",
  greenLight:  "#f0fdf4",
  greenBorder: "#86efac",
};

function TeachifyyLogo({ size = 32, showText = true, light = false }) {
  const textColor = light ? B.white : B.navy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src="/logo.png" alt="Teachifyy logo" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
      {showText && (
        <span style={{ fontSize: size * 0.6, fontWeight: 700, color: textColor, letterSpacing: "-0.3px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Teachifyy
        </span>
      )}
    </div>
  );
}

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Revision Done", "Test Done"];
const COMPLETED_STATUSES = ["Completed", "Test Done"];
const ANSWER_LANGUAGES = [
  { value: "en",       label: "English"  },
  { value: "hinglish", label: "Hinglish" },
  { value: "hi",       label: "Hindi"    },
];

const SUBJECT_DISPLAY_ORDER = ["Maths", "Science", "Social Science", "SST", "English", "Hindi"];

function getOrderedSubjects(syllabus = {}) {
  return Object.keys(syllabus).sort((a, b) => {
    const ai = SUBJECT_DISPLAY_ORDER.indexOf(a);
    const bi = SUBJECT_DISPLAY_ORDER.indexOf(b);
    const ar = ai === -1 ? SUBJECT_DISPLAY_ORDER.length : ai;
    const br = bi === -1 ? SUBJECT_DISPLAY_ORDER.length : bi;
    return ar - br || a.localeCompare(b);
  });
}

// ── Typewriter hook ────────────────────────────────────────
function useTypewriter(text, speed = 120) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setDisplayed(""); setDone(true); return; }
    setDisplayed(""); setDone(false);
    const words = text.split(" ");
    let index = 0;
    const interval = setInterval(() => {
      if (index >= words.length) { setDone(true); clearInterval(interval); return; }
      setDisplayed(words.slice(0, index + 1).join(" "));
      index += 1;
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
}

// ── Assistant bubble ───────────────────────────────────────
function DiagramCard({ diagram }) {
  if (!diagram?.image) return null;
  return (
    <div style={{ marginTop: "14px", border: `1px solid ${B.gray200}`, borderRadius: "10px", overflow: "hidden", background: B.gray50 }}>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
        <div style={{ fontWeight: 700, color: B.navy, fontSize: "13px" }}>Diagram: {diagram.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: B.gray500, fontSize: "11px", whiteSpace: "nowrap" }}>
          {diagram.source && <span>{diagram.source}</span>}
          <a href={diagram.image} target="_blank" rel="noreferrer" style={{ color: B.navy, fontWeight: 700, textDecoration: "none" }}>Open full size</a>
        </div>
      </div>
      <div style={{ padding: "10px", background: B.white }}>
        <img src={diagram.image} alt={diagram.title || "Topic diagram"} style={{ width: "100%", maxHeight: "360px", objectFit: "contain", display: "block", borderRadius: "6px", background: B.white }} />
      </div>
      {Array.isArray(diagram.flowchart) && diagram.flowchart.length > 0 && (
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${B.gray200}`, display: "flex", flexWrap: "wrap", gap: "7px", alignItems: "center" }}>
          {diagram.flowchart.map((step, i) => (
            <span key={`${step}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "12px", color: B.gray700 }}>
              <span style={{ padding: "5px 8px", borderRadius: "999px", background: B.navyLight, color: B.navy, border: `1px solid ${B.gray200}` }}>{step}</span>
              {i < diagram.flowchart.length - 1 && <span style={{ color: B.gray500 }}>-&gt;</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AssistantBubble({ msg, index, playingIndex, playAudio, stopAudio, onTypingComplete }) {
  const { displayed, done } = useTypewriter(msg.typing ? msg.text : "");
  const [audioReady, setAudioReady] = useState(false);
  const ttsStarted = useRef(false);

  useEffect(() => { if (done && msg.typing) onTypingComplete?.(msg.id); }, [done, msg.typing, msg.id, onTypingComplete]);
  useEffect(() => { if (done && msg.audioUrl) setAudioReady(true); }, [done, msg.audioUrl]);
  useEffect(() => {
    if (!msg.typing && msg.audioUrl && !ttsStarted.current) { ttsStarted.current = true; setAudioReady(true); }
  }, [msg.audioUrl, msg.typing]);

  const textToShow = msg.typing ? displayed : msg.text;
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: B.white, marginTop: "2px" }}>AI</div>
      <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: B.white, border: `1px solid ${B.gray200}`, fontSize: "14px", lineHeight: "1.7", color: B.gray900, boxShadow: "0 1px 4px rgba(43,88,136,0.06)" }}>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", maxHeight: "320px", overflowY: "auto", paddingRight: textToShow.length > 400 ? "4px" : "0" }}>
          {textToShow.split("\n").map((line, i) => {
            const cleanLine = line.replace(/\*\*/g, "");
            const lowerLine = cleanLine.toLowerCase().trim();
            const isHeading =
              lowerLine === "topic explanation" || lowerLine === "quick revision" ||
              lowerLine === "quick meaning" || lowerLine === "key points" ||
              lowerLine === "important terms" || lowerLine === "must remember" ||
              lowerLine === "quick flowchart" || lowerLine === "simple diagram" ||
              lowerLine === "exam points" || lowerLine === "quick summary" ||
              lowerLine === "meaning" || lowerLine === "why it is important" ||
              lowerLine === "step-by-step explanation" || lowerLine === "important keywords" ||
              lowerLine === "simple real-life example" || /^\d+\.\s/.test(lowerLine);
            const isImportant =
              lowerLine.includes("definition:") || lowerLine.includes("important:") ||
              lowerLine.includes("remember:") || lowerLine.includes("note:");
            return (
              <div key={i} style={{ color: isHeading ? B.navy : "inherit", fontWeight: isHeading || isImportant ? 700 : "inherit", marginBottom: line.trim() === "" ? "8px" : "3px" }}>
                {cleanLine}
              </div>
            );
          })}
          {msg.typing && !done && (
            <span style={{ display: "inline-block", width: "2px", height: "14px", background: B.red, marginLeft: "3px", verticalAlign: "middle", animation: "blink 0.8s infinite" }} />
          )}
        </div>
        {msg.typing && !done && (
          <button onClick={() => onTypingComplete?.(msg.id)} style={{ marginTop: "10px", fontSize: "11px", padding: "4px 10px", borderRadius: "20px", border: `1px solid ${B.gray300}`, background: B.gray100, color: B.gray700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            ⏹ Stop generating
          </button>
        )}
        {msg.diagram && (!msg.typing || done) && <DiagramCard diagram={msg.diagram} />}
        {msg.typing && done && !msg.audioUrl && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: B.gray500, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>⏳</span> Preparing audio...
          </div>
        )}
        {audioReady && msg.audioUrl && (
          <div style={{ marginTop: "10px" }}>
            {playingIndex === index ? (
              <button onClick={stopAudio} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", border: `1px solid ${B.red}`, background: B.redLight, color: B.red, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>⏹ Stop</button>
            ) : (
              <button onClick={() => playAudio(msg.audioUrl, index)} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 500 }}>🔊 Hear answer</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────
function ProgressBar({ percent, color = B.navy }) {
  return (
    <div style={{ width: "100%", height: "6px", borderRadius: "999px", background: B.gray200, overflow: "hidden" }}>
      <div style={{ width: `${percent}%`, height: "100%", borderRadius: "999px", background: color, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ── Chat history helpers ───────────────────────────────────
function formatSessionDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now  = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function groupSessionsByDate(sessions) {
  const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  const now  = new Date();
  sessions.forEach((s) => {
    const date = s.updatedAt?.toDate ? s.updatedAt.toDate() : new Date(s.updatedAt || 0);
    const diff = Math.floor((now - date) / 86400000);
    if (diff === 0) groups["Today"].push(s);
    else if (diff === 1) groups["Yesterday"].push(s);
    else if (diff < 7) groups["This Week"].push(s);
    else groups["Older"].push(s);
  });
  return groups;
}

// ── Main component ─────────────────────────────────────────
export default function Home() {
  const [messages,           setMessages]           = useState([]);
  const [history,            setHistory]            = useState([]);
  const [textInput,          setTextInput]          = useState("");
  const [isRecording,        setIsRecording]        = useState(false);
  const [isLoading,          setIsLoading]          = useState(false);
  const [isTranscribing,     setIsTranscribing]     = useState(false);
  const [error,              setError]              = useState("");
  const [playingIndex,       setPlayingIndex]       = useState(null);
  const [activeTab,          setActiveTab]          = useState("chat");
  const [selectedSubject,    setSelectedSubject]    = useState(null);
  const [selectedChapter,    setSelectedChapter]    = useState(null);
  const [topicProgress,      setTopicProgress]      = useState({});
  const [revisionProgress,   setRevisionProgress]   = useState({});
  const [testResults,        setTestResults]        = useState({});
  const [progressLoading,    setProgressLoading]    = useState(false);
  const [testLoading,        setTestLoading]        = useState(false);
  const [currentTest,        setCurrentTest]        = useState(null);
  const [selectedAnswers,    setSelectedAnswers]    = useState({});
  const [submittedTestResult,setSubmittedTestResult]= useState(null);
  const [user,               setUser]               = useState(null);
  const [userProfile,        setUserProfile]        = useState(null);
  const [authMode,           setAuthMode]           = useState("login");
  const [authLoading,        setAuthLoading]        = useState(true);
  const [authError,          setAuthError]          = useState("");
  const [signupName,         setSignupName]         = useState("");
  const [signupEmail,        setSignupEmail]        = useState("");
  const [signupMobile,       setSignupMobile]       = useState("");
  const [signupPassword,     setSignupPassword]     = useState("");
  const [signupClassLevel,   setSignupClassLevel]   = useState("5");
  const [signupBoard,        setSignupBoard]        = useState("CBSE");
  const [loginEmail,         setLoginEmail]         = useState("");
  const [loginPassword,      setLoginPassword]      = useState("");
  const [classLevel,         setClassLevel]         = useState("5");
  const [board,              setBoard]              = useState("CBSE");
  const [answerLanguage,     setAnswerLanguage]     = useState("en");
  const [profileCompleted,   setProfileCompleted]   = useState(false);

  // ── Chat history state ─────────────────────────────────
  const [chatSessions,       setChatSessions]       = useState([]);   // list of past sessions
  const [historyLoading,     setHistoryLoading]     = useState(false);
  const [currentSessionId,   setCurrentSessionId]   = useState(null); // active session being saved
  const [viewingSession,     setViewingSession]     = useState(null); // session being viewed in history tab
  const [doubts,             setDoubts]             = useState([]);
  const [doubtsLoading,      setDoubtsLoading]      = useState(false);
  const [savingDoubtId,      setSavingDoubtId]      = useState(null);
  const [resolvingDoubtId,   setResolvingDoubtId]   = useState(null);

  const currentSyllabus = SYLLABUS_DATA[classLevel]?.[board] || SYLLABUS_DATA["5"]?.CBSE;
  const currentChapters = selectedSubject ? currentSyllabus?.[selectedSubject] || [] : [];
  const currentChapter  = selectedChapter;

  const mediaRecorderRef   = useRef(null);
  const audioChunksRef     = useRef([]);
  const chatEndRef         = useRef(null);
  const audioRef           = useRef(null);
  const abortControllerRef = useRef(null);
  const cancelledRef       = useRef(false);
  const pendingVoiceDataRef= useRef(null);
  const requestLockRef     = useRef(false);
  // Ref so saveCurrentSession can read latest messages without stale closure
  const messagesRef        = useRef(messages);
  const historyRef         = useRef(history);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { historyRef.current  = history;  }, [history]);

  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: B.gray700, marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const inputStyle = { width: "100%", padding: "11px 14px", marginBottom: "14px", borderRadius: "10px", border: `1.5px solid ${B.gray300}`, background: B.white, fontSize: "14px", color: B.gray900, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "border-color 0.2s" };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Auth ───────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      try {
        if (!currentUser) { setUser(null); setUserProfile(null); setProfileCompleted(false); setAuthLoading(false); return; }
        setUser(currentUser);
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const profile = userSnap.data();
          setUserProfile(profile);
          setClassLevel(profile.classLevel || "5");
          setBoard(profile.board || "CBSE");
        }
        setProfileCompleted(false);
      } catch (err) {
        console.error("Auth profile load error:", err);
        setAuthError("Could not load your profile. Please try again.");
      } finally { setAuthLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTopicProgress(user.uid);
      loadRevisionProgress(user.uid);
      loadTestResults(user.uid);
      loadChatSessions(user.uid);
      loadDoubts(user.uid);
    } else {
      setTopicProgress({});
      setRevisionProgress({});
      setTestResults({});
      setChatSessions([]);
      setDoubts([]);
    }
  }, [user]);

  // ══════════════════════════════════════════════════════
  //  CHAT SESSION PERSISTENCE
  // ══════════════════════════════════════════════════════

  /**
   * Load the 40 most recent chat sessions from Firestore.
   * Each session doc: { title, messages, history, classLevel, board,
   *                     answerLanguage, createdAt, updatedAt }
   */
  const loadChatSessions = async (uid) => {
    if (!uid) return;
    setHistoryLoading(true);
    try {
      const q    = query(
        collection(db, "users", uid, "chatSessions"),
        orderBy("updatedAt", "desc"),
        limit(40)
      );
      const snap = await getDocs(q);
      const loaded = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
      setChatSessions(loaded);
    } catch (err) {
      console.error("Chat sessions load error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Save (upsert) the current conversation to Firestore.
   * Called automatically after every assistant reply.
   * Uses messagesRef / historyRef so it always has the latest data.
   */
  const saveCurrentSession = useCallback(async (uid, sessionId, firstQuestion) => {
    if (!uid) return;
    const msgs = messagesRef.current;
    const hist = historyRef.current;
    if (!msgs.length) return;

    // Strip audioUrl before saving — audio files are ephemeral
    const msgsToSave = msgs.map(({ audioUrl: _a, typing: _t, ...rest }) => rest);

    const title = firstQuestion
      ? firstQuestion.slice(0, 70)
      : (msgs.find((m) => m.role === "user")?.text || "Chat").slice(0, 70);

    const sessionData = {
      title,
      messages:       msgsToSave,
      history:        hist,
      classLevel,
      board,
      answerLanguage,
      updatedAt:      serverTimestamp(),
    };

    try {
      const ref = doc(db, "users", uid, "chatSessions", sessionId);
      const exists = await getDoc(ref);
      if (!exists.exists()) {
        sessionData.createdAt = serverTimestamp();
      }
      await setDoc(ref, sessionData, { merge: true });

      // Refresh local sessions list so History tab stays current
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        const updated  = { id: sessionId, ...sessionData, updatedAt: { toDate: () => new Date() } };
        return [updated, ...filtered];
      });
    } catch (err) {
      console.error("Chat session save error:", err);
    }
  }, [classLevel, board, answerLanguage]);

  /**
   * Delete a session from Firestore and local state.
   */
  const deleteSession = async (sessionId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "chatSessions", sessionId));
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (viewingSession?.id === sessionId) setViewingSession(null);
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  /**
   * Start a fresh new session (new sessionId, blank messages).
   */
  const startNewSession = () => {
    stopAudio();
    setMessages([]);
    setHistory([]);
    setError("");
    setTextInput("");
    pendingVoiceDataRef.current = null;
    requestLockRef.current = false;
    setCurrentSessionId(crypto.randomUUID());
    setActiveTab("chat");
  };

  /**
   * Load a historical session into the active chat for viewing/continuing.
   */
  const openSession = (session) => {
    stopAudio();
    // Restore messages without audioUrl (ephemeral) and with typing=false
    const restoredMessages = (session.messages || []).map((m) => ({
      ...m,
      audioUrl: null,
      typing:   false,
    }));
    setMessages(restoredMessages);
    setHistory(session.history || []);
    setCurrentSessionId(session.id);
    setViewingSession(null);
    setActiveTab("chat");
    setError("");
    pendingVoiceDataRef.current = null;
  };

  // Initialise session ID on first mount after login
  useEffect(() => {
    if (user && profileCompleted && !currentSessionId) {
      setCurrentSessionId(crypto.randomUUID());
    }
  }, [user, profileCompleted, currentSessionId]);

  // ── Audio helpers ──────────────────────────────────────
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.onended = null; audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setPlayingIndex(null);
  };

  const handleAnswerLanguageChange = (language) => {
    setAnswerLanguage(language);
    pendingVoiceDataRef.current = null;
    stopAudio();
  };

  const playAudio = (audioUrl, index) => {
    stopAudio();
    const audio = new Audio(`/api/${audioUrl}`);
    audioRef.current = audio;
    setTimeout(() => {
      if (audioRef.current !== audio) return;
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => { setPlayingIndex(index); audio.onended = () => setPlayingIndex(null); })
         .catch((e) => { if (e.name !== "AbortError") console.error("Audio play error:", e); setPlayingIndex(null); });
      }
    }, 80);
  };

  const getTtsLanguage  = () => answerLanguage === "hi" ? "hi" : "en";

  const generateAnswerAudio = async (text, language = getTtsLanguage()) => {
    const fd = new FormData();
    fd.append("text", text);
    fd.append("language", language);
    const res = await fetch("/api/tts", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.audio_url || null;
  };

  const updateHistory = (question, answer) => {
    setHistory((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: answer }]);
  };

  // ── ID helpers ─────────────────────────────────────────
  const slugForId = (value) => {
    const text = String(value || "").toLowerCase();
    let output = "";
    for (const char of text) {
      if (/^[a-z0-9]$/.test(char)) output += char;
      else if (/[\s\-_./'':]/.test(char)) output += "_";
      else if (/\p{L}|\p{N}/u.test(char)) output += `u${char.codePointAt(0).toString(16)}`;
      else output += "_";
    }
    return output.replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  };

  const getTopicId    = (subject, chapterTitle, topicTitle) => slugForId(`${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`);
  const getContentId  = (subject, chapterTitle, topicTitle) => slugForId(`class_${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`);
  const getTopicStatus= (subject, chapterTitle, topicTitle) => topicProgress[getTopicId(subject, chapterTitle, topicTitle)]?.status || "Not Started";
  const isCompletedStatus   = (status) => COMPLETED_STATUSES.includes(status);
  const getProgressStatus   = (completed, total) => { if (total === 0 || completed === 0) return "Not Started"; if (completed === total) return "Completed"; return "In Progress"; };
  const getStatusColor      = (status) => { if (status === "Completed") return B.green; if (status === "In Progress") return B.navy; return B.gray500; };

  const getChapterProgress = (subject, chapter) => {
    const totalTopics = chapter?.subtopics?.length || 0;
    if (totalTopics === 0) return { completed: 0, total: 0, percent: 0, status: "Not Started" };
    const completedTopics = chapter.subtopics.filter((t) => isCompletedStatus(getTopicStatus(subject, chapter.title, t))).length;
    return { completed: completedTopics, total: totalTopics, percent: Math.round((completedTopics / totalTopics) * 100), status: getProgressStatus(completedTopics, totalTopics) };
  };

  const getSubjectProgress = (subject) => {
    const chapters = currentSyllabus?.[subject] || [];
    let totalTopics = 0, completedTopics = 0;
    chapters.forEach((chapter) => { totalTopics += chapter.subtopics.length; completedTopics += chapter.subtopics.filter((t) => isCompletedStatus(getTopicStatus(subject, chapter.title, t))).length; });
    return { completed: completedTopics, total: totalTopics, percent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100), status: getProgressStatus(completedTopics, totalTopics) };
  };

  const getOverallProgress = () => {
    let totalTopics = 0, completedTopics = 0;
    Object.keys(currentSyllabus || {}).forEach((subject) => { const p = getSubjectProgress(subject); totalTopics += p.total; completedTopics += p.completed; });
    return { completed: completedTopics, total: totalTopics, percent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100), status: getProgressStatus(completedTopics, totalTopics) };
  };

  // ── Auth handlers ──────────────────────────────────────
  const handleCreateAccount = async () => {
    setAuthError("");
    if (!signupName.trim() || !signupEmail.trim() || !signupMobile.trim() || !signupPassword.trim()) { setAuthError("Please fill all required fields."); return; }
    if (signupPassword.length < 6) { setAuthError("Password should be at least 6 characters."); return; }
    try {
      setAuthLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const createdUser = userCredential.user;
      const profileData = { name: signupName.trim(), email: signupEmail.trim(), mobile: signupMobile.trim(), classLevel: signupClassLevel, board: signupBoard, createdAt: serverTimestamp() };
      await setDoc(doc(db, "users", createdUser.uid), profileData);
      setUser(createdUser); setUserProfile(profileData); setClassLevel(signupClassLevel); setBoard(signupBoard); setProfileCompleted(false);
    } catch (err) { setAuthError(err.message || "Could not create account."); } finally { setAuthLoading(false); }
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!loginEmail.trim() || !loginPassword.trim()) { setAuthError("Please enter email and password."); return; }
    try { setAuthLoading(true); await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword); }
    catch (err) { setAuthError(err.message || "Could not login."); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setUserProfile(null); setMessages([]); setHistory([]); setTextInput("");
    setTopicProgress({}); setRevisionProgress({}); setTestResults({});
    setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null);
    setActiveTab("chat"); setSelectedSubject(null); setSelectedChapter(null);
    setProfileCompleted(false); pendingVoiceDataRef.current = null;
    setChatSessions([]); setCurrentSessionId(null); setViewingSession(null);
    setDoubts([]); setSavingDoubtId(null);
  };

  // ── Progress loaders ───────────────────────────────────
  const loadTopicProgress = async (uid) => {
    if (!uid) return;
    try { setProgressLoading(true); const snap = await getDocs(collection(db, "users", uid, "topicProgress")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setTopicProgress(loaded); }
    catch (err) { console.error("Progress load error:", err); } finally { setProgressLoading(false); }
  };

  const updateTopicStatus = async (subject, chapterTitle, topicTitle, status) => {
    if (!user) { setError("Please login to save progress."); return; }
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    const progressData = { subject, chapterTitle, topicTitle, status, classLevel, board, updatedAt: serverTimestamp() };
    setTopicProgress((prev) => ({ ...prev, [topicId]: { ...progressData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "topicProgress", topicId), progressData, { merge: true }); }
    catch (err) { console.error("Progress save error:", err); }
  };

  const markTypingComplete = (messageId) => {
    setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, typing: false } : msg));
  };

  const clearConversation = () => {
    stopAudio();
    setMessages([]); setHistory([]); setError("");
    pendingVoiceDataRef.current = null;
    requestLockRef.current = false;
    // Start a fresh session so the next conversation saves separately
    setCurrentSessionId(crypto.randomUUID());
  };

  const getRevisionStatus = (subject, chapterTitle, topicTitle) => revisionProgress[getTopicId(subject, chapterTitle, topicTitle)]?.revised || false;

  const loadRevisionProgress = async (uid) => {
    if (!uid) return;
    try { const snap = await getDocs(collection(db, "users", uid, "revisionProgress")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setRevisionProgress(loaded); }
    catch (err) { console.error("Revision progress load error:", err); }
  };

  const updateRevisionStatus = async (subject, chapterTitle, topicTitle) => {
    if (!user) return;
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    const revisionData = { subject, chapterTitle, topicTitle, revised: true, classLevel, board, updatedAt: serverTimestamp() };
    setRevisionProgress((prev) => ({ ...prev, [topicId]: { ...revisionData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "revisionProgress", topicId), revisionData, { merge: true }); }
    catch (err) { console.error("Revision save error:", err); }
  };

  const getTestId = (type, subject, chapterTitle, topicTitle = "") =>
    (type === "topic" ? `topic_${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}` : `chapter_${classLevel}_${board}_${subject}_${chapterTitle}`)
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const getSavedTestResult = (type, subject, chapterTitle, topicTitle = "") => testResults[getTestId(type, subject, chapterTitle, topicTitle)] || null;

  const loadTestResults = async (uid) => {
    if (!uid) return;
    try { const snap = await getDocs(collection(db, "users", uid, "testResults")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setTestResults(loaded); }
    catch (err) { console.error("Test results load error:", err); }
  };

  const saveTestResult = async (resultData) => {
    if (!user || !resultData?.testId) return;
    setTestResults((prev) => ({ ...prev, [resultData.testId]: { ...resultData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "testResults", resultData.testId), { ...resultData, updatedAt: serverTimestamp() }, { merge: true }); }
    catch (err) { console.error("Test result save error:", err); }
  };

  const startTest = async ({ type, subject, chapterTitle, topicTitle = "", topics = [], questionCount }) => {
    if (!user) { setError("Please login to start a test."); return; }
    setError(""); setTestLoading(true); setSelectedAnswers({}); setSubmittedTestResult(null); setCurrentTest(null); setActiveTab("test");
    const testId = getTestId(type, subject, chapterTitle, topicTitle);
    const fd = new FormData();
    fd.append("test_type", type); fd.append("subject", subject); fd.append("chapter_title", chapterTitle);
    fd.append("topic_title", topicTitle || ""); fd.append("topics", JSON.stringify(topics || []));
    fd.append("question_count", String(questionCount)); fd.append("class_level", classLevel);
    fd.append("board", board); fd.append("answer_language", answerLanguage);
    try {
      const res = await fetch("/api/generate-test", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Could not generate test."); }
      const data = await res.json();
      const questions = Array.isArray(data.questions) ? data.questions : [];
      if (!questions.length) throw new Error("No questions generated. Please try again.");
      setCurrentTest({ testId, type, subject, chapterTitle, topicTitle, questionCount, questions });
    } catch (err) { console.error("Test generation error:", err); setError(err.message || "Could not generate test."); setActiveTab("syllabus"); }
    finally { setTestLoading(false); }
  };

  const handleTopicTest   = (subtopic) => { if (!selectedSubject || !currentChapter || !subtopic) return; startTest({ type: "topic", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: subtopic, topics: [subtopic], questionCount: 10 }); };
  const handleChapterTest = () => { if (!selectedSubject || !currentChapter) return; startTest({ type: "chapter", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: "", topics: currentChapter.subtopics || [], questionCount: 20 }); };

  const submitCurrentTest = async () => {
    if (!currentTest?.questions?.length) return;
    let score = 0;
    currentTest.questions.forEach((q, i) => { if (Number(selectedAnswers[i]) === Number(q.answerIndex)) score += 1; });
    const resultData = { testId: currentTest.testId, type: currentTest.type, subject: currentTest.subject, chapterTitle: currentTest.chapterTitle, topicTitle: currentTest.topicTitle || "", score, total: currentTest.questions.length, percentage: Math.round((score / currentTest.questions.length) * 100), classLevel, board };
    setSubmittedTestResult(resultData);
    await saveTestResult(resultData);
  };

  const resetTestView = () => { setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null); setActiveTab("syllabus"); };

  const formatList     = (items = []) => items.filter(Boolean).map((item) => `- ${item}`).join("\n");
  const formatTermList = (items = []) => items.filter(Boolean).map((item) => `- ${item.term}: ${item.meaning}`).join("\n");

  const formatStudyContent = (contentDoc) => {
    const content = contentDoc.studyContent || {};
    const diagram = content.diagram || {};
    return [
      content.title || contentDoc.topicTitle || "Study Topic", "",
      "Meaning", content.intro || "", "",
      "NCERT-Based Explanation", content.ncertBasedExplanation || "", "",
      "Easy Explanation", content.aiSimplifiedExplanation || "", "",
      "Step-by-Step Explanation", formatList(content.stepByStep), "",
      "Important Keywords", formatTermList(content.keywords), "",
      "Simple Real-Life Example", content.realLifeExample || "", "",
      diagram.content ? `${diagram.title || "Simple Diagram"}\n${diagram.content}` : "", "",
      "Quick Summary", formatList(content.summary), "",
      contentDoc.sourceLabel || "",
    ].filter((part) => part !== "").join("\n");
  };

  const formatRevisionContent = (contentDoc) => {
    const content = contentDoc.revisionContent || {};
    return [
      `Quick Revision: ${contentDoc.topicTitle || ""}`.trim(), "",
      "Quick Meaning", content.quickMeaning || "", "",
      "Key Points", formatList(content.keyPoints), "",
      "Important Terms", formatTermList(content.importantTerms), "",
      "Must Remember", formatList(content.mustRemember), "",
      content.quickFlowchart ? `Quick Flowchart\n${content.quickFlowchart}` : "", "",
      "Exam Points", formatList(content.examPoints), "",
      contentDoc.sourceLabel || "",
    ].filter((part) => part !== "").join("\n");
  };

  const loadPublishedContent = async (subject, chapterTitle, topicTitle) => {
    const contentId = getContentId(subject, chapterTitle, topicTitle);
    const snap = await getDoc(doc(db, "contentLibrary", contentId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data.status === "published" ? data : null;
  };

  const addStoredContentToChat = (label, answer, diagram = null) => {
    const assistantId = crypto.randomUUID();
    stopAudio();
    setMessages((prev) => [
      ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
      { id: crypto.randomUUID(), role: "user", text: label, isVoice: false },
      { id: assistantId, role: "assistant", text: answer, audioUrl: null, typing: true, diagram },
    ]);
    updateHistory(label, answer);
    setActiveTab("chat");
    return assistantId;
  };

  const convertStoredContentLanguage = async ({ label, sourceText, mode }) => {
    if (answerLanguage === "en") return sourceText;
    const languageLabel = answerLanguage === "hi" ? "Hindi in Devanagari script" : "natural Roman Hinglish";
    const modeMarker    = mode === "revision" ? "REVISION_TOPIC_MODE" : "STUDY_TOPIC_MODE";
    const fd = new FormData();
    fd.append("question", `${modeMarker}\n\nRewrite the stored ${mode} content below in ${languageLabel} for a Class ${classLevel} CBSE student.\n\nRules:\n- Do not say that you are rewriting or translating.\n- Keep the full lesson useful and detailed; do not shorten it to only 2-3 lines.\n- Keep all useful teaching points from the source.\n- Keep headings, bullet points, examples, summaries, and important keywords.\n- Keep it easy, warm, and student-friendly.\n- Do not add unrelated facts.\n- If the target is Hinglish, use Roman English letters only and no Devanagari.\n- If the target is Hindi, use simple Devanagari Hindi only, suitable for a Class ${classLevel} student.\n\nVisible student request: ${label}\n\nStored source content:\n${sourceText}`);
    fd.append("history", JSON.stringify([]));
    fd.append("class_level", classLevel);
    fd.append("board", board);
    fd.append("answer_language", answerLanguage);
    if (selectedSubject) fd.append("subject", selectedSubject);
    const res = await fetch("/api/ask-text", { method: "POST", body: fd });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Could not convert stored content language."); }
    const data = await res.json();
    return data.answer || sourceText;
  };

  const addStoredContentWithLanguage = async ({ label, sourceText, mode, diagram = null }) => {
    if (requestLockRef.current) return;
    requestLockRef.current = true;
    pendingVoiceDataRef.current = null;
    setTextInput(""); setError(""); setIsLoading(answerLanguage !== "en"); setActiveTab("chat");
    try {
      const answer      = await convertStoredContentLanguage({ label, sourceText, mode });
      const assistantId = addStoredContentToChat(label, answer, diagram);
      // Save session after stored content is shown
      if (user && currentSessionId) {
        setTimeout(() => saveCurrentSession(user.uid, currentSessionId, label), 400);
      }
      try {
        const audioUrl = await generateAnswerAudio(answer);
        if (audioUrl) setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
      } catch (ttsError) { console.error("Stored content TTS failed:", ttsError); }
    } catch (err) {
      console.error("Stored content language conversion error:", err);
      setError(err.message || "Could not prepare this answer in the selected language.");
      const assistantId = addStoredContentToChat(label, sourceText, diagram);
      if (user && currentSessionId) {
        setTimeout(() => saveCurrentSession(user.uid, currentSessionId, label), 400);
      }
      try {
        const audioUrl = await generateAnswerAudio(sourceText);
        if (audioUrl) setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
      } catch (ttsError) { console.error("Stored content fallback TTS failed:", ttsError); }
    } finally {
      setIsLoading(false);
      requestLockRef.current = false;
    }
  };

  const handleReviseTopic = async (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic || requestLockRef.current) return;
    await updateRevisionStatus(selectedSubject, currentChapter.title, subtopic);
    const label = `Revision: ${subtopic}`;
    try {
      const contentDoc = await loadPublishedContent(selectedSubject, currentChapter.title, subtopic);
      if (contentDoc?.revisionContent) { await addStoredContentWithLanguage({ label, sourceText: formatRevisionContent(contentDoc), mode: "revision" }); return; }
    } catch (err) { console.error("Content library revision load error:", err); }
    const prompt = `REVISION_TOPIC_MODE\n\nTopic: ${subtopic}\nChapter: ${currentChapter.title}\nSubject: ${selectedSubject}\nClass: ${classLevel}\nBoard: ${board}\n\nCreate short and crisp revision notes for this topic.\n\nRevision format:\n1. Quick Meaning\n2. Key Points\n3. Important Terms\n4. Must Remember\n5. Quick Flowchart\n6. Exam Points\n\nRules:\n- Keep it short and crisp.\n- Use mostly bullet points.\n- Do not write long paragraphs.\n- Follow the selected answer language.`;
    pendingVoiceDataRef.current = null; setTextInput(prompt); setActiveTab("chat");
  };

  const handleStudyTopic = async (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic || requestLockRef.current) return;
    await updateTopicStatus(selectedSubject, currentChapter.title, subtopic, "Completed");
    const label = `Study Topic: ${subtopic}`;
    const diagram = findDiagramForTopic({
      classLevel,
      board,
      subject: selectedSubject,
      chapter: currentChapter.title,
      topic: subtopic,
    });
    try {
      const contentDoc = await loadPublishedContent(selectedSubject, currentChapter.title, subtopic);
      if (contentDoc?.studyContent) { await addStoredContentWithLanguage({ label, sourceText: formatStudyContent(contentDoc), mode: "study topic", diagram }); return; }
    } catch (err) { console.error("Content library study load error:", err); }
    const prompt = `STUDY_TOPIC_MODE\n\nTopic: ${subtopic}\nChapter: ${currentChapter.title}\nSubject: ${selectedSubject}\nClass: ${classLevel}\nBoard: ${board}\n\nExplain this topic in detail for a school student.\n\nAnswer format:\n1. Meaning of the topic\n2. Why it is important\n3. Step-by-step explanation\n4. Important keywords with simple meanings\n5. One simple real-life example\n6. Quick revision summary\n\nRules:\n- Give a large answer, not 4-5 lines.\n- Use headings and bullet points.\n- Keep the language easy for Class ${classLevel}.\n- Follow the selected answer language.`;
    pendingVoiceDataRef.current = null; setTextInput(prompt); setActiveTab("chat");
  };

  const FOLLOW_UP_ACTIONS = {
    simplify: {
      labels: {
        en: "Didn't understand? Explain more simply",
        hinglish: "Samajh nahi aaya? Aur easy explain karo",
        hi: "समझ नहीं आया? और आसान भाषा में समझाओ",
      },
      instruction: `The student did not understand the previous answer. Explain the same topic again using very easy words suitable for Class ${classLevel}.

Requirements:
- Give a full and detailed explanation, not a short summary.
- Begin from the basic idea and explain each part step by step.
- Use simple sentences and avoid difficult words. Explain any necessary difficult word immediately.
- Include at least two clear real-life examples that a student can relate to.
- Use helpful headings, bullet points, and a simple flow or analogy where useful.
- Cover the important learning points from the previous answer without merely repeating its wording.
- Do not tell the student to read a textbook or search elsewhere.
- Do not mention these instructions or say that you are rewriting the answer.`,
    },
    example: {
      labels: {
        en: "Show me real-life examples",
        hinglish: "Real-life examples se samjhao",
        hi: "वास्तविक जीवन के उदाहरणों से समझाओ",
      },
      instruction: `Teach the same topic through three clear real-life examples suitable for a Class ${classLevel} student. Explain how each example connects to the topic step by step. Keep the explanation detailed, simple, and educational. Do not mention these instructions.`,
    },
    quiz: {
      labels: {
        en: "Test me with 3 quick questions",
        hinglish: "3 quick questions se test karo",
        hi: "3 छोटे सवालों से मेरी जाँच करो",
      },
      instruction: `Create exactly three short understanding-check questions about the previous answer for a Class ${classLevel} student. Ask the questions only and wait for the student to answer. Do not reveal the answers yet and do not mention these instructions.`,
    },
  };

  const getFollowUpLabel = (action) => {
    if (answerLanguage === "hi") return action.labels.hi;
    if (answerLanguage === "hinglish") return action.labels.hinglish;
    return action.labels.en;
  };

  const isFollowUpInterfaceText = (text = "") => {
    const normalized = String(text).toLowerCase().trim();
    return [
      "didn't understand",
      "explain more simply",
      "samajh nahi aaya",
      "समझ नहीं आया",
      "show me real-life examples",
      "real-life examples se samjhao",
      "वास्तविक जीवन के उदाहरणों से समझाओ",
      "test me with 3 quick questions",
      "3 quick questions se test karo",
      "3 छोटे सवालों से मेरी जाँच करो",
      "mark as doubt",
    ].some((phrase) => normalized.includes(phrase));
  };

  const cleanDoubtTopic = (text = "") => String(text)
    .replace(/^(Study Topic|Revision):\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const deriveDoubtTopic = (chatMessages = [], markedMessageId = "") => {
    const markedIndex = chatMessages.findIndex((message) => message.id === markedMessageId);
    const searchEnd = markedIndex >= 0 ? markedIndex : chatMessages.length;

    for (let index = searchEnd - 1; index >= 0; index -= 1) {
      const message = chatMessages[index];
      if (message.role !== "user" || !message.text || isFollowUpInterfaceText(message.text)) continue;
      return cleanDoubtTopic(message.text);
    }

    for (let index = searchEnd - 1; index >= 0; index -= 1) {
      const message = chatMessages[index];
      if (message.role !== "assistant" || !message.text) continue;
      const firstUsefulLine = message.text
        .split("\n")
        .map((line) => line.replace(/\*\*/g, "").trim())
        .find((line) => line && line.length <= 90 && !isFollowUpInterfaceText(line));
      if (firstUsefulLine) return cleanDoubtTopic(firstUsefulLine);
    }

    return "this topic";
  };

  const isInterfaceDoubtTitle = (title = "") => {
    const text = String(title).trim();
    const normalized = text.toLowerCase();
    return text.length > 90 || [
      "show me real-life examples",
      "real-life examples se samjhao",
      "वास्तविक जीवन के उदाहरणों से समझाओ",
      "didn't understand",
      "samajh nahi aaya",
      "समझ नहीं आया",
      "mark as doubt",
    ].some((phrase) => normalized.includes(phrase));
  };

  const buildDoubtTitle = (followUpType, topic, language = "en") => {
    const cleanTopic = cleanDoubtTopic(topic || "this topic");

    if (language === "hi") {
      if (followUpType === "example") return `${cleanTopic} के वास्तविक जीवन के उदाहरण`;
      if (followUpType === "quiz") return `${cleanTopic} से जुड़े प्रश्न`;
      return `${cleanTopic} की आसान व्याख्या`;
    }

    if (language === "hinglish") {
      if (followUpType === "example") return `${cleanTopic} ke real-life examples`;
      if (followUpType === "quiz") return `${cleanTopic} par questions`;
      return `${cleanTopic} ka easy explanation`;
    }

    if (followUpType === "example") return `Real-life examples of ${cleanTopic}`;
    if (followUpType === "quiz") return `Questions about ${cleanTopic}`;
    return `Easy explanation of ${cleanTopic}`;
  };

  const getDoubtDisplayTitle = (doubt) => {
    if (!doubt) return "Saved doubt";
    if (doubt.topicName && !isInterfaceDoubtTitle(doubt.topicName)) return doubt.topicName;

    const markedMessage = (doubt.chatMessages || []).find(
      (message) => message.id === doubt.markedMessageId || message.id === doubt.assistantMessageId
    );
    const derivedTopic = deriveDoubtTopic(
      doubt.chatMessages || [],
      doubt.markedMessageId || doubt.assistantMessageId
    );
    return buildDoubtTitle(
      doubt.followUpType || markedMessage?.followUpType || "simplify",
      isFollowUpInterfaceText(markedMessage?.doubtTopic)
        ? derivedTopic
        : markedMessage?.doubtTopic || derivedTopic || doubt.question || "this topic",
      doubt.answerLanguage || "en"
    );
  };

  const handleFollowUp = async (actionKey) => {
    const action = FOLLOW_UP_ACTIONS[actionKey];
    const latestAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
    const latestAnswer = latestAssistant?.text;
    const derivedTopic = deriveDoubtTopic(messages);
    const sourceQuestion = latestAssistant?.doubtSourceQuestion
      && !isFollowUpInterfaceText(latestAssistant.doubtSourceQuestion)
      ? latestAssistant.doubtSourceQuestion
      : derivedTopic;
    const doubtTopic = latestAssistant?.doubtTopic
      && !isFollowUpInterfaceText(latestAssistant.doubtTopic)
      ? latestAssistant.doubtTopic
      : derivedTopic;
    if (!action || !latestAnswer || isLoading || requestLockRef.current) return;

    requestLockRef.current = true;
    pendingVoiceDataRef.current = null;
    stopAudio();

    const visibleQuestion = getFollowUpLabel(action);
    const assistantId = crypto.randomUUID();
    const hiddenPrompt = `FOLLOW_UP_${actionKey.toUpperCase()}_MODE

${action.instruction}

Continue in the currently selected answer language.

Previous answer:
${latestAnswer}`;

    setError("");
    setIsLoading(true);
    setMessages((prev) => [
      ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
      { id: crypto.randomUUID(), role: "user", text: visibleQuestion, isVoice: false },
    ]);

    const fd = new FormData();
    fd.append("question", hiddenPrompt);
    fd.append("history", JSON.stringify(history));
    fd.append("class_level", classLevel);
    fd.append("board", board);
    fd.append("answer_language", answerLanguage);
    if (selectedSubject) fd.append("subject", selectedSubject);

    try {
      const res = await fetch("/api/ask-text", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not prepare the follow-up answer.");
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
        {
          id: assistantId,
          role: "assistant",
          text: data.answer,
          audioUrl: null,
          typing: true,
          followUpType: actionKey,
          doubtTopic: doubtTopic || sourceQuestion,
          doubtSourceQuestion: sourceQuestion,
        },
      ]);
      updateHistory(visibleQuestion, data.answer);

      if (user && currentSessionId) {
        setTimeout(() => saveCurrentSession(user.uid, currentSessionId), 400);
      }

      try {
        const audioUrl = await generateAnswerAudio(data.answer, data.language === "hi" ? "hi" : "en");
        if (audioUrl) {
          setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
        }
      } catch (ttsError) {
        console.error("Follow-up TTS failed:", ttsError);
      }
    } catch (err) {
      setError(err.message || "Could not prepare the follow-up answer.");
    } finally {
      setIsLoading(false);
      requestLockRef.current = false;
    }
  };

  const markAsDoubt = async (assistantMessage) => {
    if (!user || !assistantMessage?.id || !assistantMessage?.text || savingDoubtId) return;
    const existingDoubt = doubts.find((doubt) => doubt.assistantMessageId === assistantMessage.id);
    if (existingDoubt && !isInterfaceDoubtTitle(existingDoubt.topicName)) return;

    setSavingDoubtId(assistantMessage.id);
    setError("");

    try {
      const doubtData = {
        assistantMessageId: assistantMessage.id,
        topicName: buildDoubtTitle(
          assistantMessage.followUpType || "simplify",
          assistantMessage.doubtTopic || assistantMessage.doubtSourceQuestion,
          answerLanguage
        ),
        followUpType: assistantMessage.followUpType || "general",
        markedMessageId: assistantMessage.id,
        chatSessionId: currentSessionId || "",
        chatMessages: messages.map(({ audioUrl: _audioUrl, typing: _typing, ...message }) => message),
        chatHistory: history,
        answerLanguage,
        resolved: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid, "doubts", assistantMessage.id), doubtData);
      setDoubts((prev) => [
        { ...doubtData, id: assistantMessage.id, createdAt: { toDate: () => new Date() } },
        ...prev.filter((doubt) => doubt.assistantMessageId !== assistantMessage.id),
      ]);
    } catch (err) {
      console.error("Save doubt error:", err);
      setError("Could not save this doubt. Please check your Firestore rules.");
    } finally {
      setSavingDoubtId(null);
    }
  };

  const markDoubtResolved = async (doubt) => {
    if (!user || !doubt?.id || doubt.resolved || resolvingDoubtId) return;
    setResolvingDoubtId(doubt.id);
    setError("");
    try {
      await setDoc(
        doc(db, "users", user.uid, "doubts", doubt.id),
        { resolved: true, resolvedAt: serverTimestamp() },
        { merge: true }
      );
      setDoubts((prev) => prev.map((item) => item.id === doubt.id
        ? { ...item, resolved: true, resolvedAt: { toDate: () => new Date() } }
        : item
      ));
    } catch (err) {
      console.error("Resolve doubt error:", err);
      setError("Could not mark this doubt as resolved.");
    } finally {
      setResolvingDoubtId(null);
    }
  };

  const openDoubtChat = async (doubt) => {
    if (!doubt) return;
    stopAudio();
    setError("");

    let restoredMessages = doubt.chatMessages || [];
    let restoredHistory = doubt.chatHistory || [];

    if (!restoredMessages.length && user && doubt.chatSessionId) {
      try {
        const sessionSnap = await getDoc(doc(db, "users", user.uid, "chatSessions", doubt.chatSessionId));
        if (sessionSnap.exists()) {
          const session = sessionSnap.data();
          restoredMessages = session.messages || [];
          restoredHistory = session.history || [];
        }
      } catch (err) {
        console.error("Doubt chat load error:", err);
      }
    }

    if (!restoredMessages.length) {
      setError("The chat linked to this older doubt is not available.");
      return;
    }

    setMessages(restoredMessages.map((message) => ({
      ...message,
      audioUrl: null,
      typing: false,
    })));
    setHistory(restoredHistory);
    if (doubt.chatSessionId) setCurrentSessionId(doubt.chatSessionId);
    if (doubt.answerLanguage) setAnswerLanguage(doubt.answerLanguage);
    setActiveTab("chat");
    pendingVoiceDataRef.current = null;

    setTimeout(() => {
      document.getElementById(`chat-message-${doubt.markedMessageId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

  const loadDoubts = async (uid) => {
    if (!uid) return;
    setDoubtsLoading(true);
    try {
      const doubtsQuery = query(
        collection(db, "users", uid, "doubts"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(doubtsQuery);
      const loaded = [];
      snap.forEach((doubtDoc) => loaded.push({ id: doubtDoc.id, ...doubtDoc.data() }));
      const corrected = loaded.map((doubt) => {
        if (!isInterfaceDoubtTitle(doubt.topicName)) return doubt;
        return { ...doubt, topicName: getDoubtDisplayTitle(doubt) };
      });
      setDoubts(corrected);

      await Promise.all(corrected.map(async (doubt, index) => {
        if (doubt.topicName === loaded[index].topicName) return;
        await setDoc(
          doc(db, "users", uid, "doubts", doubt.id),
          { topicName: doubt.topicName },
          { merge: true }
        );
      }));
    } catch (err) {
      console.error("Doubts load error:", err);
    } finally {
      setDoubtsLoading(false);
    }
  };

  const cancelProcessing = () => {
    cancelledRef.current = true;
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    requestLockRef.current = false;
    setIsLoading(false); setIsTranscribing(false); setError("");
  };

  // ── Text send ──────────────────────────────────────────
  const handleTextSend = async () => {
    if (!textInput.trim() || isLoading || requestLockRef.current) return;
    requestLockRef.current = true;
    const question    = textInput.trim();
    const assistantId = crypto.randomUUID();
    // Capture first question for session title (before messages update)
    const isFirstMsg  = messages.length === 0;

    setTextInput(""); setError(""); setIsLoading(true);
    setMessages((prev) => [
      ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
      { id: crypto.randomUUID(), role: "user", text: question, isVoice: false },
    ]);

    const fd = new FormData();
    fd.append("question", question);
    fd.append("history", JSON.stringify(history));
    fd.append("class_level", classLevel);
    fd.append("board", board);
    fd.append("answer_language", answerLanguage);
    if (selectedSubject) fd.append("subject", selectedSubject);

    try {
      const res = await fetch("/api/ask-text", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Server error"); }
      const data = await res.json();

      setMessages((prev) => [
        ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
        { id: assistantId, role: "assistant", text: data.answer, audioUrl: null, typing: true },
      ]);
      updateHistory(question, data.answer);
      setIsLoading(false);
      requestLockRef.current = false;

      // ── Save session after reply ─────────────────────
      if (user && currentSessionId) {
        // Use a short delay so messagesRef has the new assistant message
        setTimeout(() => saveCurrentSession(user.uid, currentSessionId, isFirstMsg ? question : undefined), 400);
      }

      try {
        const audioUrl = await generateAnswerAudio(data.answer, data.language === "hi" ? "hi" : "en");
        if (audioUrl) setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
      } catch (ttsErr) { console.error("TTS failed:", ttsErr); }
    } catch (e) {
      setError(e.message);
      setIsLoading(false);
      requestLockRef.current = false;
    }
  };

  // ── Voice send ─────────────────────────────────────────
  const stopRecordingAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = async () => {
      const blob   = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const stream = mediaRecorderRef.current?.stream;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false); setIsTranscribing(true); cancelledRef.current = false;
      abortControllerRef.current = new AbortController();
      const fd = new FormData();
      fd.append("file", blob, "recording.webm");
      fd.append("history", JSON.stringify(history));
      fd.append("class_level", classLevel);
      fd.append("board", board);
      fd.append("answer_language", answerLanguage);
      if (selectedSubject) fd.append("subject", selectedSubject);
      try {
        const res = await fetch("/api/ask", { method: "POST", body: fd, signal: abortControllerRef.current.signal });
        if (cancelledRef.current) return;
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Server error"); }
        const data = await res.json();
        setIsTranscribing(false);
        setTextInput(data.question);
        pendingVoiceDataRef.current = data;
      } catch (e) {
        if (e.name === "AbortError" || cancelledRef.current) { setIsTranscribing(false); return; }
        setIsTranscribing(false); setError(e.message);
      }
    };
    mediaRecorderRef.current.stop();
  };

  const handleSend = async () => {
    if (!textInput.trim() || isLoading || requestLockRef.current) return;
    if (pendingVoiceDataRef.current) {
      requestLockRef.current = true;
      const data       = pendingVoiceDataRef.current;
      const question   = textInput.trim();
      const isFirstMsg = messages.length === 0;
      pendingVoiceDataRef.current = null; setTextInput(""); setError("");
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
        { id: crypto.randomUUID(), role: "user", text: question, isVoice: true },
        { id: assistantId, role: "assistant", text: data.answer, audioUrl: data.audio_url, typing: false },
      ]);
      updateHistory(question, data.answer);

      // ── Save session ──────────────────────────────────
      if (user && currentSessionId) {
        setTimeout(() => saveCurrentSession(user.uid, currentSessionId, isFirstMsg ? question : undefined), 400);
      }

      if (data.audio_url) {
        setTimeout(() => {
          setMessages((prev) => {
            const aiIndex = prev.findIndex((m) => m.id === assistantId);
            if (aiIndex !== -1) playAudio(data.audio_url, aiIndex);
            return prev;
          });
        }, 200);
      }
      requestLockRef.current = false;
      return;
    }
    await handleTextSend();
  };

  const startRecording = async () => {
    setError(""); stopAudio(); pendingVoiceDataRef.current = null; setTextInput("");
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder; audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start(); setIsRecording(true);
    } catch (e) { setError("Microphone access denied. Please allow microphone permission."); }
  };

  // ── Loading screen ─────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: B.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <TeachifyyLogo size={76} />
        <div style={{ fontSize: "14px", color: B.gray500 }}>Loading...</div>
      </div>
    );
  }

  // ── Auth screen ────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: B.bg, minHeight: "100vh" }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <nav style={{ background: B.navy, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(43,88,136,0.15)" }}>
          <TeachifyyLogo size={30} light />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Student Voice Assistant</span>
        </nav>
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ height: "4px", borderRadius: "2px", background: `linear-gradient(90deg, ${B.navy}, ${B.red})`, marginBottom: "28px" }} />
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 8px 32px rgba(43,88,136,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <TeachifyyLogo size={36} />
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: B.navy, margin: "14px 0 6px" }}>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
              <p style={{ fontSize: "14px", color: B.gray500, margin: 0 }}>{authMode === "login" ? "Login to continue learning." : "Create your student profile."}</p>
            </div>
            {authError && <div style={{ marginBottom: "16px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", color: B.red, fontSize: "13px", fontWeight: 500 }}>⚠️ {authError}</div>}
            {authMode === "signup" && (
              <>
                <label style={labelStyle}>Full Name</label>
                <input value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter your name" style={inputStyle} />
                <label style={labelStyle}>Mobile Number</label>
                <input value={signupMobile} onChange={(e) => setSignupMobile(e.target.value)} placeholder="Enter mobile number" style={inputStyle} />
              </>
            )}
            <label style={labelStyle}>Email</label>
            <input type="email" value={authMode === "login" ? loginEmail : signupEmail} onChange={(e) => authMode === "login" ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)} placeholder="Enter email" style={inputStyle} />
            <label style={labelStyle}>Password</label>
            <input type="password" value={authMode === "login" ? loginPassword : signupPassword} onChange={(e) => authMode === "login" ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)} placeholder="Enter password" style={inputStyle} />
            {authMode === "signup" && (
              <>
                <label style={labelStyle}>Class</label>
                <select value={signupClassLevel} onChange={(e) => setSignupClassLevel(e.target.value)} style={inputStyle}>{["5","6","7","8","9","10"].map((c) => <option key={c} value={c}>Class {c}</option>)}</select>
                <label style={labelStyle}>Board</label>
                <select value={signupBoard} onChange={(e) => setSignupBoard(e.target.value)} style={inputStyle}>{["CBSE","RBSE","ICSE","Other"].map((b) => <option key={b} value={b}>{b}</option>)}</select>
              </>
            )}
            <button onClick={authMode === "login" ? handleLogin : handleCreateAccount} disabled={authLoading} style={{ width: "100%", padding: "13px 16px", border: "none", borderRadius: "12px", background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, color: B.white, fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "6px", opacity: authLoading ? 0.6 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.2px" }}>
              {authMode === "login" ? "Login →" : "Create Account →"}
            </button>
            <button onClick={() => { setAuthError(""); setAuthMode(authMode === "login" ? "signup" : "login"); }} style={{ width: "100%", marginTop: "14px", background: "transparent", border: "none", color: B.navy, cursor: "pointer", fontSize: "14px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {authMode === "login" ? "New student? Create account" : "Already have an account? Login"}
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: B.gray500, fontStyle: "italic" }}>Develop what teaching demands</p>
        </div>
      </div>
    );
  }

  // ── Language selection screen ──────────────────────────
  if (!profileCompleted) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: B.bg, minHeight: "100vh" }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <nav style={{ background: B.navy, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(43,88,136,0.15)" }}>
          <TeachifyyLogo size={30} light />
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.15)", color: B.white, cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>Logout</button>
        </nav>
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 8px 32px rgba(43,88,136,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: B.navyLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "28px" }}>🎓</div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: B.navy, marginBottom: "6px" }}>Welcome, {userProfile?.name || "Student"}!</h1>
              <p style={{ fontSize: "14px", color: B.gray500 }}>Class {classLevel} · {board}</p>
            </div>
            <label style={labelStyle}>Choose answer language</label>
            <select value={answerLanguage} onChange={(e) => handleAnswerLanguageChange(e.target.value)} style={inputStyle}>
              {ANSWER_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button onClick={() => { setProfileCompleted(true); setCurrentSessionId(crypto.randomUUID()); }} style={{ width: "100%", padding: "13px 16px", border: "none", borderRadius: "12px", background: `linear-gradient(135deg, ${B.red}, ${B.orange})`, color: B.white, fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────
  const overallProgress = getOverallProgress();
  const sessionGroups   = groupSessionsByDate(chatSessions);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: B.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{ background: B.navy, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(43,88,136,0.15)", position: "sticky", top: 0, zIndex: 100 }}>
        <TeachifyyLogo size={28} light />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: B.white, fontSize: "13px", fontWeight: 600 }}>{userProfile?.name || user?.email}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>Class {classLevel} · {board}</div>
          </div>
          <button onClick={handleLogout} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: B.white, cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>Logout</button>
        </div>
      </nav>
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${B.red}, ${B.orange}, ${B.warm})` }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 16px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>Welcome back, {userProfile?.name?.split(" ")[0] || "Student"} 👋</h1>
          <p style={{ fontSize: "13px", color: B.gray500 }}>Ask anything in Hindi, English, or Hinglish</p>
        </div>

        {/* Tabs — now 4 tabs including History */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", background: B.gray200, padding: "5px", borderRadius: "14px" }}>
          {[
            { key: "chat",     label: "💬 Chatbot" },
            { key: "history",  label: "🕐 History" },
            { key: "doubts",   label: "❓ Doubts" },
            { key: "syllabus", label: "📚 Syllabus" },
            { key: "test",     label: "📝 Test", disabled: !currentTest && !testLoading },
          ].map(({ key, label, disabled }) => (
            <button
              key={key}
              onClick={() => {
                if (key === "test" && (currentTest || testLoading)) { setActiveTab("test"); return; }
                if (key !== "test") setActiveTab(key);
              }}
              disabled={disabled}
              style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", background: activeTab === key ? B.navy : "transparent", color: activeTab === key ? B.white : B.gray700, opacity: disabled ? 0.4 : 1, transition: "all 0.2s" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CHAT TAB ── */}
        {activeTab === "chat" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            {/* Chat header */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${B.gray200}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: B.white }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: B.navy }}>AI Tutor</span>
                <span style={{ fontSize: "11px", color: B.gray500, background: B.navyLight, padding: "2px 8px", borderRadius: "20px" }}>
                  {answerLanguage === "en" ? "English" : answerLanguage === "hi" ? "हिंदी" : "Hinglish"}
                </span>
                {selectedSubject && (
                  <span style={{ fontSize: "11px", color: B.green, background: B.greenLight, padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>📖 {selectedSubject}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {messages.length > 0 && (
                  <button onClick={clearConversation} style={{ fontSize: "12px", color: B.gray500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    🗑 Clear
                  </button>
                )}
                <button onClick={startNewSession} style={{ fontSize: "12px", color: B.navy, background: B.navyLight, border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  + New chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ height: "400px", overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", background: B.gray50 }}>
              {messages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: B.gray500 }}>
                  <div style={{ fontSize: "42px", marginBottom: "10px" }}>💬</div>
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>Press the mic or type to start asking</p>
                  <p style={{ fontSize: "12px", color: B.gray500, marginTop: "4px" }}>Supports Hindi · English · Hinglish</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id} id={`chat-message-${msg.id}`}>
                    {msg.role === "user" ? (
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: "row-reverse" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${B.red}, ${B.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: B.white, marginTop: "2px" }}>{userProfile?.name?.[0]?.toUpperCase() || "Y"}</div>
                        <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: "16px 4px 16px 16px", background: B.navy, color: B.white, fontSize: "14px", lineHeight: "1.6", maxHeight: "120px", overflowY: "auto", boxShadow: "0 2px 8px rgba(43,88,136,0.2)" }}>{msg.text}</div>
                      </div>
                    ) : (
                      <AssistantBubble msg={msg} index={i} playingIndex={playingIndex} playAudio={playAudio} stopAudio={stopAudio} onTypingComplete={markTypingComplete} />
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: B.white, flexShrink: 0 }}>AI</div>
                  <div style={{ padding: "14px 18px", background: B.white, borderRadius: "4px 16px 16px 16px", border: `1px solid ${B.gray200}`, display: "flex", gap: "5px", alignItems: "center", boxShadow: "0 1px 4px rgba(43,88,136,0.06)" }}>
                    {[0, 0.2, 0.4].map((delay) => <div key={delay} style={{ width: "7px", height: "7px", borderRadius: "50%", background: B.navy, animation: `bounce 1.2s ${delay}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {error && <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", fontSize: "13px", color: B.red, fontWeight: 500 }}>⚠️ {error}</div>}

            {isTranscribing && (
              <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.navyLight, border: `1px solid ${B.navy}`, borderRadius: "10px", fontSize: "13px", color: B.navy, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: B.navy, animation: "pulse 1s infinite" }} /><span style={{ fontWeight: 500 }}>Processing your voice...</span></div>
                <button onClick={cancelProcessing} style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "20px", border: `1px solid ${B.navy}`, background: B.white, color: B.navy, cursor: "pointer", fontWeight: 600 }}>✕ Cancel</button>
              </div>
            )}

            {isRecording && (
              <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", fontSize: "13px", color: B.red, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: B.red, animation: "pulse 1s infinite" }} />
                <span style={{ fontWeight: 500 }}>Recording... press mic again to stop</span>
              </div>
            )}

            {messages[messages.length - 1]?.role === "assistant" && !isRecording && !isTranscribing && (
              <div style={{ padding: "10px 16px", borderTop: `1px solid ${B.gray100}`, background: B.white, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { key: "simplify", icon: "💡" },
                  { key: "example", icon: "🌍" },
                  { key: "quiz", icon: "✓" },
                ].map(({ key, icon }) => {
                  const action = FOLLOW_UP_ACTIONS[key];
                  const latestAssistant = messages[messages.length - 1];
                  const showMarkAsDoubt = key === latestAssistant.followUpType;
                  const savedDoubt = showMarkAsDoubt
                    ? doubts.find((doubt) => doubt.assistantMessageId === latestAssistant.id)
                    : null;
                  const doubtSaved = Boolean(savedDoubt && !isInterfaceDoubtTitle(savedDoubt.topicName));
                  return (
                    <button
                      key={key}
                      onClick={() => showMarkAsDoubt ? markAsDoubt(latestAssistant) : handleFollowUp(key)}
                      disabled={isLoading || doubtSaved || savingDoubtId === latestAssistant.id}
                      style={{ flex: "1 1 190px", minHeight: "38px", padding: "8px 11px", border: `1px solid ${doubtSaved ? B.greenBorder : B.gray300}`, borderRadius: "8px", background: doubtSaved ? B.greenLight : B.gray50, color: doubtSaved ? B.green : B.navy, fontSize: "11px", lineHeight: "1.35", fontWeight: 600, cursor: isLoading || doubtSaved ? "not-allowed" : "pointer", opacity: isLoading ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left", display: "flex", alignItems: "center", gap: "7px" }}
                    >
                      <span aria-hidden="true">{showMarkAsDoubt ? (doubtSaved ? "✓" : "❓") : icon}</span>
                      <span>
                        {showMarkAsDoubt
                          ? doubtSaved
                            ? "Saved in Doubts"
                            : savingDoubtId === latestAssistant.id
                              ? "Saving doubt..."
                              : "Mark as doubt"
                          : getFollowUpLabel(action)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {!isRecording && !isTranscribing && pendingVoiceDataRef.current && textInput && (
              <div style={{ margin: "0 16px 8px", fontSize: "12px", color: B.navy, padding: "0 4px", fontWeight: 500 }}>✏️ Review or edit your question, then press Send</div>
            )}

            {/* Input area */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${B.gray200}`, display: "flex", gap: "8px", alignItems: "flex-end", background: B.white }}>
              <textarea
                placeholder={isTranscribing ? "Transcribing your voice..." : "Type your question here..."}
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); if (pendingVoiceDataRef.current) pendingVoiceDataRef.current = null; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={isLoading || isRecording || isTranscribing}
                rows={1}
                style={{ flex: 1, padding: "10px 16px", border: `1.5px solid ${B.gray300}`, borderRadius: "14px", fontSize: "14px", color: B.gray900, background: isTranscribing ? B.gray100 : B.gray50, outline: "none", resize: "none", overflowY: "auto", maxHeight: "100px", lineHeight: "1.5", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "border-color 0.2s" }}
                onFocus={(e) => { e.target.style.borderColor = B.navy; }}
                onBlur={(e)  => { e.target.style.borderColor = B.gray300; }}
              />
              <select
                value={answerLanguage}
                onChange={(e) => handleAnswerLanguageChange(e.target.value)}
                disabled={isLoading || isRecording || isTranscribing}
                style={{ height: "42px", minWidth: "96px", borderRadius: "12px", border: `1.5px solid ${B.gray300}`, background: B.white, color: B.navy, fontSize: "12px", fontWeight: 700, cursor: isLoading || isRecording || isTranscribing ? "not-allowed" : "pointer", outline: "none", padding: "0 8px", opacity: isLoading || isRecording || isTranscribing ? 0.55 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {ANSWER_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <button onClick={handleSend} disabled={isLoading || isRecording || isTranscribing || !textInput.trim()} style={{ width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0, background: textInput.trim() ? `linear-gradient(135deg, ${B.navy}, ${B.navyDark})` : B.gray200, color: B.white, border: "none", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isLoading || isRecording || isTranscribing || !textInput.trim()) ? 0.5 : 1, transition: "all 0.2s" }} title="Send (Enter)">➤</button>
              <button onClick={isRecording ? stopRecordingAndTranscribe : startRecording} disabled={isLoading || isTranscribing} style={{ width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: isRecording ? B.red : B.greenLight, color: isRecording ? B.white : B.green, opacity: (isLoading || isTranscribing) ? 0.4 : 1, animation: isRecording ? "pulse 1s infinite" : "none", transition: "all 0.2s" }} title={isRecording ? "Stop recording" : "Start recording"}>🎤</button>
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", color: B.gray500, padding: "8px 16px", borderTop: `1px solid ${B.gray100}`, background: B.white }}>
              Press <kbd style={{ background: B.gray100, padding: "1px 5px", borderRadius: "4px", fontSize: "10px" }}>Enter</kbd> to send · <kbd style={{ background: B.gray100, padding: "1px 5px", borderRadius: "4px", fontSize: "10px" }}>Shift+Enter</kbd> for new line
            </div>
          </div>
        )}

        {/* ── DOUBTS TAB ── */}
        {activeTab === "doubts" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.gray200}` }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: B.navy, margin: 0 }}>My Doubts</h2>
              <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>{doubts.length} saved doubt{doubts.length !== 1 ? "s" : ""}</p>
            </div>

            <div style={{ maxHeight: "600px", overflowY: "auto", padding: doubts.length ? "16px" : 0 }}>
              {doubtsLoading ? (
                <div style={{ padding: "44px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Loading doubts...</div>
              ) : doubts.length === 0 ? (
                <div style={{ padding: "52px 20px", textAlign: "center", color: B.gray500 }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>❓</div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: B.navy }}>No doubts saved yet</p>
                  <p style={{ fontSize: "12px", marginTop: "5px" }}>Choose an easier AI explanation, then mark it as a doubt.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {doubts.map((doubt) => (
                    <div
                      key={doubt.id}
                      style={{ width: "100%", border: `1px solid ${doubt.resolved ? B.greenBorder : B.gray200}`, borderRadius: "8px", background: doubt.resolved ? B.greenLight : B.gray50, overflow: "hidden" }}
                    >
                      <button
                        onClick={() => openDoubtChat(doubt)}
                        style={{ width: "100%", padding: "13px 15px", border: "none", borderBottom: `1px solid ${doubt.resolved ? B.greenBorder : B.gray200}`, background: B.white, textAlign: "left", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: doubt.resolved ? B.green : B.red, textTransform: "uppercase", marginBottom: "4px" }}>{doubt.resolved ? "Resolved" : "Doubt"}</div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: B.navy, lineHeight: "1.45" }}>{getDoubtDisplayTitle(doubt)}</div>
                          </div>
                          <div style={{ fontSize: "11px", color: B.gray500, flexShrink: 0 }}>{formatSessionDate(doubt.createdAt)}</div>
                        </div>
                        <div style={{ fontSize: "11px", color: B.gray500, marginTop: "6px" }}>Open chat at this doubt →</div>
                      </button>
                      <div style={{ padding: "9px 12px", display: "flex", justifyContent: "flex-end", background: doubt.resolved ? B.greenLight : B.gray50 }}>
                        <button
                          onClick={() => markDoubtResolved(doubt)}
                          disabled={doubt.resolved || resolvingDoubtId === doubt.id}
                          style={{ padding: "6px 11px", borderRadius: "8px", border: `1px solid ${B.greenBorder}`, background: doubt.resolved ? B.white : B.green, color: doubt.resolved ? B.green : B.white, fontSize: "11px", fontWeight: 700, cursor: doubt.resolved ? "default" : "pointer", opacity: resolvingDoubtId === doubt.id ? 0.55 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {doubt.resolved ? "✓ Resolved" : resolvingDoubtId === doubt.id ? "Saving..." : "Mark resolved"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>

            {/* History header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.gray200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: B.navy, margin: 0 }}>Chat History</h2>
                <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>{chatSessions.length} saved conversations</p>
              </div>
              <button onClick={startNewSession} style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, color: B.white, fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                + New Chat
              </button>
            </div>

            {/* Session viewer (when a session is expanded) */}
            {viewingSession && (
              <div style={{ borderBottom: `1px solid ${B.gray200}`, background: B.gray50 }}>
                <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${B.gray200}` }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: B.navy }}>{viewingSession.title}</div>
                    <div style={{ fontSize: "11px", color: B.gray500, marginTop: "2px" }}>
                      {viewingSession.classLevel && `Class ${viewingSession.classLevel}`}{viewingSession.board && ` · ${viewingSession.board}`}
                      {viewingSession.updatedAt && ` · ${formatSessionDate(viewingSession.updatedAt)}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openSession(viewingSession)} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: B.navy, color: B.white, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                      Continue →
                    </button>
                    <button onClick={() => setViewingSession(null)} style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, fontSize: "12px", cursor: "pointer" }}>
                      ✕ Close
                    </button>
                  </div>
                </div>
                {/* Preview messages */}
                <div style={{ maxHeight: "320px", overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(viewingSession.messages || []).map((msg, i) => (
                    <div key={msg.id || i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? `linear-gradient(135deg, ${B.red}, ${B.orange})` : `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: B.white }}>
                        {msg.role === "user" ? (userProfile?.name?.[0]?.toUpperCase() || "Y") : "AI"}
                      </div>
                      <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: msg.role === "user" ? B.navy : B.white, color: msg.role === "user" ? B.white : B.gray900, fontSize: "13px", lineHeight: "1.5", border: msg.role === "user" ? "none" : `1px solid ${B.gray200}`, whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "120px" }}>
                        {(msg.text || "").replace(/\*\*/g, "")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session list */}
            <div style={{ overflowY: "auto", maxHeight: viewingSession ? "260px" : "520px" }}>
              {historyLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Loading history...</div>
              ) : chatSessions.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", color: B.gray500 }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🕐</div>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>No chat history yet</p>
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>Start a conversation and it will appear here.</p>
                </div>
              ) : (
                Object.entries(sessionGroups).map(([groupLabel, sessions]) => {
                  if (!sessions.length) return null;
                  return (
                    <div key={groupLabel}>
                      {/* Group header */}
                      <div style={{ padding: "10px 20px 6px", fontSize: "11px", fontWeight: 700, color: B.gray500, textTransform: "uppercase", letterSpacing: "0.6px", background: B.gray50, borderBottom: `1px solid ${B.gray100}` }}>
                        {groupLabel}
                      </div>
                      {sessions.map((session) => {
                        const isActive   = session.id === currentSessionId;
                        const isViewing  = viewingSession?.id === session.id;
                        const msgCount   = session.messages?.length || 0;
                        const userMsgs   = (session.messages || []).filter((m) => m.role === "user").length;
                        return (
                          <div
                            key={session.id}
                            style={{ padding: "14px 20px", borderBottom: `1px solid ${B.gray100}`, cursor: "pointer", background: isViewing ? B.navyLight : isActive ? "#f8faff" : B.white, transition: "background 0.15s", display: "flex", alignItems: "flex-start", gap: "12px" }}
                            onClick={() => setViewingSession(isViewing ? null : session)}
                          >
                            {/* Session icon */}
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: isActive ? B.navy : B.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                              💬
                            </div>

                            {/* Session info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: B.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {session.title || "Untitled conversation"}
                              </div>
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "3px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <span>{userMsgs} question{userMsgs !== 1 ? "s" : ""}</span>
                                {session.classLevel && <span>Class {session.classLevel}</span>}
                                {session.board      && <span>{session.board}</span>}
                                {isActive           && <span style={{ color: B.green, fontWeight: 700 }}>● Active</span>}
                              </div>
                            </div>

                            {/* Time + actions */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                              <span style={{ fontSize: "11px", color: B.gray500 }}>{formatSessionDate(session.updatedAt)}</span>
                              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openSession(session)}
                                  title="Open this chat"
                                  style={{ padding: "3px 8px", borderRadius: "6px", border: `1px solid ${B.navy}`, background: B.navyLight, color: B.navy, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => { if (window.confirm("Delete this chat?")) deleteSession(session.id); }}
                                  title="Delete"
                                  style={{ padding: "3px 7px", borderRadius: "6px", border: `1px solid ${B.gray300}`, background: B.white, color: B.red, fontSize: "11px", cursor: "pointer" }}
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TEST TAB ── */}
        {activeTab === "test" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "22px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            {testLoading ? (
              <div style={{ textAlign: "center", padding: "48px 12px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📝</div>
                <h2 style={{ fontSize: "20px", color: B.navy, marginBottom: "6px", fontWeight: 700 }}>Generating your test...</h2>
                <p style={{ fontSize: "13px", color: B.gray500 }}>Please wait while AI creates class-appropriate MCQs.</p>
              </div>
            ) : currentTest ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{currentTest.type === "topic" ? "Topic Test" : "Chapter Test"}</div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>{currentTest.type === "topic" ? currentTest.topicTitle : currentTest.chapterTitle}</h2>
                    <p style={{ fontSize: "13px", color: B.gray500 }}>{currentTest.subject} · {currentTest.questions.length} MCQs</p>
                  </div>
                  <button onClick={resetTestView} style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, cursor: "pointer", fontSize: "12px", fontWeight: 500 }}>← Back</button>
                </div>
                {submittedTestResult && (
                  <div style={{ padding: "16px", borderRadius: "14px", background: B.greenLight, border: `1px solid ${B.greenBorder}`, marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>Test Completed ✅</div>
                      <div style={{ fontSize: "13px", color: B.gray500 }}>Score saved to your profile.</div>
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: B.green }}>{submittedTestResult.score}/{submittedTestResult.total}</div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {currentTest.questions.map((question, qi) => {
                    const selected    = selectedAnswers[qi];
                    const isSubmitted = Boolean(submittedTestResult);
                    return (
                      <div key={qi} style={{ padding: "16px", borderRadius: "14px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: B.navy, marginBottom: "12px" }}>Q{qi + 1}. {question.question}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(question.options || []).map((option, oi) => {
                            const isCorrect  = oi === question.answerIndex;
                            const isSelected = Number(selected) === oi;
                            return (
                              <label key={oi} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", cursor: isSubmitted ? "default" : "pointer", fontSize: "13px", color: B.gray900, border: isSubmitted && isCorrect ? `1.5px solid ${B.greenBorder}` : isSubmitted && isSelected && !isCorrect ? `1.5px solid ${B.red}` : `1px solid ${B.gray200}`, background: isSubmitted && isCorrect ? B.greenLight : isSubmitted && isSelected && !isCorrect ? B.redLight : B.white, fontWeight: isSubmitted && isCorrect ? 600 : "normal" }}>
                                <input type="radio" name={`q-${qi}`} checked={Number(selected) === oi} disabled={isSubmitted} onChange={() => setSelectedAnswers((prev) => ({ ...prev, [qi]: oi }))} />
                                <span>{String.fromCharCode(65 + oi)}. {option}</span>
                              </label>
                            );
                          })}
                        </div>
                        {isSubmitted && question.explanation && (
                          <div style={{ marginTop: "10px", fontSize: "12px", color: B.gray500, lineHeight: "1.5", padding: "8px 12px", background: B.navyLight, borderRadius: "8px" }}>
                            <strong style={{ color: B.navy }}>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!submittedTestResult && (
                  <button onClick={submitCurrentTest} disabled={Object.keys(selectedAnswers).length !== currentTest.questions.length}
                    style={{ width: "100%", marginTop: "20px", padding: "13px 16px", borderRadius: "12px", border: "none", background: Object.keys(selectedAnswers).length === currentTest.questions.length ? `linear-gradient(135deg, ${B.navy}, ${B.navyDark})` : B.gray200, color: B.white, fontSize: "15px", fontWeight: 700, cursor: Object.keys(selectedAnswers).length === currentTest.questions.length ? "pointer" : "not-allowed", opacity: Object.keys(selectedAnswers).length === currentTest.questions.length ? 1 : 0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Submit Test
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 12px", color: B.gray500 }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📝</div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>Start a test from the Syllabus Tracker.</p>
              </div>
            )}
          </div>
        )}

        {/* ── SYLLABUS TAB ── */}
        {activeTab === "syllabus" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "24px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>📚</div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>Syllabus Tracker</h2>
              <p style={{ fontSize: "13px", color: B.gray500 }}>Class {classLevel} · {board}</p>
              <div style={{ marginTop: "14px", padding: "14px 16px", borderRadius: "14px", background: B.navyLight, border: `1px solid rgba(43,88,136,0.15)`, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: B.navy }}>Overall Progress</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: B.navy }}>{overallProgress.percent}%</span>
                </div>
                <ProgressBar percent={overallProgress.percent} />
                <div style={{ fontSize: "12px", color: B.gray500, marginTop: "6px" }}>{overallProgress.completed}/{overallProgress.total} topics completed {progressLoading ? "· Syncing..." : ""}</div>
              </div>
            </div>
            {!selectedSubject && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {getOrderedSubjects(currentSyllabus).map((subject) => {
                  const icons = { EVS: "🌱", Maths: "➗", English: "📘", Hindi: "📕", Sanskrit: "📜", Science: "🔬", "Social Science": "🌍", "Art Education": "🎨" };
                  const sp    = getSubjectProgress(subject);
                  return (
                    <button key={subject} onClick={() => { setSelectedSubject(subject); setSelectedChapter(null); }} style={{ padding: "20px 14px", borderRadius: "16px", border: `1.5px solid ${B.gray200}`, background: B.white, cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(43,88,136,0.04)" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icons[subject] || "📖"}</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>{subject}</div>
                      <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "6px" }}>{sp.percent}% completed</div>
                      <div style={{ fontSize: "11px", color: getStatusColor(sp.status), fontWeight: 700, marginBottom: "8px" }}>{sp.status}</div>
                      <ProgressBar percent={sp.percent} />
                      <div style={{ fontSize: "11px", color: B.gray500, marginTop: "6px" }}>{sp.completed}/{sp.total} topics · {currentSyllabus[subject].length} chapters</div>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedSubject && !selectedChapter && (
              <div>
                <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }} style={{ marginBottom: "14px", border: "none", background: "transparent", color: B.navy, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>← Back to Subjects</button>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: B.navy, marginBottom: "12px" }}>{selectedSubject} Chapters</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentChapters.map((chapter, index) => {
                    const cp = getChapterProgress(selectedSubject, chapter);
                    return (
                      <button key={chapter.title} onClick={() => setSelectedChapter(chapter)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "14px", border: `1.5px solid ${B.gray200}`, background: B.white, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                        <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: B.navyLight, color: B.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: B.navy, marginBottom: "4px" }}>{chapter.title}</span>
                          <span style={{ display: "inline-block", fontSize: "11px", color: getStatusColor(cp.status), fontWeight: 700, marginBottom: "6px" }}>{cp.status} · {cp.completed}/{cp.total} topics</span>
                          <ProgressBar percent={cp.percent} />
                        </span>
                        <span style={{ color: B.gray300, fontSize: "18px" }}>›</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedSubject && selectedChapter && (
              <div>
                <button onClick={() => setSelectedChapter(null)} style={{ marginBottom: "14px", border: "none", background: "transparent", color: B.navy, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>← Back to Chapters</button>
                <div style={{ padding: "16px", borderRadius: "14px", background: B.navyLight, border: `1px solid rgba(43,88,136,0.15)`, marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "3px", fontWeight: 500 }}>{selectedSubject}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: B.navy, marginBottom: "10px" }}>{currentChapter.title}</h3>
                  {(() => {
                    const cp               = getChapterProgress(selectedSubject, currentChapter);
                    const savedChapterTest = getSavedTestResult("chapter", selectedSubject, currentChapter.title);
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: B.navy }}>Chapter Progress</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: B.navy }}>{cp.percent}%</span>
                        </div>
                        <ProgressBar percent={cp.percent} />
                        <div style={{ fontSize: "12px", color: B.gray500, marginTop: "6px" }}>{cp.completed}/{cp.total} topics completed</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                          <button onClick={handleChapterTest} style={{ padding: "8px 14px", border: "none", borderRadius: "10px", background: B.navy, color: B.white, fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>Chapter Test — 20 MCQs</button>
                          {savedChapterTest && <span style={{ fontSize: "12px", color: B.green, fontWeight: 700 }}>Last: {savedChapterTest.score}/{savedChapterTest.total}</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentChapter.subtopics.map((subtopic, index) => {
                    const currentStatus  = getTopicStatus(selectedSubject, currentChapter.title, subtopic);
                    const topicCompleted = isCompletedStatus(currentStatus);
                    const savedTopicTest = getSavedTestResult("topic", selectedSubject, currentChapter.title, subtopic);
                    const revised        = getRevisionStatus(selectedSubject, currentChapter.title, subtopic);
                    return (
                      <div key={subtopic} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", background: B.white, border: topicCompleted ? `1.5px solid ${B.greenBorder}` : `1px solid ${B.gray200}`, flexWrap: "wrap" }}>
                        <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: topicCompleted ? B.greenLight : B.navyLight, color: topicCompleted ? B.green : B.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>{topicCompleted ? "✓" : index + 1}</span>
                        <span style={{ flex: 1, fontSize: "13px", color: B.gray900, fontWeight: 500, minWidth: "120px" }}>{subtopic}</span>
                        <select value={currentStatus} onChange={(e) => updateTopicStatus(selectedSubject, currentChapter.title, subtopic, e.target.value)} style={{ padding: "5px 8px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {savedTopicTest && <span style={{ fontSize: "11px", color: B.green, fontWeight: 700 }}>Test: {savedTopicTest.score}/{savedTopicTest.total}</span>}
                        <button disabled={isLoading || testLoading} onClick={() => handleTopicTest(subtopic)} style={{ padding: "5px 10px", border: `1px solid ${B.greenBorder}`, borderRadius: "8px", background: B.greenLight, color: B.green, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 700, opacity: isLoading || testLoading ? 0.5 : 1 }}>Test</button>
                        <button disabled={isLoading || testLoading} onClick={() => handleReviseTopic(subtopic)} style={{ padding: "5px 10px", border: `1px solid ${revised ? B.navy : B.gray300}`, borderRadius: "8px", background: revised ? B.navyLight : B.white, color: B.navy, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 600, opacity: isLoading || testLoading ? 0.5 : 1 }}>{revised ? "Revised ✓" : "Revise"}</button>
                        <button disabled={isLoading || testLoading} onClick={() => handleStudyTopic(subtopic)} style={{ padding: "5px 10px", border: "none", borderRadius: "8px", background: B.navy, color: B.white, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 600, opacity: isLoading || testLoading ? 0.5 : 1 }}>Study</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
