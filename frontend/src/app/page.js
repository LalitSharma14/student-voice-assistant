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
  increment,
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

const STUDENT_APP_TABS = new Set([
  "home", "chat", "syllabus", "test", "doubts", "history",
  "notes", "activity", "reports", "parent", "badges",
]);

const USAGE_SECTION_LABELS = {
  home: "Home",
  chat: "AI Tutor",
  syllabus: "Syllabus",
  test: "Tests",
  doubts: "Doubts",
  history: "History",
  notes: "Notes",
  activity: "Activity",
  reports: "Reports",
  parent: "Parent View",
  badges: "Badges",
};

const DAILY_GOAL_DEFINITIONS = [
  { id: "study", text: "Complete one syllabus topic", tab: "syllabus" },
  { id: "test", text: "Attempt one topic test", tab: "test" },
  { id: "question", text: "Ask one AI Tutor question", tab: "chat" },
];

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

function SidebarIcon({ type }) {
  const paths = {
    home: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    syllabus: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H5a2 2 0 0 1-1-1z" />,
    test: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    doubts: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    history: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  };
  return <svg className="student-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
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

async function readApiJson(response, fallbackMessage = "The AI service is unavailable. Please try again.") {
  const rawBody = await response.text();
  let payload = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const backendUnavailable = response.status >= 500 && (!payload || rawBody.startsWith("Internal Server Error"));
    throw new Error(
      payload?.detail ||
      (backendUnavailable
        ? "The AI backend is not running or is temporarily unavailable. Start the local backend and try again."
        : rawBody || fallbackMessage)
    );
  }

  if (!payload) {
    throw new Error("The AI backend returned an invalid response. Please try again.");
  }

  return payload;
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
  const creditText = [diagram.attribution, diagram.license].filter(Boolean).join(" - ");
  return (
    <div style={{ marginTop: "14px", border: `1px solid ${B.gray200}`, borderRadius: "10px", overflow: "hidden", background: B.gray50 }}>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, color: B.navy, fontSize: "13px" }}>Diagram: {diagram.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: B.gray500, fontSize: "11px", flexWrap: "wrap" }}>
          {diagram.sourceUrl ? <a href={diagram.sourceUrl} target="_blank" rel="noreferrer" style={{ color: B.gray500, fontWeight: 600, textDecoration: "none" }}>{diagram.source || "Source"}</a> : diagram.source && <span>{diagram.source}</span>}
          <a href={diagram.image} target="_blank" rel="noreferrer" style={{ color: B.navy, fontWeight: 700, textDecoration: "none" }}>Open full size</a>
        </div>
      </div>
      <div style={{ padding: "10px", background: B.white }}>
        <a href={diagram.image} target="_blank" rel="noreferrer" title="Open full size diagram" style={{ display: "block", cursor: "zoom-in" }}>
          <img src={diagram.image} alt={diagram.title || "Topic diagram"} style={{ width: "100%", maxHeight: "360px", objectFit: "contain", display: "block", borderRadius: "6px", background: B.white }} />
        </a>
      </div>
      {creditText && <div style={{ padding: "7px 12px", borderTop: `1px solid ${B.gray200}`, fontSize: "10.5px", color: B.gray500, lineHeight: 1.45 }}>Credit: {creditText}</div>}
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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatUsageDuration(value) {
  const seconds = Math.max(0, Math.round(Number(value) || 0));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
  const [activeTab,          setActiveTab]          = useState("home");
  const [selectedSubject,    setSelectedSubject]    = useState(null);
  const [selectedChapter,    setSelectedChapter]    = useState(null);
  const [selectedTopic,      setSelectedTopic]      = useState(null);
  const [topicProgress,      setTopicProgress]      = useState({});
  const [revisionProgress,   setRevisionProgress]   = useState({});
  const [testResults,        setTestResults]        = useState({});
  const [progressLoading,    setProgressLoading]    = useState(false);
  const [testLoading,        setTestLoading]        = useState(false);
  const [testSubmitting,     setTestSubmitting]     = useState(false);
  const [currentTest,        setCurrentTest]        = useState(null);
  const [selectedAnswers,    setSelectedAnswers]    = useState({});
  const [submittedTestResult,setSubmittedTestResult]= useState(null);
  const [selectedTestAttempt,setSelectedTestAttempt]= useState(null);
  const [testSubjectFilter,   setTestSubjectFilter]   = useState("All");
  const [notificationsOpen,   setNotificationsOpen]   = useState(false);
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
  const [notes,              setNotes]              = useState([]);
  const [notesLoading,       setNotesLoading]       = useState(false);
  const [noteTitle,          setNoteTitle]          = useState("");
  const [noteBody,           setNoteBody]           = useState("");
  const [noteSubject,        setNoteSubject]        = useState("");
  const [editingNoteId,      setEditingNoteId]      = useState(null);
  const [activityLogs,       setActivityLogs]       = useState([]);
  const [activityLoading,    setActivityLoading]    = useState(false);
  const [reports,            setReports]            = useState([]);
  const [reportsLoading,     setReportsLoading]     = useState(false);
  const [reportRange,        setReportRange]        = useState("weekly");
  const [globalSearch,       setGlobalSearch]       = useState("");
  const [usageDays,          setUsageDays]          = useState([]);
  const [usageLoading,       setUsageLoading]       = useState(false);
  const [sessionUsageSeconds,setSessionUsageSeconds]= useState(0);
  const [usageActive,        setUsageActive]        = useState(false);
  const [pendingUsageByDate, setPendingUsageByDate] = useState({});
  const [dailyGoalDays,      setDailyGoalDays]      = useState([]);
  const [dailyGoals,         setDailyGoals]         = useState({ study: false, test: false, question: false });
  const [dailyGoalsLoading,  setDailyGoalsLoading]  = useState(false);

  const currentSyllabus = SYLLABUS_DATA[classLevel]?.[board] || SYLLABUS_DATA["5"]?.CBSE;
  const syllabusSubjectOptions = getOrderedSubjects(currentSyllabus);
  const currentChapters = selectedSubject ? currentSyllabus?.[selectedSubject] || [] : [];
  const currentChapter = typeof selectedChapter === "string"
    ? currentChapters.find((chapter) => chapter.title === selectedChapter) || null
    : selectedChapter;

  useEffect(() => {
    if (activeTab === "syllabus" && !selectedSubject && syllabusSubjectOptions.length) {
      setSelectedSubject(syllabusSubjectOptions[0]);
      setSelectedChapter(null);
      setSelectedTopic(null);
    }
  }, [activeTab, selectedSubject, syllabusSubjectOptions]);

  const mediaRecorderRef   = useRef(null);
  const audioChunksRef     = useRef([]);
  const chatEndRef         = useRef(null);
  const audioRef           = useRef(null);
  const abortControllerRef = useRef(null);
  const cancelledRef       = useRef(false);
  const pendingVoiceDataRef= useRef(null);
  const requestLockRef     = useRef(false);
  const activeTopicContextRef = useRef(null);
  const tabHistoryReadyRef = useRef(false);
  const restoringTabRef    = useRef(false);
  const activeTabRef       = useRef(activeTab);
  const usagePendingRef    = useRef({});
  const usageLastInteractionRef = useRef(0);
  const usageLastTickRef   = useRef(0);
  const usageLastFlushRef  = useRef(0);
  const usageFlushLockRef  = useRef(false);
  // Ref so saveCurrentSession can read latest messages without stale closure
  const messagesRef        = useRef(messages);
  const historyRef         = useRef(history);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { historyRef.current  = history;  }, [history]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  useEffect(() => {
    if (!profileCompleted || typeof window === "undefined") {
      tabHistoryReadyRef.current = false;
      return undefined;
    }

    const tabUrl = (tab) => `${window.location.pathname}${window.location.search}${tab === "home" ? "" : `#${tab}`}`;
    const hashTab = window.location.hash.replace(/^#/, "");
    const initialTab = STUDENT_APP_TABS.has(hashTab) ? hashTab : "home";

    restoringTabRef.current = true;
    window.history.replaceState({ ...window.history.state, studentTab: initialTab }, "", tabUrl(initialTab));
    setActiveTab(initialTab);
    setNotificationsOpen(false);
    tabHistoryReadyRef.current = true;

    const handlePopState = (event) => {
      const eventTab = event.state?.studentTab;
      const currentHashTab = window.location.hash.replace(/^#/, "");
      const nextTab = STUDENT_APP_TABS.has(eventTab)
        ? eventTab
        : STUDENT_APP_TABS.has(currentHashTab) ? currentHashTab : "home";
      restoringTabRef.current = true;
      setNotificationsOpen(false);
      setActiveTab(nextTab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      tabHistoryReadyRef.current = false;
    };
  }, [profileCompleted]);

  useEffect(() => {
    if (!profileCompleted || !tabHistoryReadyRef.current || typeof window === "undefined") return;
    if (restoringTabRef.current) {
      restoringTabRef.current = false;
      return;
    }
    if (window.history.state?.studentTab === activeTab) return;

    const tabUrl = `${window.location.pathname}${window.location.search}${activeTab === "home" ? "" : `#${activeTab}`}`;
    window.history.pushState({ ...window.history.state, studentTab: activeTab }, "", tabUrl);
    setNotificationsOpen(false);
  }, [activeTab, profileCompleted]);

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

  const loadUsageDays = async (uid) => {
    if (!uid) return;
    setUsageLoading(true);
    try {
      const usageQuery = query(
        collection(db, "users", uid, "usageDays"),
        orderBy("date", "desc"),
        limit(90)
      );
      const snap = await getDocs(usageQuery);
      const loaded = [];
      snap.forEach((usageDoc) => loaded.push({ id: usageDoc.id, ...usageDoc.data() }));
      setUsageDays(loaded);
    } catch (err) {
      console.error("Usage load error:", err);
    } finally {
      setUsageLoading(false);
    }
  };

  const loadDailyGoals = async (uid) => {
    if (!uid) return;
    setDailyGoalsLoading(true);
    try {
      const goalsQuery = query(
        collection(db, "users", uid, "dailyGoals"),
        orderBy("date", "desc"),
        limit(90)
      );
      const snap = await getDocs(goalsQuery);
      const loaded = [];
      snap.forEach((goalDoc) => loaded.push({ id: goalDoc.id, ...goalDoc.data() }));
      setDailyGoalDays(loaded);
      const today = loaded.find((day) => (day.date || day.id) === getLocalDateKey());
      setDailyGoals({
        study: Boolean(today?.study),
        test: Boolean(today?.test),
        question: Boolean(today?.question),
      });
    } catch (err) {
      console.error("Daily goals load error:", err);
    } finally {
      setDailyGoalsLoading(false);
    }
  };

  const completeDailyGoal = async (goalId) => {
    if (!user || !["study", "test", "question"].includes(goalId) || dailyGoals[goalId]) return;
    const date = getLocalDateKey();
    setDailyGoals((current) => ({ ...current, [goalId]: true }));
    setDailyGoalDays((current) => {
      const index = current.findIndex((day) => (day.date || day.id) === date);
      if (index < 0) return [{ id: date, date, [goalId]: true }, ...current];
      return current.map((day, dayIndex) => dayIndex === index ? { ...day, [goalId]: true } : day);
    });
    try {
      await setDoc(doc(db, "users", user.uid, "dailyGoals", date), {
        date,
        [goalId]: true,
        classLevel,
        board,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error("Daily goal save error:", err);
      setDailyGoals((current) => ({ ...current, [goalId]: false }));
      loadDailyGoals(user.uid);
    }
  };

  useEffect(() => {
    if (user) {
      loadTopicProgress(user.uid);
      loadRevisionProgress(user.uid);
      loadTestResults(user.uid);
      loadChatSessions(user.uid);
      loadDoubts(user.uid);
      loadNotes(user.uid);
      loadActivityLogs(user.uid);
      loadReports(user.uid);
      loadUsageDays(user.uid);
      loadDailyGoals(user.uid);
    } else {
      setTopicProgress({});
      setRevisionProgress({});
      setTestResults({});
      setChatSessions([]);
      setDoubts([]);
      setNotes([]);
      setActivityLogs([]);
      setReports([]);
      setUsageDays([]);
      setSessionUsageSeconds(0);
      usagePendingRef.current = {};
      setPendingUsageByDate({});
      setDailyGoalDays([]);
      setDailyGoals({ study: false, test: false, question: false });
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
    await flushUsage();
    await signOut(auth);
    setUser(null); setUserProfile(null); setMessages([]); setHistory([]); setTextInput("");
    setTopicProgress({}); setRevisionProgress({}); setTestResults({});
    setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null); setSelectedTestAttempt(null);
    setActiveTab("chat"); setSelectedSubject(null); setSelectedChapter(null); setSelectedTopic(null);
    setProfileCompleted(false); pendingVoiceDataRef.current = null;
    setChatSessions([]); setCurrentSessionId(null); setViewingSession(null);
    setDoubts([]); setSavingDoubtId(null);
    setNotes([]); resetNoteForm();
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

  const getTestAttempts = () => Object.values(testResults || {})
    .filter((result) => result?.attemptId || result?.testId)
    .sort((a, b) => {
      const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || a.updatedAt || 0);
      const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || b.updatedAt || 0);
      return dateB - dateA;
    });

  const getScoreCaption = (percentage = 0) => {
    if (percentage >= 90) return { label: "Excellent", color: B.green, bg: B.greenLight };
    if (percentage >= 75) return { label: "Great Work", color: B.navy, bg: B.navyLight };
    if (percentage >= 55) return { label: "Almost There", color: B.orange, bg: B.orangeLight };
    return { label: "Keep Practising", color: B.red, bg: B.redLight };
  };

  const formatMarks = (value = 0) => Number(value).toFixed(1).replace(/\.0$/, "");

  const getSavedTestResult = (type, subject, chapterTitle, topicTitle = "") => {
    const baseTestId = getTestId(type, subject, chapterTitle, topicTitle);
    return getTestAttempts().find((result) => result.testId === baseTestId) || null;
  };

  const loadTestResults = async (uid) => {
    if (!uid) return;
    try { const snap = await getDocs(collection(db, "users", uid, "testResults")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setTestResults(loaded); }
    catch (err) { console.error("Test results load error:", err); }
  };

  const saveTestResult = async (resultData) => {
    if (!user || !resultData?.attemptId) return;
    setTestResults((prev) => ({ ...prev, [resultData.attemptId]: { ...resultData, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }));
    try {
      await setDoc(
        doc(db, "users", user.uid, "testResults", resultData.attemptId),
        { ...resultData, submittedAt: serverTimestamp(), updatedAt: serverTimestamp() },
        { merge: true }
      );
      completeDailyGoal("test");
    }
    catch (err) { console.error("Test result save error:", err); }
  };

  const startTest = async ({ type, subject, chapterTitle, topicTitle = "", topics = [], questionCount }) => {
    if (!user) { setError("Please login to start a test."); return; }
    setError(""); setTestLoading(true); setSelectedAnswers({}); setSubmittedTestResult(null); setSelectedTestAttempt(null); setCurrentTest(null); setActiveTab("test");
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
      const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 1), 0);
      setCurrentTest({ testId, type, subject, chapterTitle, topicTitle, questionCount: questions.length, totalMarks, questions });
      logActivity({
        type: "test_started",
        title: `${type === "topic" ? "Topic" : "Chapter"} test started`,
        subject,
        chapterTitle,
        topicTitle,
        details: topicTitle || chapterTitle,
      });
    } catch (err) { console.error("Test generation error:", err); setError(err.message || "Could not generate test."); setActiveTab("syllabus"); }
    finally { setTestLoading(false); }
  };

  const handleTopicTest   = (subtopic) => { if (!selectedSubject || !currentChapter || !subtopic) return; startTest({ type: "topic", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: subtopic, topics: [subtopic], questionCount: 10 }); };
  const handleChapterTest = () => { if (!selectedSubject || !currentChapter) return; startTest({ type: "chapter", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: "", topics: currentChapter.subtopics || [], questionCount: 20 }); };

  const submitCurrentTest = async () => {
    if (!currentTest?.questions?.length) return;
    setTestSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("questions", JSON.stringify(currentTest.questions));
      fd.append("answers", JSON.stringify(selectedAnswers));
      fd.append("class_level", classLevel);
      fd.append("board", board);
      fd.append("answer_language", answerLanguage);
      const res = await fetch("/api/grade-test", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Could not grade test."); }
      const data = await res.json();
      const attemptId = `${currentTest.testId}_${Date.now()}`;
      const resultData = {
        attemptId,
        testId: currentTest.testId,
        type: currentTest.type,
        subject: currentTest.subject,
        chapterTitle: currentTest.chapterTitle,
        topicTitle: currentTest.topicTitle || "",
        score: Number(data.score || 0),
        total: Number(data.total || currentTest.totalMarks || currentTest.questions.length),
        percentage: Number(data.percentage || 0),
        caption: getScoreCaption(Number(data.percentage || 0)).label,
        classLevel,
        board,
        questions: currentTest.questions,
        answers: selectedAnswers,
        grades: Array.isArray(data.grades) ? data.grades : [],
      };
      setSubmittedTestResult(resultData);
      await saveTestResult(resultData);
    } catch (err) {
      console.error("Test submit error:", err);
      setError(err.message || "Could not submit test.");
    } finally {
      setTestSubmitting(false);
    }
  };

  const resetTestView = () => { setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null); setSelectedTestAttempt(null); setActiveTab("syllabus"); };

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
    const data = await readApiJson(res, "Could not convert stored content language.");
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
    activeTopicContextRef.current = { classLevel, board, subject: selectedSubject, chapter: currentChapter.title, topic: subtopic };
    await updateRevisionStatus(selectedSubject, currentChapter.title, subtopic);
    logActivity({ type: "revision", title: `Revised ${subtopic}`, subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: subtopic, details: "Revision topic opened" });
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
    activeTopicContextRef.current = { classLevel, board, subject: selectedSubject, chapter: currentChapter.title, topic: subtopic };
    await updateTopicStatus(selectedSubject, currentChapter.title, subtopic, "Completed");
    logActivity({ type: "study", title: `Studied ${subtopic}`, subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: subtopic, details: "Topic marked completed" });
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

  const askAiAboutTopicDoubt = (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic) return;
    activeTopicContextRef.current = {
      classLevel,
      board,
      subject: selectedSubject,
      chapter: currentChapter.title,
      topic: subtopic,
    };
    pendingVoiceDataRef.current = null;
    setTextInput(`I have a doubt about ${subtopic} from ${currentChapter.title}. Please explain the concept clearly and ask what part I did not understand.`);
    setActiveTab("chat");
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
      const data = await readApiJson(res, "Could not prepare the follow-up answer.");
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

  const resetNoteForm = () => {
    setNoteTitle("");
    setNoteBody("");
    setNoteSubject("");
    setEditingNoteId(null);
  };

  const loadNotes = async (uid) => {
    if (!uid) return;
    setNotesLoading(true);
    try {
      const notesQuery = query(
        collection(db, "users", uid, "notes"),
        orderBy("updatedAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(notesQuery);
      const loaded = [];
      snap.forEach((noteDoc) => loaded.push({ id: noteDoc.id, ...noteDoc.data() }));
      setNotes(loaded);
    } catch (err) {
      console.error("Notes load error:", err);
      setError("Could not load notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const loadActivityLogs = async (uid) => {
    if (!uid) return;
    setActivityLoading(true);
    try {
      const activityQuery = query(
        collection(db, "users", uid, "activityLogs"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(activityQuery);
      const loaded = [];
      snap.forEach((logDoc) => loaded.push({ id: logDoc.id, ...logDoc.data() }));
      setActivityLogs(loaded);
    } catch (err) {
      console.error("Activity load error:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  const logActivity = async ({ type, title, subject = "", chapterTitle = "", topicTitle = "", details = "" }) => {
    if (!user) return;
    const logId = crypto.randomUUID();
    const logData = {
      type,
      title,
      subject,
      chapterTitle,
      topicTitle,
      details,
      classLevel,
      board,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", user.uid, "activityLogs", logId), logData);
      setActivityLogs((prev) => [{ ...logData, id: logId, createdAt: { toDate: () => new Date() } }, ...prev].slice(0, 100));
      if (type === "study") completeDailyGoal("study");
      if (["question", "voice_question", "diagram_request"].includes(type)) completeDailyGoal("question");
    } catch (err) {
      console.error("Activity save error:", err);
    }
  };

  const flushUsage = useCallback(async () => {
    if (!user || usageFlushLockRef.current) return;
    const pendingByDate = usagePendingRef.current;
    if (!Object.keys(pendingByDate).length) return;

    usageFlushLockRef.current = true;
    usagePendingRef.current = {};
    setPendingUsageByDate({});
    try {
      await Promise.all(Object.entries(pendingByDate).map(async ([date, bySection]) => {
        const totalSeconds = Object.values(bySection).reduce((sum, seconds) => sum + Number(seconds || 0), 0);
        const sectionIncrements = Object.fromEntries(
          [...STUDENT_APP_TABS].map((section) => [section, increment(Number(bySection[section] || 0))])
        );
        await setDoc(doc(db, "users", user.uid, "usageDays", date), {
          date,
          totalSeconds: increment(totalSeconds),
          bySection: sectionIncrements,
          classLevel,
          board,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }));

      setUsageDays((previous) => {
        const next = [...previous];
        Object.entries(pendingByDate).forEach(([date, bySection]) => {
          const totalSeconds = Object.values(bySection).reduce((sum, seconds) => sum + Number(seconds || 0), 0);
          const index = next.findIndex((day) => day.date === date || day.id === date);
          const existing = index >= 0 ? next[index] : { id: date, date, totalSeconds: 0, bySection: {} };
          const mergedSections = { ...(existing.bySection || {}) };
          Object.entries(bySection).forEach(([section, seconds]) => {
            mergedSections[section] = Number(mergedSections[section] || 0) + Number(seconds || 0);
          });
          const merged = { ...existing, id: date, date, totalSeconds: Number(existing.totalSeconds || 0) + totalSeconds, bySection: mergedSections };
          if (index >= 0) next[index] = merged;
          else next.push(merged);
        });
        return next.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      });
      usageLastFlushRef.current = Date.now();
    } catch (err) {
      console.error("Usage save error:", err);
      Object.entries(pendingByDate).forEach(([date, bySection]) => {
        const restored = usagePendingRef.current[date] || {};
        Object.entries(bySection).forEach(([section, seconds]) => {
          restored[section] = Number(restored[section] || 0) + Number(seconds || 0);
        });
        usagePendingRef.current[date] = restored;
      });
      setPendingUsageByDate((current) => {
        const restored = { ...current };
        Object.entries(pendingByDate).forEach(([date, bySection]) => {
          const dateUsage = { ...(restored[date] || {}) };
          Object.entries(bySection).forEach(([section, seconds]) => {
            dateUsage[section] = Number(dateUsage[section] || 0) + Number(seconds || 0);
          });
          restored[date] = dateUsage;
        });
        return restored;
      });
    } finally {
      usageFlushLockRef.current = false;
    }
  }, [user, classLevel, board]);

  useEffect(() => {
    if (!user || !profileCompleted || typeof document === "undefined") {
      return undefined;
    }

    const idleAfterMs = 3 * 60 * 1000;
    const initializeTimer = window.setTimeout(() => {
      const now = Date.now();
      usageLastInteractionRef.current = now;
      usageLastTickRef.current = now;
      if (!usageLastFlushRef.current) usageLastFlushRef.current = now;
    }, 0);

    const markInteraction = () => {
      usageLastInteractionRef.current = Date.now();
      if (document.visibilityState === "visible") setUsageActive(true);
    };

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.min(10, Math.max(0, Math.floor((now - usageLastTickRef.current) / 1000)));
      usageLastTickRef.current = now;
      const isActive = document.visibilityState === "visible" && now - usageLastInteractionRef.current <= idleAfterMs;
      setUsageActive(isActive);
      if (!isActive || !elapsedSeconds) return;

      const date = getLocalDateKey();
      const section = STUDENT_APP_TABS.has(activeTabRef.current) ? activeTabRef.current : "home";
      const dateUsage = usagePendingRef.current[date] || {};
      dateUsage[section] = Number(dateUsage[section] || 0) + elapsedSeconds;
      usagePendingRef.current[date] = dateUsage;
      setPendingUsageByDate((current) => ({
        ...current,
        [date]: {
          ...(current[date] || {}),
          [section]: Number(current[date]?.[section] || 0) + elapsedSeconds,
        },
      }));
      setSessionUsageSeconds((seconds) => seconds + elapsedSeconds);

      if (now - usageLastFlushRef.current >= 5 * 60 * 1000) flushUsage();
    };

    const handleVisibilityChange = () => {
      usageLastTickRef.current = Date.now();
      if (document.visibilityState === "hidden") {
        setUsageActive(false);
        flushUsage();
      } else {
        markInteraction();
      }
    };
    const handlePageHide = () => flushUsage();
    const interval = window.setInterval(tick, 5000);
    const interactionEvents = ["pointerdown", "keydown", "touchstart", "scroll"];
    interactionEvents.forEach((eventName) => window.addEventListener(eventName, markInteraction, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearTimeout(initializeTimer);
      window.clearInterval(interval);
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, markInteraction));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      flushUsage();
    };
  }, [user, profileCompleted, flushUsage]);

  const getDateFromValue = (value) => {
    if (!value) return null;
    if (value.toDate) return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isInReportRange = (value, days) => {
    const date = getDateFromValue(value);
    if (!date) return false;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return date >= cutoff;
  };

  const getUsageSummary = (days = 7) => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Math.max(0, days - 1));
    const isIncluded = (dateKey) => {
      const date = new Date(`${dateKey}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date >= cutoff;
    };
    const bySection = {};
    let totalSeconds = 0;

    usageDays.filter((day) => isIncluded(day.date || day.id)).forEach((day) => {
      totalSeconds += Number(day.totalSeconds || 0);
      Object.entries(day.bySection || {}).forEach(([section, seconds]) => {
        bySection[section] = Number(bySection[section] || 0) + Number(seconds || 0);
      });
    });
    Object.entries(pendingUsageByDate).filter(([date]) => isIncluded(date)).forEach(([, sections]) => {
      Object.entries(sections).forEach(([section, seconds]) => {
        const value = Number(seconds || 0);
        totalSeconds += value;
        bySection[section] = Number(bySection[section] || 0) + value;
      });
    });
    return { totalSeconds, bySection };
  };

  const buildCurrentReport = (range = reportRange) => {
    const days = range === "monthly" ? 30 : 7;
    const rangeLabel = range === "monthly" ? "Monthly" : "Weekly";
    const recentActivities = activityLogs.filter((log) => isInReportRange(log.createdAt, days));
    const recentTests = getTestAttempts().filter((test) => isInReportRange(test.submittedAt || test.updatedAt, days));
    const recentNotes = notes.filter((note) => isInReportRange(note.updatedAt || note.createdAt, days));
    const recentDoubts = doubts.filter((doubt) => isInReportRange(doubt.createdAt, days));
    const completedTopics = Object.values(topicProgress || {}).filter((item) => isCompletedStatus(item.status));
    const revisedTopics = Object.values(revisionProgress || {});
    const scores = recentTests.map((test) => Number(test.percentage || 0)).filter((score) => Number.isFinite(score));
    const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    const usage = getUsageSummary(days);
    const activityCounts = recentActivities.reduce((acc, log) => {
      const key = log.type || "activity";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const subjects = [...new Set(recentActivities.map((log) => log.subject).filter(Boolean))];
    const summary = [
      `${recentActivities.length} learning activities recorded`,
      `${recentTests.length} test${recentTests.length !== 1 ? "s" : ""} attempted`,
      `${recentNotes.length} note${recentNotes.length !== 1 ? "s" : ""} created or updated`,
      `${recentDoubts.length} doubt${recentDoubts.length !== 1 ? "s" : ""} marked`,
      `${formatUsageDuration(usage.totalSeconds)} active study time`,
    ];
    return {
      range,
      rangeLabel,
      days,
      generatedAt: new Date(),
      summary,
      metrics: {
        activities: recentActivities.length,
        questions: (activityCounts.question || 0) + (activityCounts.voice_question || 0),
        diagrams: activityCounts.diagram_request || 0,
        studyTopics: activityCounts.study || 0,
        revisions: activityCounts.revision || 0,
        tests: recentTests.length,
        averageScore,
        notes: recentNotes.length,
        doubts: recentDoubts.length,
        activeDoubts: doubts.filter((doubt) => !doubt.resolved).length,
        completedTopics: completedTopics.length,
        revisedTopics: revisedTopics.length,
        timeSpentSeconds: usage.totalSeconds,
      },
      subjects,
      recentActivities: recentActivities.slice(0, 8),
      recentTests: recentTests.slice(0, 5),
    };
  };

  const loadReports = async (uid) => {
    if (!uid) return;
    setReportsLoading(true);
    try {
      const reportsQuery = query(
        collection(db, "users", uid, "reports"),
        orderBy("createdAt", "desc"),
        limit(24)
      );
      const snap = await getDocs(reportsQuery);
      const loaded = [];
      snap.forEach((reportDoc) => loaded.push({ id: reportDoc.id, ...reportDoc.data() }));
      setReports(loaded);
    } catch (err) {
      console.error("Reports load error:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const saveCurrentReport = async () => {
    if (!user) { setError("Please login to save reports."); return; }
    const report = buildCurrentReport(reportRange);
    const reportId = `${report.range}_${new Date().toISOString().slice(0, 10)}_${crypto.randomUUID().slice(0, 8)}`;
    const reportData = {
      range: report.range,
      rangeLabel: report.rangeLabel,
      days: report.days,
      summary: report.summary,
      metrics: report.metrics,
      subjects: report.subjects,
      classLevel,
      board,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", user.uid, "reports", reportId), reportData);
      setReports((prev) => [{ ...reportData, id: reportId, createdAt: { toDate: () => new Date() } }, ...prev].slice(0, 24));
      logActivity({ type: "report_saved", title: `${report.rangeLabel} report saved`, details: report.summary.join("\n") });
      setError("");
    } catch (err) {
      console.error("Report save error:", err);
      setError("Could not save report. Please try again.");
    }
  };

  const saveNote = async () => {
    if (!user) { setError("Please login to save notes."); return; }
    if (!noteTitle.trim() && !noteBody.trim()) { setError("Please write a title or note first."); return; }
    const noteId = editingNoteId || crypto.randomUUID();
    const existingNote = editingNoteId ? notes.find((note) => note.id === editingNoteId) : null;
    const noteData = {
      title: noteTitle.trim() || "Untitled note",
      body: noteBody.trim(),
      subject: noteSubject.trim(),
      classLevel,
      board,
      updatedAt: serverTimestamp(),
    };
    if (!editingNoteId) noteData.createdAt = serverTimestamp();
    try {
      await setDoc(doc(db, "users", user.uid, "notes", noteId), noteData, { merge: true });
      setNotes((prev) => {
        const now = new Date();
        const localNote = { ...existingNote, ...noteData, id: noteId, createdAt: existingNote?.createdAt || { toDate: () => now }, updatedAt: { toDate: () => now } };
        return [localNote, ...prev.filter((note) => note.id !== noteId)];
      });
      logActivity({
        type: editingNoteId ? "note_updated" : "note_created",
        title: editingNoteId ? "Updated note" : "Created note",
        subject: noteSubject.trim(),
        details: noteTitle.trim() || "Untitled note",
      });
      resetNoteForm();
      setError("");
    } catch (err) {
      console.error("Note save error:", err);
      setError("Could not save note. Please try again.");
    }
  };

  const editNote = (note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title || "");
    setNoteBody(note.body || "");
    setNoteSubject(note.subject || "");
    setActiveTab("notes");
  };

  const removeNote = async (noteId) => {
    if (!user || !noteId) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", noteId));
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (editingNoteId === noteId) resetNoteForm();
    } catch (err) {
      console.error("Note delete error:", err);
      setError("Could not delete note. Please try again.");
    }
  };

  const cancelProcessing = () => {
    cancelledRef.current = true;
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    requestLockRef.current = false;
    setIsLoading(false); setIsTranscribing(false); setError("");
  };

  // ── Text send ──────────────────────────────────────────
  const normalizeLearningText = (value = "") => String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isDiagramRequest = (question = "") => {
    const text = normalizeLearningText(question);
    return [
      "diagram",
      "image",
      "picture",
      "flowchart",
      "flow chart",
      "chart",
      "visual",
      "draw",
      "with diagram",
    ].some((keyword) => text.includes(keyword));
  };

  const findSyllabusTopicInText = (text = "") => {
    const normalizedText = normalizeLearningText(text);
    if (!normalizedText) return null;

    const subjectNames = selectedSubject
      ? [selectedSubject, ...Object.keys(currentSyllabus || {}).filter((subject) => subject !== selectedSubject)]
      : Object.keys(currentSyllabus || {});

    for (const subjectName of subjectNames) {
      for (const chapter of currentSyllabus?.[subjectName] || []) {
        for (const topicTitle of chapter.subtopics || []) {
          const normalizedTopic = normalizeLearningText(topicTitle);
          if (normalizedTopic && (normalizedText.includes(normalizedTopic) || normalizedTopic.includes(normalizedText))) {
            return { classLevel, board, subject: subjectName, chapter: chapter.title, topic: topicTitle };
          }
        }
      }
    }

    return null;
  };

  const resolveDiagramContext = (question = "") => {
    const directMatch = findSyllabusTopicInText(question);
    if (directMatch) return directMatch;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const match = findSyllabusTopicInText(messages[index]?.text || "");
      if (match) return match;
    }

    if (activeTopicContextRef.current) return activeTopicContextRef.current;

    if (selectedSubject && currentChapter) {
      return { classLevel, board, subject: selectedSubject, chapter: currentChapter.title, topic: "" };
    }

    return { classLevel, board, subject: selectedSubject || "", chapter: "", topic: "" };
  };

  const searchOnlineDiagram = async (question, context) => {
    const fd = new FormData();
    fd.append("query", question);
    fd.append("class_level", context.classLevel || classLevel);
    fd.append("board", context.board || board);
    fd.append("subject", context.subject || "");
    fd.append("chapter", context.chapter || "");
    fd.append("topic", context.topic || "");

    const res = await fetch("/api/diagram-search", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.diagram || null;
  };

  const getDiagramReplyText = (diagram, context) => {
    const topicLabel = context.topic || context.chapter || "this concept";
    if (diagram?.online) {
      return `I found a safe online diagram for ${topicLabel}. I have added the source, credit, and license below the image.`;
    }
    if (diagram) {
      return `Here is a diagram to help you understand ${topicLabel}. Look at the arrows and labels first, then connect them with the explanation above.`;
    }
    return `I could not find a safe diagram for ${topicLabel} right now. Try asking with the exact topic name, like "diagram of water cycle" or "diagram of seed germination".`;
  };

  const handleDiagramRequest = async (question, assistantId, isFirstMsg) => {
    const context = resolveDiagramContext(question);
    const localDiagram = findDiagramForTopic({ ...context, query: question });

    let diagram = localDiagram;
    if (!diagram) {
      try {
        diagram = await searchOnlineDiagram(question, context);
      } catch (diagramError) {
        console.error("Online diagram search failed:", diagramError);
      }
    }

    const answer = getDiagramReplyText(diagram, context);
    setMessages((prev) => [
      ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
      { id: assistantId, role: "assistant", text: answer, audioUrl: null, typing: true, diagram },
    ]);
    updateHistory(question, answer);
    logActivity({
      type: "diagram_request",
      title: "Requested diagram",
      subject: context.subject || selectedSubject || "",
      chapterTitle: context.chapter || "",
      topicTitle: context.topic || "",
      details: question,
    });
    if (context.topic || context.chapter) activeTopicContextRef.current = context;
    setIsLoading(false);
    requestLockRef.current = false;

    if (user && currentSessionId) {
      setTimeout(() => saveCurrentSession(user.uid, currentSessionId, isFirstMsg ? question : undefined), 400);
    }

    try {
      const audioUrl = await generateAnswerAudio(answer, answerLanguage === "hi" ? "hi" : "en");
      if (audioUrl) setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
    } catch (ttsErr) {
      console.error("Diagram answer TTS failed:", ttsErr);
    }
  };

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

    if (isDiagramRequest(question)) {
      await handleDiagramRequest(question, assistantId, isFirstMsg);
      return;
    }

    const fd = new FormData();
    fd.append("question", question);
    fd.append("history", JSON.stringify(history));
    fd.append("class_level", classLevel);
    fd.append("board", board);
    fd.append("answer_language", answerLanguage);
    if (selectedSubject) fd.append("subject", selectedSubject);

    try {
      const res = await fetch("/api/ask-text", { method: "POST", body: fd });
      const data = await readApiJson(res, "Could not get an answer from the AI tutor.");

      setMessages((prev) => [
        ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
        { id: assistantId, role: "assistant", text: data.answer, audioUrl: null, typing: true },
      ]);
      updateHistory(question, data.answer);
      logActivity({
        type: "question",
        title: "Asked AI Tutor",
        subject: selectedSubject || "",
        details: question,
      });
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
      if (isDiagramRequest(question)) {
        setIsLoading(true);
        setMessages((prev) => [
          ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
          { id: crypto.randomUUID(), role: "user", text: question, isVoice: true },
        ]);
        await handleDiagramRequest(question, assistantId, isFirstMsg);
        return;
      }
      setMessages((prev) => [
        ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
        { id: crypto.randomUUID(), role: "user", text: question, isVoice: true },
        { id: assistantId, role: "assistant", text: data.answer, audioUrl: data.audio_url, typing: false },
      ]);
      updateHistory(question, data.answer);
      logActivity({
        type: "voice_question",
        title: "Asked by voice",
        subject: selectedSubject || "",
        details: question,
      });

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
  const testAttempts = getTestAttempts();
  const latestTest = testAttempts[0] || null;
  const averageTestScore = testAttempts.length
    ? Math.round(testAttempts.reduce((sum, test) => sum + Number(test.percentage || 0), 0) / testAttempts.length)
    : 0;
  const activeDoubts = doubts.filter((doubt) => !doubt.resolved);
  const resolvedDoubts = doubts.filter((doubt) => doubt.resolved);
  const recentQuestions = activityLogs.filter((log) => ["question", "voice_question", "diagram_request"].includes(log.type));
  const todayUsage = getUsageSummary(1);
  const weeklyUsage = getUsageSummary(7);
  const monthlyUsage = getUsageSummary(30);
  const usageSectionEntries = Object.entries(weeklyUsage.bySection)
    .sort(([, a], [, b]) => Number(b) - Number(a));
  const studySecondsByDate = usageDays.reduce((totals, day) => {
    const date = day.date || day.id;
    totals[date] = Number(totals[date] || 0) + Number(day.totalSeconds || 0);
    return totals;
  }, {});
  Object.entries(pendingUsageByDate).forEach(([date, sections]) => {
    studySecondsByDate[date] = Number(studySecondsByDate[date] || 0)
      + Object.values(sections).reduce((sum, seconds) => sum + Number(seconds || 0), 0);
  });
  const goalActivityDates = new Set(dailyGoalDays
    .filter((day) => day.study || day.test || day.question)
    .map((day) => day.date || day.id));
  if (Object.values(dailyGoals).some(Boolean)) goalActivityDates.add(getLocalDateKey());
  const isActiveStudyDate = (date) => Number(studySecondsByDate[date] || 0) >= 60 || goalActivityDates.has(date);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayDateKey = getLocalDateKey(todayDate);
  const streakCursor = new Date(todayDate);
  if (!isActiveStudyDate(todayDateKey)) streakCursor.setDate(streakCursor.getDate() - 1);
  let studyStreak = 0;
  while (studyStreak < 90 && isActiveStudyDate(getLocalDateKey(streakCursor))) {
    studyStreak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }
  const weeklyStudyDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = getLocalDateKey(date);
    return {
      dateKey,
      label: date.toLocaleDateString([], { weekday: "narrow" }),
      day: date.getDate(),
      active: isActiveStudyDate(dateKey),
      today: dateKey === todayDateKey,
    };
  });
  const completedDailyGoals = DAILY_GOAL_DEFINITIONS.filter((goal) => dailyGoals[goal.id]).length;
  const weeklyReport = buildCurrentReport("weekly");
  const orderedSubjects = getOrderedSubjects(currentSyllabus);
  const subjectProgressList = orderedSubjects.map((subject) => ({ subject, ...getSubjectProgress(subject) }));
  const continueLessons = subjectProgressList
    .map(({ subject, percent }) => {
      const chapters = currentSyllabus?.[subject] || [];
      const chapter = chapters.find((item) => (item.subtopics || []).some((topic) => !isCompletedStatus(getTopicStatus(subject, item.title, topic)))) || chapters[0];
      const topic = chapter?.subtopics?.find((item) => !isCompletedStatus(getTopicStatus(subject, chapter.title, item))) || chapter?.subtopics?.[0] || "";
      return chapter && topic ? { subject, chapter, topic, percent } : null;
    })
    .filter(Boolean)
    .slice(0, 4);
  const notificationItems = [
    activeDoubts.length ? {
      id: "active-doubts",
      title: `${activeDoubts.length} doubt${activeDoubts.length !== 1 ? "s" : ""} need attention`,
      detail: "Open your doubt list and continue the related AI conversations.",
      type: "doubt",
      action: () => setActiveTab("doubts"),
    } : null,
    latestTest ? {
      id: "latest-test",
      title: `Latest test score: ${latestTest.percentage || 0}%`,
      detail: latestTest.topicTitle || latestTest.chapterTitle || "Open your latest test result.",
      type: "test",
      action: () => { setSelectedTestAttempt(latestTest); setActiveTab("test"); },
    } : {
      id: "start-test",
      title: "Start your first topic test",
      detail: "Choose a topic and begin building your score history.",
      type: "test",
      action: () => setActiveTab("test"),
    },
    {
      id: "syllabus-progress",
      title: overallProgress.percent < 40 ? "Continue your syllabus" : "Your syllabus progress is moving well",
      detail: overallProgress.percent < 40 ? "Complete one more topic today." : `${overallProgress.percent}% of your syllabus is completed.`,
      type: "syllabus",
      action: () => setActiveTab("syllabus"),
    },
  ].filter(Boolean);
  const searchTerm = globalSearch.trim().toLowerCase();
  const searchResults = searchTerm
    ? [
        ...orderedSubjects.flatMap((subject) => (currentSyllabus?.[subject] || []).flatMap((chapter) =>
          (chapter.subtopics || []).map((topic) => ({ type: "Topic", title: topic, meta: `${subject} · ${chapter.title}`, action: () => { setSelectedSubject(subject); setSelectedChapter(chapter.title); setActiveTab("syllabus"); } }))
        )),
        ...activeDoubts.map((doubt) => ({ type: "Doubt", title: doubt.title || doubt.topicTitle || "Student doubt", meta: formatSessionDate(doubt.createdAt), action: () => { setActiveTab("doubts"); openDoubtChat(doubt); } })),
        ...notes.map((note) => ({ type: "Note", title: note.title || "Untitled note", meta: note.subject || "General", action: () => { editNote(note); setActiveTab("notes"); } })),
        ...testAttempts.map((test) => ({ type: "Test", title: test.topicTitle || test.chapterTitle || "Test", meta: `${test.percentage || 0}% · ${test.subject || ""}`, action: () => { setSelectedTestAttempt(test); setActiveTab("test"); } })),
      ].filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(searchTerm)).slice(0, 6)
    : [];

  const primaryNavigation = [
    { key: "home", label: "Home", icon: "home" },
    { key: "chat", label: "AI Tutor", icon: "chat" },
    { key: "syllabus", label: "Syllabus Tracker", icon: "syllabus" },
    { key: "test", label: "Tests", icon: "test" },
    { key: "doubts", label: "Doubt", icon: "doubts", badge: activeDoubts.length },
    { key: "history", label: "History", icon: "history" },
  ];
  const secondaryNavigation = ["notes", "activity", "reports", "parent", "badges"];
  const secondaryLabels = { notes: "Notes", activity: "Activity", reports: "Reports", parent: "Parent View", badges: "Badges" };
  const studentInitials = (userProfile?.name || user?.email || "Student")
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("");

  const testAttemptsByTopic = testAttempts.reduce((groups, attempt) => {
    const title = attempt.topicTitle || attempt.chapterTitle || "Test";
    const key = `${attempt.subject || ""}|${title}`;
    groups[key] = [...(groups[key] || []), attempt];
    return groups;
  }, {});
  const mostImprovedTest = Object.values(testAttemptsByTopic).reduce((best, group) => {
    if (group.length < 2) return best;
    const ordered = [...group].sort((a, b) => {
      const aDate = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || a.updatedAt || 0);
      const bDate = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || b.updatedAt || 0);
      return aDate - bDate;
    });
    const gain = Number(ordered.at(-1)?.percentage || 0) - Number(ordered[0]?.percentage || 0);
    return gain > (best?.gain || 0)
      ? { title: ordered.at(-1)?.topicTitle || ordered.at(-1)?.chapterTitle, gain }
      : best;
  }, null);
  const availableTopicTests = syllabusSubjectOptions
    .filter((subject) => testSubjectFilter === "All" || subject === testSubjectFilter)
    .flatMap((subject) => (currentSyllabus?.[subject] || []).flatMap((chapter) =>
      (chapter.subtopics || []).map((topic) => ({ subject, chapter, topic }))
    ));

  const renderTestCenterLanding = () => (
    <div className="designer-test-center">
      <div className="designer-test-heading">
        <h1>Practice Test Center</h1>
        <p>Take chapter-level or topic-level tests to check your understanding. Every result is saved in your study progress.</p>
      </div>
      <div className="designer-test-stats">
        <div><span>Total Tests Taken</span><strong>{testAttempts.length}</strong></div>
        <div><span>Average Score</span><strong>{averageTestScore}%</strong></div>
        <div><span>Most Improved Topic</span><strong className="topic-stat">{mostImprovedTest ? `${mostImprovedTest.title} +${mostImprovedTest.gain}%` : "No retakes yet"}</strong></div>
      </div>
      <div className="designer-test-grid">
        <section className="designer-test-panel">
          <div className="designer-test-panel-head">
            <div><h2>Topic Tests</h2><p>10 questions with MCQ, short, and detailed answers</p></div>
          </div>
          <div className="designer-test-filters" role="tablist" aria-label="Filter topic tests by subject">
            {["All", ...syllabusSubjectOptions].map((subject) => (
              <button key={subject} className={testSubjectFilter === subject ? "active" : ""} onClick={() => setTestSubjectFilter(subject)} role="tab" aria-selected={testSubjectFilter === subject}>{subject}</button>
            ))}
          </div>
          <div className="designer-test-list">
            {availableTopicTests.length ? availableTopicTests.map(({ subject, chapter, topic }) => {
              const testId = getTestId("topic", subject, chapter.title, topic);
              const lastAttempt = testAttempts.find((attempt) => attempt.testId === testId);
              return (
                <article className="designer-available-test" key={`${subject}-${chapter.title}-${topic}`}>
                  <div className="designer-test-icon" aria-hidden="true">✓</div>
                  <div className="designer-test-copy">
                    <h3>{topic}</h3><p>{subject} · {chapter.title}</p>
                    <span>{lastAttempt ? `Last score: ${formatMarks(lastAttempt.score)}/${formatMarks(lastAttempt.total)}` : "Not attempted"}</span>
                  </div>
                  <button disabled={testLoading || isLoading} onClick={() => startTest({ type: "topic", subject, chapterTitle: chapter.title, topicTitle: topic, topics: [topic], questionCount: 10 })} aria-label={`Start test for ${topic}`}>Start</button>
                </article>
              );
            }) : <div className="designer-test-empty">No topic tests found for this subject.</div>}
          </div>
        </section>
        <section className="designer-test-panel">
          <div className="designer-test-panel-head"><div><h2>Test History</h2><p>{testAttempts.length} completed attempt{testAttempts.length !== 1 ? "s" : ""}</p></div></div>
          <div className="designer-test-list history">
            {testAttempts.length ? testAttempts.map((attempt) => {
              const badge = getScoreCaption(attempt.percentage || 0);
              return (
                <button className="designer-test-history-row" key={attempt.attemptId || attempt.testId} onClick={() => setSelectedTestAttempt(attempt)}>
                  <div><h3>{attempt.topicTitle || attempt.chapterTitle}</h3><p>{attempt.subject} · {attempt.type === "topic" ? "Topic Test" : "Chapter Test"}</p><span>{formatSessionDate(attempt.submittedAt || attempt.updatedAt)}</span></div>
                  <div className="designer-test-score"><strong>{formatMarks(attempt.score)}/{formatMarks(attempt.total)}</strong><span style={{ color: badge.color, background: badge.bg }}>{badge.label}</span></div>
                </button>
              );
            }) : <div className="designer-test-empty"><strong>No tests attempted yet</strong><span>Choose a topic test to create your first score record.</span></div>}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="student-app-layout">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600&display=swap" rel="stylesheet" />

      <aside className="student-app-sidebar" aria-label="Student portal navigation">
        <div className="student-sidebar-brand"><img src="/teachifyy-logo-designer.png" alt="Teachifyy" /></div>
        <nav className="student-sidebar-dock">
          {primaryNavigation.map((item) => (
            <button key={item.key} className={`student-nav-tab ${activeTab === item.key ? "active" : ""}`} onClick={() => setActiveTab(item.key)} aria-label={item.label}>
              <SidebarIcon type={item.icon} />
              {!!item.badge && <span className="student-nav-badge">{item.badge}</span>}
              <span className="student-dock-tooltip">{item.label}</span>
            </button>
          ))}
          <div className="student-dock-divider" />
          <div className="student-more-wrap">
            <button className={`student-nav-tab ${secondaryNavigation.includes(activeTab) ? "active" : ""}`} aria-label="More sections"><SidebarIcon type="more" /><span className="student-dock-tooltip">More</span></button>
            <div className="student-more-menu">{secondaryNavigation.map((key) => <button key={key} onClick={() => setActiveTab(key)}>{secondaryLabels[key]}</button>)}</div>
          </div>
          <button className="student-nav-tab student-logout" onClick={handleLogout} aria-label="Logout"><SidebarIcon type="logout" /><span className="student-dock-tooltip">Logout</span></button>
        </nav>
      </aside>

      <main className="student-app-main">

      {/* Navbar */}
      <header className="student-app-header">
        <img src="/teachifyy-logo-designer.png" alt="Teachifyy" className="student-header-logo" />
        <div className="student-search-wrap">
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search syllabus, doubts, notes, tests..."
            className="student-search-input"
          />
          {searchTerm && (
            <div className="student-search-results">
              {searchResults.length ? searchResults.map((item) => (
                <button key={`${item.type}-${item.title}-${item.meta}`} onClick={() => { item.action(); setGlobalSearch(""); }}>
                  <div style={{ fontSize: "12px", fontWeight: 900, color: B.navy }}>{item.title}</div>
                  <div style={{ fontSize: "11px", color: B.gray500, marginTop: "2px" }}>{item.type} - {item.meta}</div>
                </button>
              )) : (
                <div style={{ padding: "14px", fontSize: "12px", color: B.gray500 }}>No matching result found.</div>
              )}
            </div>
          )}
        </div>
        <div className="student-header-right">
          <div className="student-notification-wrap">
            <button
              type="button"
              className="student-notification"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              {notificationItems.length > 0 && <span className="student-notification-dot" />}
            </button>
            {notificationsOpen && (
              <div className="student-notification-panel" role="dialog" aria-label="Notifications">
                <div className="student-notification-panel-head">
                  <div><strong>Notifications</strong><span>{notificationItems.length} updates</span></div>
                  <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button>
                </div>
                <div className="student-notification-list">
                  {notificationItems.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`student-notification-item ${item.type}`}
                      onClick={() => { setNotificationsOpen(false); item.action(); }}
                    >
                      <span className="student-notification-item-icon" aria-hidden="true" />
                      <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                      <span className="student-notification-arrow" aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="student-profile-copy">
            <div style={{ color: B.white, fontSize: "13px", fontWeight: 600 }}>{userProfile?.name || user?.email}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>Class {classLevel} · {board}</div>
          </div>
          <div className="student-avatar">{studentInitials || "ST"}</div>
        </div>
      </header>

      <div className="student-view-container">

        {/* Hero */}
        <div className="student-legacy-hero" style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>Welcome back, {userProfile?.name?.split(" ")[0] || "Student"} 👋</h1>
          <p style={{ fontSize: "13px", color: B.gray500 }}>Your AI tutor, syllabus, tests, doubts, and progress in one place</p>
        </div>

        {/* Tabs — now 4 tabs including History */}
        <div className="student-legacy-tabs" style={{ display: "flex", gap: "6px", marginBottom: "18px", background: B.gray200, padding: "5px", borderRadius: "14px" }}>
          {[
            { key: "home",     label: "Home" },
            { key: "chat",     label: "AI Tutor" },
            { key: "history",  label: "History" },
            { key: "activity", label: "Activity" },
            { key: "reports",  label: "Reports" },
            { key: "parent",   label: "Parent View" },
            { key: "doubts",   label: "Doubts" },
            { key: "notes",    label: "Notes" },
            { key: "badges",   label: "Badges" },
            { key: "syllabus", label: "Syllabus" },
            { key: "test",     label: "Tests" },
          ].map(({ key, label, disabled }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
              }}
              disabled={disabled}
              style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", background: activeTab === key ? B.navy : "transparent", color: activeTab === key ? B.white : B.gray700, opacity: disabled ? 0.4 : 1, transition: "all 0.2s" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CHAT TAB ── */}
        {activeTab === "home" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)", gap: "16px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, borderRadius: "18px", padding: "22px", color: B.white, boxShadow: "0 10px 30px rgba(43,88,136,0.18)", display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px", fontWeight: 800, opacity: 0.88, marginBottom: "8px" }}>
                    <span>{studyStreak}-day study streak</span>
                    <span style={{ opacity: 0.55 }}>-</span>
                    <span>AI Tutor Active</span>
                  </div>
                  <h2 style={{ fontSize: "24px", fontWeight: 900, margin: "0 0 6px" }}>Good to see you, {userProfile?.name?.split(" ")[0] || "Student"}</h2>
                  <p style={{ fontSize: "13px", margin: 0, opacity: 0.82 }}>You have {activeDoubts.length} active doubt{activeDoubts.length !== 1 ? "s" : ""} and {continueLessons.length} learning path{continueLessons.length !== 1 ? "s" : ""} ready.</p>
                </div>
                <button onClick={() => setActiveTab("chat")} style={{ padding: "10px 14px", borderRadius: "12px", border: "none", background: B.white, color: B.navy, fontSize: "13px", fontWeight: 900, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask AI Tutor</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                {[
                  { label: "Topics Mastered", value: `${overallProgress.completed}/${overallProgress.total}`, sub: `${overallProgress.percent}% completed` },
                  { label: "Quiz Average", value: testAttempts.length ? `${averageTestScore}%` : "--", sub: `${testAttempts.length} test${testAttempts.length !== 1 ? "s" : ""} attempted` },
                  { label: "Questions Asked", value: recentQuestions.length, sub: "Text, voice, and diagrams" },
                  { label: "Active Doubts", value: activeDoubts.length, sub: `${resolvedDoubts.length} resolved` },
                  { label: "Time Today", value: formatUsageDuration(todayUsage.totalSeconds), sub: usageActive ? "Active time is being tracked" : "Paused while idle or hidden" },
                  { label: "Study Streak", value: `${studyStreak} day${studyStreak === 1 ? "" : "s"}`, sub: isActiveStudyDate(todayDateKey) ? "Today is counted" : "Study today to keep it going" },
                ].map((card) => (
                  <div key={card.label} style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "16px", padding: "16px", boxShadow: "0 4px 18px rgba(43,88,136,0.06)" }}>
                    <div style={{ fontSize: "11px", color: B.gray500, fontWeight: 900, textTransform: "uppercase" }}>{card.label}</div>
                    <div style={{ fontSize: "26px", color: B.navy, fontWeight: 900, marginTop: "8px" }}>{card.value}</div>
                    <div style={{ fontSize: "11px", color: B.gray500, marginTop: "4px" }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "18px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "17px", fontWeight: 900, color: B.navy, margin: 0 }}>Continue Learning</h3>
                    <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>Pick up the next open topic from your syllabus.</p>
                  </div>
                  <button onClick={() => setActiveTab("syllabus")} style={{ border: "none", background: B.navyLight, color: B.navy, borderRadius: "9px", padding: "8px 10px", fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>Open syllabus</button>
                </div>
                {continueLessons.length ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
                    {continueLessons.map((lesson) => (
                      <button key={`${lesson.subject}-${lesson.chapter.title}-${lesson.topic}`} onClick={() => { setSelectedSubject(lesson.subject); setSelectedChapter(lesson.chapter.title); setActiveTab("syllabus"); }} style={{ textAlign: "left", padding: "14px", borderRadius: "13px", background: B.gray50, border: `1px solid ${B.gray200}`, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <div style={{ fontSize: "11px", color: B.gray500, fontWeight: 900, textTransform: "uppercase" }}>{lesson.subject}</div>
                        <div style={{ fontSize: "14px", color: B.navy, fontWeight: 900, marginTop: "6px", lineHeight: 1.35 }}>{lesson.topic}</div>
                        <div style={{ fontSize: "11px", color: B.gray500, marginTop: "5px" }}>{lesson.chapter.title}</div>
                        <div style={{ marginTop: "10px" }}><ProgressBar percent={lesson.percent} /></div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "24px", textAlign: "center", color: B.gray500, fontSize: "13px", background: B.gray50, borderRadius: "13px" }}>No syllabus topics available for this class yet.</div>
                )}
              </div>

              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "18px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 900, color: B.navy, margin: "0 0 12px" }}>Subject Progress</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                  {subjectProgressList.slice(0, 6).map((subject) => (
                    <div key={subject.subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", fontWeight: 800, color: B.gray700 }}>
                        <span>{subject.subject}</span>
                        <span>{subject.percent}%</span>
                      </div>
                      <ProgressBar percent={subject.percent} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "18px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: B.navy, margin: 0 }}>Today's Goals</h3>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: completedDailyGoals === DAILY_GOAL_DEFINITIONS.length ? B.green : B.navy }}>{completedDailyGoals}/{DAILY_GOAL_DEFINITIONS.length}</span>
                </div>
                <div style={{ height: "6px", background: B.gray200, borderRadius: "999px", overflow: "hidden", marginBottom: "13px" }}>
                  <div style={{ width: `${(completedDailyGoals / DAILY_GOAL_DEFINITIONS.length) * 100}%`, height: "100%", background: completedDailyGoals === DAILY_GOAL_DEFINITIONS.length ? B.green : B.navy, borderRadius: "999px", transition: "width 0.3s ease" }} />
                </div>
                {DAILY_GOAL_DEFINITIONS.map((goal, index) => {
                  const completed = Boolean(dailyGoals[goal.id]);
                  return (
                    <button key={goal.id} onClick={() => setActiveTab(goal.tab)} disabled={dailyGoalsLoading} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px", marginBottom: index === DAILY_GOAL_DEFINITIONS.length - 1 ? 0 : "8px", borderRadius: "11px", border: `1px solid ${completed ? B.greenBorder : B.gray200}`, background: completed ? B.greenLight : B.gray50, cursor: "pointer", textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: dailyGoalsLoading ? 0.65 : 1 }}>
                      <span style={{ width: "20px", height: "20px", flexShrink: 0, borderRadius: "50%", background: completed ? B.green : B.navyLight, color: completed ? B.white : B.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900 }}>{completed ? "✓" : index + 1}</span>
                      <span style={{ fontSize: "12px", color: completed ? B.green : B.gray700, fontWeight: 800, textDecoration: completed ? "line-through" : "none" }}>{goal.text}</span>
                    </button>
                  );
                })}
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${B.gray200}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "9px" }}>
                    <span style={{ fontSize: "11px", color: B.gray500, fontWeight: 900, textTransform: "uppercase" }}>Last 7 days</span>
                    <span style={{ fontSize: "11px", color: B.gray500 }}>{isActiveStudyDate(todayDateKey) ? "Streak active" : "Not active today"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "5px" }}>
                    {weeklyStudyDays.map((day) => (
                      <div key={day.dateKey} title={day.dateKey} style={{ minWidth: 0, textAlign: "center", padding: "6px 2px", borderRadius: "8px", border: `1px solid ${day.today ? B.navy : B.gray200}`, background: day.active ? B.navyLight : B.white }}>
                        <div style={{ fontSize: "9px", color: B.gray500, fontWeight: 800 }}>{day.label}</div>
                        <div style={{ fontSize: "11px", color: day.active ? B.navy : B.gray500, fontWeight: 900, marginTop: "3px" }}>{day.active ? "✓" : day.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "18px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: B.navy, margin: "0 0 10px" }}>Weekly Digest</h3>
                <div style={{ display: "grid", gap: "7px" }}>
                  {weeklyReport.summary.slice(0, 4).map((line) => (
                    <div key={line} style={{ fontSize: "12px", color: B.gray700, lineHeight: 1.55 }}>- {line}</div>
                  ))}
                </div>
                <button onClick={() => setActiveTab("reports")} style={{ marginTop: "12px", width: "100%", padding: "9px", borderRadius: "10px", border: "none", background: B.navy, color: B.white, fontSize: "12px", fontWeight: 900, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>View reports</button>
              </div>

            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="student-chat-workspace" style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            {/* Chat header */}
            <div className="student-chat-header" style={{ padding: "14px 18px", borderBottom: `1px solid ${B.gray200}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: B.white }}>
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
            <div className="student-chat-body" style={{ height: "400px", overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", background: B.gray50 }}>
              {messages.length === 0 ? (
                <div className="student-chat-empty" style={{ margin: "auto", textAlign: "center", color: B.gray500 }}>
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
              <div className="student-chat-followups" style={{ padding: "10px 16px", borderTop: `1px solid ${B.gray100}`, background: B.white, display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
            <div className="student-chat-composer" style={{ padding: "14px 16px", borderTop: `1px solid ${B.gray200}`, display: "flex", gap: "8px", alignItems: "flex-end", background: B.white }}>
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
            <div className="student-chat-shortcut" style={{ textAlign: "center", fontSize: "11px", color: B.gray500, padding: "8px 16px", borderTop: `1px solid ${B.gray100}`, background: B.white }}>
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

        {/* ── NOTES TAB ── */}
        {activeTab === "notes" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.9fr) minmax(0, 1.2fr)", gap: "16px", alignItems: "start" }}>
            <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "20px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: B.navy, margin: "0 0 4px" }}>{editingNoteId ? "Edit Note" : "Create Note"}</h2>
              <p style={{ fontSize: "12px", color: B.gray500, margin: "0 0 16px" }}>Save your own short notes for revision.</p>

              {error && activeTab === "notes" && (
                <div style={{ marginBottom: "12px", padding: "10px 12px", borderRadius: "10px", background: B.redLight, border: `1px solid ${B.red}`, color: B.red, fontSize: "12px", fontWeight: 700 }}>{error}</div>
              )}

              <label style={labelStyle}>Title</label>
              <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Example: Photosynthesis summary" style={inputStyle} />

              <label style={labelStyle}>Subject</label>
              <select value={noteSubject} onChange={(e) => setNoteSubject(e.target.value)} style={inputStyle}>
                <option value="">No subject selected</option>
                {getOrderedSubjects(currentSyllabus).map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>

              <label style={labelStyle}>Note</label>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write important points, formulas, meanings, examples..."
                rows={9}
                style={{ ...inputStyle, resize: "vertical", minHeight: "170px", lineHeight: "1.6" }}
              />

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={saveNote} style={{ padding: "10px 15px", borderRadius: "10px", border: "none", background: B.navy, color: B.white, fontSize: "13px", fontWeight: 800, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{editingNoteId ? "Update note" : "Save note"}</button>
                {(editingNoteId || noteTitle || noteBody || noteSubject) && (
                  <button onClick={resetNoteForm} style={{ padding: "10px 15px", borderRadius: "10px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clear</button>
                )}
              </div>
            </div>

            <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.gray200}` }}>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: B.navy, margin: 0 }}>My Notes</h2>
                <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>{notes.length} saved note{notes.length !== 1 ? "s" : ""}</p>
              </div>

              <div style={{ maxHeight: "620px", overflowY: "auto", padding: notes.length ? "16px" : 0 }}>
                {notesLoading ? (
                  <div style={{ padding: "44px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div style={{ padding: "52px 20px", textAlign: "center", color: B.gray500 }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>Notes</div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: B.navy }}>No notes yet</p>
                    <p style={{ fontSize: "12px", marginTop: "5px" }}>Write your first revision note from the form.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {notes.map((note) => (
                      <div key={note.id} style={{ border: `1px solid ${editingNoteId === note.id ? B.navy : B.gray200}`, borderRadius: "12px", background: editingNoteId === note.id ? B.navyLight : B.gray50, overflow: "hidden" }}>
                        <div style={{ padding: "14px 15px", background: B.white }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 800, color: B.navy, marginBottom: "4px" }}>{note.title || "Untitled note"}</div>
                              <div style={{ fontSize: "11px", color: B.gray500 }}>{note.subject || "General"} · {formatSessionDate(note.updatedAt || note.createdAt)}</div>
                            </div>
                            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                              <button onClick={() => editNote(note)} style={{ padding: "5px 9px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.navy, fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>Edit</button>
                              <button onClick={() => removeNote(note.id)} style={{ padding: "5px 9px", borderRadius: "8px", border: `1px solid ${B.red}`, background: B.redLight, color: B.red, fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>Delete</button>
                            </div>
                          </div>
                          {note.body && (
                            <div style={{ marginTop: "10px", whiteSpace: "pre-wrap", lineHeight: "1.65", fontSize: "13px", color: B.gray700, maxHeight: "180px", overflowY: "auto" }}>{note.body}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.gray200}` }}>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: B.navy, margin: 0 }}>Activity Tracking</h2>
              <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>{usageActive ? "Tracking active app time" : "Time tracking is paused while idle or away"} - {activityLogs.length} recent activity record{activityLogs.length !== 1 ? "s" : ""}</p>
            </div>

            <div style={{ padding: "16px", borderBottom: `1px solid ${B.gray200}`, background: B.gray50 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                {[
                  { label: "Today", value: todayUsage.totalSeconds },
                  { label: "Last 7 Days", value: weeklyUsage.totalSeconds },
                  { label: "Last 30 Days", value: monthlyUsage.totalSeconds },
                  { label: "This Session", value: sessionUsageSeconds },
                ].map((item) => (
                  <div key={item.label} style={{ padding: "13px", borderRadius: "12px", background: B.white, border: `1px solid ${B.gray200}` }}>
                    <div style={{ fontSize: "10px", color: B.gray500, fontWeight: 900, textTransform: "uppercase" }}>{item.label}</div>
                    <div style={{ fontSize: "22px", color: B.navy, fontWeight: 900, marginTop: "5px" }}>{usageLoading ? "--" : formatUsageDuration(item.value)}</div>
                  </div>
                ))}
              </div>
              {usageSectionEntries.length > 0 && (
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {usageSectionEntries.map(([section, seconds]) => (
                    <span key={section} style={{ padding: "7px 9px", borderRadius: "9px", background: B.navyLight, color: B.navy, fontSize: "11px", fontWeight: 800 }}>
                      {USAGE_SECTION_LABELS[section] || section}: {formatUsageDuration(seconds)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ maxHeight: "620px", overflowY: "auto", padding: activityLogs.length ? "16px" : 0 }}>
              {activityLoading ? (
                <div style={{ padding: "44px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Loading activity...</div>
              ) : activityLogs.length === 0 ? (
                <div style={{ padding: "52px 20px", textAlign: "center", color: B.gray500 }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>Activity</div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: B.navy }}>No activity recorded yet</p>
                  <p style={{ fontSize: "12px", marginTop: "5px" }}>Ask a question, study a topic, start a test, or save a note.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activityLogs.map((log) => {
                    const typeColors = {
                      question: B.navy,
                      voice_question: B.navy,
                      study: B.green,
                      revision: B.orange,
                      test_started: B.red,
                      note_created: B.warm,
                      note_updated: B.warm,
                      report_saved: B.green,
                    };
                    return (
                      <div key={log.id} style={{ padding: "14px", borderRadius: "13px", border: `1px solid ${B.gray200}`, background: B.gray50 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "11px", color: typeColors[log.type] || B.gray500, fontWeight: 900, textTransform: "uppercase", marginBottom: "4px" }}>{String(log.type || "activity").replace(/_/g, " ")}</div>
                            <div style={{ fontSize: "14px", color: B.navy, fontWeight: 800 }}>{log.title || "Activity"}</div>
                            {(log.subject || log.chapterTitle || log.topicTitle) && (
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "4px" }}>{[log.subject, log.chapterTitle, log.topicTitle].filter(Boolean).join(" · ")}</div>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: B.gray500, flexShrink: 0 }}>{formatSessionDate(log.createdAt)}</div>
                        </div>
                        {log.details && <div style={{ marginTop: "8px", fontSize: "12px", color: B.gray700, lineHeight: "1.55", whiteSpace: "pre-wrap", maxHeight: "72px", overflowY: "auto" }}>{log.details}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (() => {
          const report = buildCurrentReport(reportRange);
          const metricCards = [
            { label: "Activities", value: report.metrics.activities },
            { label: "Questions", value: report.metrics.questions },
            { label: "Topics Studied", value: report.metrics.studyTopics },
            { label: "Revisions", value: report.metrics.revisions },
            { label: "Tests", value: report.metrics.tests },
            { label: "Avg Score", value: report.metrics.tests ? `${report.metrics.averageScore}%` : "--" },
            { label: "Notes", value: report.metrics.notes },
            { label: "Active Doubts", value: report.metrics.activeDoubts },
            { label: "Time Spent", value: formatUsageDuration(report.metrics.timeSpentSeconds) },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.75fr)", gap: "16px", alignItems: "start" }}>
              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: "17px", fontWeight: 800, color: B.navy, margin: 0 }}>{report.rangeLabel} Status Report</h2>
                    <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>Generated from the last {report.days} days of activity.</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select value={reportRange} onChange={(e) => setReportRange(e.target.value)} style={{ padding: "8px 10px", borderRadius: "10px", border: `1px solid ${B.gray300}`, background: B.white, color: B.navy, fontSize: "12px", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <button onClick={saveCurrentReport} style={{ padding: "9px 13px", borderRadius: "10px", border: "none", background: B.navy, color: B.white, fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Save report</button>
                  </div>
                </div>

                <div style={{ padding: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                    {metricCards.map((card) => (
                      <div key={card.label} style={{ padding: "13px", borderRadius: "12px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                        <div style={{ fontSize: "11px", color: B.gray500, fontWeight: 800, textTransform: "uppercase" }}>{card.label}</div>
                        <div style={{ fontSize: "22px", color: B.navy, fontWeight: 900, marginTop: "5px" }}>{card.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "14px", borderRadius: "13px", background: B.navyLight, border: `1px solid rgba(43,88,136,0.15)`, marginBottom: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: B.navy, marginBottom: "8px" }}>Summary</div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      {report.summary.map((line) => <div key={line} style={{ fontSize: "13px", color: B.gray700 }}>• {line}</div>)}
                    </div>
                    <div style={{ fontSize: "12px", color: B.gray500, marginTop: "10px" }}>
                      {report.subjects.length ? `Subjects touched: ${report.subjects.join(", ")}` : "No subject-specific activity recorded in this range."}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: "0 0 10px" }}>Recent Activity</h3>
                      {report.recentActivities.length ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {report.recentActivities.map((log) => (
                            <div key={log.id} style={{ padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                              <div style={{ fontSize: "12px", fontWeight: 800, color: B.navy }}>{log.title || String(log.type || "Activity").replace(/_/g, " ")}</div>
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "3px" }}>{formatSessionDate(log.createdAt)}</div>
                            </div>
                          ))}
                        </div>
                      ) : <div style={{ fontSize: "12px", color: B.gray500 }}>No activity in this range.</div>}
                    </div>

                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: "0 0 10px" }}>Recent Tests</h3>
                      {report.recentTests.length ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {report.recentTests.map((test) => (
                            <div key={test.attemptId || test.testId} style={{ padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                              <div style={{ fontSize: "12px", fontWeight: 800, color: B.navy }}>{test.topicTitle || test.chapterTitle || "Test"}</div>
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "3px" }}>{formatMarks(test.score || 0)}/{formatMarks(test.totalMarks || test.total || 20)} · {test.percentage || 0}%</div>
                            </div>
                          ))}
                        </div>
                      ) : <div style={{ fontSize: "12px", color: B.gray500 }}>No tests in this range.</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <div style={{ padding: "16px 18px", borderBottom: `1px solid ${B.gray200}` }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: B.navy, margin: 0 }}>Saved Reports</h2>
                  <p style={{ fontSize: "12px", color: B.gray500, margin: "3px 0 0" }}>{reports.length} report snapshot{reports.length !== 1 ? "s" : ""}</p>
                </div>
                <div style={{ maxHeight: "620px", overflowY: "auto", padding: reports.length ? "14px" : 0 }}>
                  {reportsLoading ? (
                    <div style={{ padding: "36px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Loading reports...</div>
                  ) : reports.length === 0 ? (
                    <div style={{ padding: "42px 16px", textAlign: "center", color: B.gray500, fontSize: "13px" }}>Save a report snapshot to see it here.</div>
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {reports.map((saved) => (
                        <div key={saved.id} style={{ padding: "12px", borderRadius: "12px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 900, color: B.navy }}>{saved.rangeLabel || saved.range || "Report"}</div>
                            <div style={{ fontSize: "10px", color: B.gray500, flexShrink: 0 }}>{formatSessionDate(saved.createdAt)}</div>
                          </div>
                          <div style={{ fontSize: "11px", color: B.gray700, lineHeight: "1.55" }}>
                            {(saved.summary || []).slice(0, 3).map((line) => <div key={line}>• {line}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── PARENT VIEW TAB ── */}
        {activeTab === "parent" && (() => {
          const tests = getTestAttempts();
          const averageScore = tests.length
            ? Math.round(tests.reduce((sum, test) => sum + Number(test.percentage || 0), 0) / tests.length)
            : 0;
          const questions = activityLogs.filter((log) => ["question", "voice_question", "diagram_request"].includes(log.type));
          const studiedTopics = activityLogs.filter((log) => log.type === "study");
          const revisedTopics = activityLogs.filter((log) => log.type === "revision");
          const activeDoubts = doubts.filter((doubt) => !doubt.resolved);
          const resolvedDoubts = doubts.filter((doubt) => doubt.resolved);
          const completedTopics = Object.values(topicProgress || {}).filter((item) => isCompletedStatus(item.status));
          const weeklyReport = buildCurrentReport("weekly");
          const parentCards = [
            { label: "Questions Asked", value: questions.length, hint: "Text, voice, and diagram requests" },
            { label: "Topics Completed", value: completedTopics.length, hint: `${overallProgress.percent}% overall progress` },
            { label: "Tests Attempted", value: tests.length, hint: tests.length ? `${averageScore}% average score` : "No tests yet" },
            { label: "Active Doubts", value: activeDoubts.length, hint: `${resolvedDoubts.length} resolved` },
            { label: "Notes Saved", value: notes.length, hint: "Student-created notes" },
            { label: "Reports Saved", value: reports.length, hint: "Weekly/monthly snapshots" },
            { label: "Time Spent (7 Days)", value: formatUsageDuration(weeklyReport.metrics.timeSpentSeconds), hint: `Today: ${formatUsageDuration(todayUsage.totalSeconds)}` },
          ];

          return (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.75fr)", gap: "16px", alignItems: "start" }}>
              <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                <div style={{ padding: "18px 20px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 900, color: B.navy, margin: 0 }}>Parent View</h2>
                    <p style={{ fontSize: "12px", color: B.gray500, margin: "4px 0 0" }}>A clear summary of this student's learning activity in the same account.</p>
                  </div>
                  <button onClick={() => setActiveTab("reports")} style={{ padding: "9px 13px", borderRadius: "10px", border: "none", background: B.navy, color: B.white, fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Open Reports
                  </button>
                </div>

                <div style={{ padding: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                    {parentCards.map((card) => (
                      <div key={card.label} style={{ padding: "14px", borderRadius: "13px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                        <div style={{ fontSize: "11px", color: B.gray500, fontWeight: 900, textTransform: "uppercase" }}>{card.label}</div>
                        <div style={{ fontSize: "25px", color: B.navy, fontWeight: 900, marginTop: "5px" }}>{card.value}</div>
                        <div style={{ fontSize: "11px", color: B.gray500, marginTop: "3px", lineHeight: 1.4 }}>{card.hint}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "14px", borderRadius: "13px", background: B.navyLight, border: `1px solid rgba(43,88,136,0.15)`, marginBottom: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: B.navy, marginBottom: "8px" }}>This Week at a Glance</div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      {weeklyReport.summary.map((line) => (
                        <div key={line} style={{ fontSize: "13px", color: B.gray700, lineHeight: 1.55 }}>- {line}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: 0 }}>Latest Searches</h3>
                        <button onClick={() => setActiveTab("activity")} style={{ border: "none", background: "transparent", color: B.navy, fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>View all</button>
                      </div>
                      {questions.length ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {questions.slice(0, 6).map((log) => (
                            <div key={log.id} style={{ padding: "11px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                              <div style={{ fontSize: "12px", fontWeight: 800, color: B.navy, lineHeight: 1.45 }}>{log.title || log.prompt || "Student question"}</div>
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "4px" }}>{formatSessionDate(log.createdAt)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: B.gray500, padding: "16px", borderRadius: "12px", background: B.gray50, border: `1px solid ${B.gray200}` }}>No searches recorded yet.</div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: 0 }}>Recent Tests</h3>
                        <button onClick={() => setActiveTab("test")} style={{ border: "none", background: "transparent", color: B.navy, fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>View all</button>
                      </div>
                      {tests.length ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {tests.slice(0, 5).map((test) => (
                            <button key={test.attemptId || test.testId} onClick={() => { setSelectedTestAttempt(test); setActiveTab("test"); }} style={{ width: "100%", textAlign: "left", padding: "11px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}`, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                                <div style={{ fontSize: "12px", fontWeight: 900, color: B.navy, lineHeight: 1.45 }}>{test.topicTitle || test.chapterTitle || "Test"}</div>
                                <div style={{ fontSize: "12px", fontWeight: 900, color: B.green, flexShrink: 0 }}>{test.percentage || 0}%</div>
                              </div>
                              <div style={{ fontSize: "11px", color: B.gray500, marginTop: "4px" }}>{formatMarks(test.score || 0)}/{formatMarks(test.totalMarks || test.total || 20)} marks - {formatSessionDate(test.submittedAt || test.updatedAt)}</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: B.gray500, padding: "16px", borderRadius: "12px", background: B.gray50, border: `1px solid ${B.gray200}` }}>No tests attempted yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                  <div style={{ padding: "16px 18px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: 0 }}>Doubts Needing Attention</h3>
                      <p style={{ fontSize: "11px", color: B.gray500, margin: "3px 0 0" }}>{activeDoubts.length} active doubt{activeDoubts.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setActiveTab("doubts")} style={{ border: "none", background: B.navyLight, color: B.navy, borderRadius: "9px", padding: "7px 10px", fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>Open</button>
                  </div>
                  <div style={{ padding: "14px" }}>
                    {activeDoubts.length ? (
                      <div style={{ display: "grid", gap: "8px" }}>
                        {activeDoubts.slice(0, 4).map((doubt) => (
                          <button key={doubt.id} onClick={() => { setActiveTab("doubts"); openDoubtChat(doubt); }} style={{ textAlign: "left", padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}`, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <div style={{ fontSize: "12px", fontWeight: 900, color: B.navy, lineHeight: 1.45 }}>{doubt.title || doubt.topicTitle || "Student doubt"}</div>
                            <div style={{ fontSize: "11px", color: B.gray500, marginTop: "4px" }}>{formatSessionDate(doubt.createdAt)}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: B.gray500, padding: "10px" }}>No active doubts right now.</div>
                    )}
                  </div>
                </div>

                <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
                  <div style={{ padding: "16px 18px", borderBottom: `1px solid ${B.gray200}` }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 900, color: B.navy, margin: 0 }}>Learning Actions</h3>
                    <p style={{ fontSize: "11px", color: B.gray500, margin: "3px 0 0" }}>Study and revision activity</p>
                  </div>
                  <div style={{ padding: "14px", display: "grid", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                      <span style={{ fontSize: "12px", color: B.gray700, fontWeight: 800 }}>Study clicks</span>
                      <span style={{ fontSize: "12px", color: B.navy, fontWeight: 900 }}>{studiedTopics.length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                      <span style={{ fontSize: "12px", color: B.gray700, fontWeight: 800 }}>Revision clicks</span>
                      <span style={{ fontSize: "12px", color: B.navy, fontWeight: 900 }}>{revisedTopics.length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "10px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                      <span style={{ fontSize: "12px", color: B.gray700, fontWeight: 800 }}>Overall progress</span>
                      <span style={{ fontSize: "12px", color: B.green, fontWeight: 900 }}>{overallProgress.percent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── TEST TAB ── */}
        {activeTab === "test" && (
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", padding: "22px", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
            {testLoading ? (
              <div style={{ textAlign: "center", padding: "48px 12px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>Test</div>
                <h2 style={{ fontSize: "20px", color: B.navy, marginBottom: "6px", fontWeight: 700 }}>Generating your test...</h2>
                <p style={{ fontSize: "13px", color: B.gray500 }}>Topic tests include MCQs, short answers, and long answers.</p>
              </div>
            ) : selectedTestAttempt ? (
              <div>
                {(() => {
                  const badge = getScoreCaption(selectedTestAttempt.percentage || 0);
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>{selectedTestAttempt.type === "topic" ? "Topic Test" : "Chapter Test"}</div>
                          <h2 style={{ fontSize: "21px", fontWeight: 800, color: B.navy, margin: "0 0 4px" }}>{selectedTestAttempt.topicTitle || selectedTestAttempt.chapterTitle}</h2>
                          <p style={{ fontSize: "13px", color: B.gray500, margin: 0 }}>{selectedTestAttempt.subject} · {formatSessionDate(selectedTestAttempt.submittedAt || selectedTestAttempt.updatedAt)}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button onClick={() => startTest({ type: selectedTestAttempt.type, subject: selectedTestAttempt.subject, chapterTitle: selectedTestAttempt.chapterTitle, topicTitle: selectedTestAttempt.topicTitle || "", topics: selectedTestAttempt.topicTitle ? [selectedTestAttempt.topicTitle] : [], questionCount: selectedTestAttempt.type === "topic" ? 10 : 20 })} style={{ padding: "8px 13px", borderRadius: "9px", border: "none", background: B.navy, color: B.white, cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Reattempt</button>
                          <button onClick={() => setSelectedTestAttempt(null)} style={{ padding: "8px 13px", borderRadius: "9px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Back</button>
                        </div>
                      </div>
                      <div style={{ padding: "16px", borderRadius: "14px", background: badge.bg, border: `1px solid ${B.gray200}`, marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: badge.color }}>{badge.label}</div>
                          <div style={{ fontSize: "12px", color: B.gray500 }}>Teacher-style score report</div>
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: 900, color: badge.color }}>{formatMarks(selectedTestAttempt.score)}/{formatMarks(selectedTestAttempt.total)}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(selectedTestAttempt.questions || []).map((question, qi) => {
                          const grade = (selectedTestAttempt.grades || []).find((item) => Number(item.index) === qi);
                          const answer = selectedTestAttempt.answers?.[qi] ?? selectedTestAttempt.answers?.[String(qi)] ?? "";
                          return (
                            <div key={qi} style={{ padding: "14px", borderRadius: "12px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: B.navy }}>Q{qi + 1}. {question.question}</div>
                                <div style={{ fontSize: "12px", fontWeight: 800, color: B.green, flexShrink: 0 }}>{formatMarks(grade?.score || 0)}/{formatMarks(question.marks || 1)}</div>
                              </div>
                              <div style={{ fontSize: "12px", color: B.gray700, lineHeight: 1.5, marginBottom: "6px" }}><strong>Your answer:</strong> {question.type === "mcq" ? (question.options?.[Number(answer)] || "Not answered") : (answer || "Not answered")}</div>
                              {grade?.feedback && <div style={{ fontSize: "12px", color: B.gray700, lineHeight: 1.5 }}><strong>Teacher feedback:</strong> {grade.feedback}</div>}
                              {grade?.idealAnswer && <div style={{ marginTop: "6px", fontSize: "12px", color: B.gray500, lineHeight: 1.5 }}><strong>Better answer:</strong> {grade.idealAnswer}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : currentTest ? (
              <div>
                {(() => {
                  const isSubmitted = Boolean(submittedTestResult);
                  const requiredCount = currentTest.questions.length;
                  const answeredCount = currentTest.questions.filter((question, qi) => {
                    const answer = selectedAnswers[qi];
                    return question.type === "mcq" ? answer !== undefined : String(answer || "").trim().length > 0;
                  }).length;
                  const canSubmit = answeredCount === requiredCount && !testSubmitting;
                  const badge = submittedTestResult ? getScoreCaption(submittedTestResult.percentage || 0) : null;
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>{currentTest.type === "topic" ? "Topic Test" : "Chapter Test"}</div>
                          <h2 style={{ fontSize: "20px", fontWeight: 800, color: B.navy, marginBottom: "4px" }}>{currentTest.type === "topic" ? currentTest.topicTitle : currentTest.chapterTitle}</h2>
                          <p style={{ fontSize: "13px", color: B.gray500 }}>{currentTest.subject} · {currentTest.questions.length} questions · {formatMarks(currentTest.totalMarks || currentTest.questions.length)} marks</p>
                        </div>
                        <button onClick={resetTestView} style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Back</button>
                      </div>
                      {submittedTestResult && (
                        <div style={{ padding: "16px", borderRadius: "14px", background: badge.bg, border: `1px solid ${B.gray200}`, marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: 800, color: badge.color }}>Test Completed · {badge.label}</div>
                            <div style={{ fontSize: "13px", color: B.gray500 }}>Score saved with teacher feedback.</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: 900, color: badge.color }}>{formatMarks(submittedTestResult.score)}/{formatMarks(submittedTestResult.total)}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {currentTest.questions.map((question, qi) => {
                          const selected = selectedAnswers[qi];
                          const grade = (submittedTestResult?.grades || []).find((item) => Number(item.index) === qi);
                          return (
                            <div key={qi} style={{ padding: "16px", borderRadius: "14px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: B.navy }}>Q{qi + 1}. {question.question}</div>
                                <span style={{ fontSize: "11px", color: B.gray500, fontWeight: 800, flexShrink: 0 }}>{formatMarks(question.marks || 1)} marks{question.wordLimit ? ` · ${question.wordLimit} words` : ""}</span>
                              </div>
                              {question.type === "mcq" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {(question.options || []).map((option, oi) => {
                                    const isCorrect = oi === question.answerIndex;
                                    const isSelected = Number(selected) === oi;
                                    return (
                                      <label key={oi} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", cursor: isSubmitted ? "default" : "pointer", fontSize: "13px", color: B.gray900, border: isSubmitted && isCorrect ? `1.5px solid ${B.greenBorder}` : isSubmitted && isSelected && !isCorrect ? `1.5px solid ${B.red}` : `1px solid ${B.gray200}`, background: isSubmitted && isCorrect ? B.greenLight : isSubmitted && isSelected && !isCorrect ? B.redLight : B.white }}>
                                        <input type="radio" name={`q-${qi}`} checked={Number(selected) === oi} disabled={isSubmitted} onChange={() => setSelectedAnswers((prev) => ({ ...prev, [qi]: oi }))} />
                                        <span>{String.fromCharCode(65 + oi)}. {option}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <textarea value={selected || ""} disabled={isSubmitted} maxLength={(question.wordLimit || 80) * 8} onChange={(e) => setSelectedAnswers((prev) => ({ ...prev, [qi]: e.target.value }))} placeholder={`Write your answer within ${question.wordLimit || 80} words`} style={{ width: "100%", minHeight: question.type === "long" ? "120px" : "78px", borderRadius: "10px", border: `1px solid ${B.gray300}`, padding: "11px 12px", fontSize: "13px", lineHeight: 1.5, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif", background: B.white }} />
                              )}
                              {grade && (
                                <div style={{ marginTop: "10px", padding: "9px 11px", borderRadius: "9px", background: B.navyLight, fontSize: "12px", color: B.gray700, lineHeight: 1.5 }}>
                                  <strong style={{ color: B.navy }}>Marks:</strong> {formatMarks(grade.score)}/{formatMarks(grade.maxMarks)}<br />
                                  <strong style={{ color: B.navy }}>Teacher feedback:</strong> {grade.feedback}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {!submittedTestResult && (
                        <button onClick={submitCurrentTest} disabled={!canSubmit} style={{ width: "100%", marginTop: "20px", padding: "13px 16px", borderRadius: "12px", border: "none", background: canSubmit ? `linear-gradient(135deg, ${B.navy}, ${B.navyDark})` : B.gray200, color: B.white, fontSize: "15px", fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.55, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {testSubmitting ? "Checking like a teacher..." : `Submit Test (${answeredCount}/${requiredCount} answered)`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                {renderTestCenterLanding()}
                {false && <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: "19px", fontWeight: 800, color: B.navy, margin: 0 }}>Test History</h2>
                    <p style={{ fontSize: "13px", color: B.gray500, margin: "4px 0 0" }}>{getTestAttempts().length} attempted test{getTestAttempts().length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {getTestAttempts().length === 0 ? (
                  <div style={{ textAlign: "center", padding: "44px 12px", color: B.gray500 }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>Test</div>
                    <p style={{ fontSize: "14px", fontWeight: 600 }}>Start a test from the Syllabus Tracker.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {getTestAttempts().map((attempt) => {
                      const badge = getScoreCaption(attempt.percentage || 0);
                      return (
                        <button key={attempt.attemptId || attempt.testId} onClick={() => setSelectedTestAttempt(attempt)} style={{ width: "100%", textAlign: "left", border: `1px solid ${B.gray200}`, background: B.white, borderRadius: "13px", padding: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: B.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attempt.topicTitle || attempt.chapterTitle}</div>
                            <div style={{ fontSize: "11px", color: B.gray500, marginTop: "3px" }}>{attempt.subject} · {attempt.type === "topic" ? "Topic Test" : "Chapter Test"} · {formatSessionDate(attempt.submittedAt || attempt.updatedAt)}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: badge.color, background: badge.bg, padding: "5px 8px", borderRadius: "999px" }}>{badge.label}</span>
                            <span style={{ fontSize: "16px", fontWeight: 900, color: B.navy }}>{formatMarks(attempt.score)}/{formatMarks(attempt.total)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>}
              </>
            )}
          </div>
        )}

        {false && activeTab === "test" && (
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

        {/* ── BADGES TAB ── */}
        {activeTab === "badges" && (() => {
          const tests = getTestAttempts();
          const questions = activityLogs.filter((log) => ["question", "voice_question", "diagram_request"].includes(log.type));
          const completedTopics = Object.values(topicProgress || {}).filter((item) => isCompletedStatus(item.status));
          const revisedTopics = Object.values(revisionProgress || {}).filter((item) => item?.revised);
          const resolvedDoubts = doubts.filter((doubt) => doubt.resolved);
          const bestScore = tests.length ? Math.max(...tests.map((test) => Number(test.percentage || 0))) : 0;
          const earnedCount = [
            questions.length >= 1,
            questions.length >= 10,
            completedTopics.length >= 1,
            completedTopics.length >= 10,
            revisedTopics.length >= 5,
            tests.length >= 1,
            bestScore >= 80,
            notes.length >= 3,
            resolvedDoubts.length >= 1,
            reports.length >= 1,
          ].filter(Boolean).length;
          const badges = [
            { title: "First Question", earned: questions.length >= 1, progress: `${Math.min(questions.length, 1)}/1`, hint: "Ask your first question in the chatbot.", color: B.navy },
            { title: "Curious Learner", earned: questions.length >= 10, progress: `${Math.min(questions.length, 10)}/10`, hint: "Ask 10 questions using text, voice, or diagrams.", color: B.orange },
            { title: "Topic Starter", earned: completedTopics.length >= 1, progress: `${Math.min(completedTopics.length, 1)}/1`, hint: "Complete your first syllabus topic.", color: B.green },
            { title: "Progress Builder", earned: completedTopics.length >= 10, progress: `${Math.min(completedTopics.length, 10)}/10`, hint: "Complete 10 syllabus topics.", color: B.navy },
            { title: "Revision Ready", earned: revisedTopics.length >= 5, progress: `${Math.min(revisedTopics.length, 5)}/5`, hint: "Revise 5 topics.", color: B.green },
            { title: "Test Starter", earned: tests.length >= 1, progress: `${Math.min(tests.length, 1)}/1`, hint: "Attempt your first test.", color: B.red },
            { title: "High Scorer", earned: bestScore >= 80, progress: `${bestScore}%`, hint: "Score 80% or more in any test.", color: B.orange },
            { title: "Note Keeper", earned: notes.length >= 3, progress: `${Math.min(notes.length, 3)}/3`, hint: "Create 3 personal notes.", color: B.navy },
            { title: "Doubt Solver", earned: resolvedDoubts.length >= 1, progress: `${Math.min(resolvedDoubts.length, 1)}/1`, hint: "Mark one doubt as resolved.", color: B.green },
            { title: "Report Ready", earned: reports.length >= 1, progress: `${Math.min(reports.length, 1)}/1`, hint: "Save one weekly or monthly report.", color: B.red },
          ];

          return (
            <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(43,88,136,0.06)" }}>
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${B.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: B.navy, margin: 0 }}>Badges</h2>
                  <p style={{ fontSize: "12px", color: B.gray500, margin: "4px 0 0" }}>Earn badges by studying, revising, asking doubts, and taking tests.</p>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "12px", background: B.navyLight, color: B.navy, fontSize: "13px", fontWeight: 900 }}>
                  {earnedCount}/{badges.length} earned
                </div>
              </div>

              <div style={{ padding: "18px" }}>
                <div style={{ height: "10px", borderRadius: "999px", background: B.gray200, overflow: "hidden", marginBottom: "18px" }}>
                  <div style={{ width: `${Math.round((earnedCount / badges.length) * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${B.navy}, ${B.green})`, borderRadius: "999px" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {badges.map((badge) => (
                    <div key={badge.title} style={{ padding: "16px", borderRadius: "14px", background: badge.earned ? B.white : B.gray50, border: `1px solid ${badge.earned ? badge.color : B.gray200}`, boxShadow: badge.earned ? "0 4px 16px rgba(43,88,136,0.08)" : "none", opacity: badge.earned ? 1 : 0.72 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: badge.earned ? badge.color : B.gray200, color: badge.earned ? B.white : B.gray500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 900 }}>
                          {badge.earned ? "✓" : "•"}
                        </div>
                        <div style={{ fontSize: "11px", color: badge.earned ? badge.color : B.gray500, fontWeight: 900 }}>{badge.earned ? "EARNED" : badge.progress}</div>
                      </div>
                      <h3 style={{ fontSize: "15px", color: B.navy, fontWeight: 900, margin: "0 0 6px" }}>{badge.title}</h3>
                      <p style={{ fontSize: "12px", color: B.gray600, margin: 0, lineHeight: 1.55 }}>{badge.earned ? `Completed: ${badge.progress}` : badge.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Designer syllabus tracker */}
        {activeTab === "syllabus" && selectedSubject && (
          <div className="designer-syllabus-shell">
            <div className="designer-syllabus-header">
              <div className="designer-syllabus-title-block">
                <h1>Syllabus Tracker</h1>
                <p>Track topics, log revisions, resolve doubts, and take tests to build concepts.</p>
                <div className="designer-syllabus-progress-strip">
                  <div>
                    <strong>{selectedSubject}: {getSubjectProgress(selectedSubject).completed}/{getSubjectProgress(selectedSubject).total} mastered</strong>
                    <span>{getSubjectProgress(selectedSubject).percent}%</span>
                  </div>
                  <ProgressBar percent={getSubjectProgress(selectedSubject).percent} color={B.red} />
                </div>
              </div>
              <div className="designer-subject-pills" aria-label="Subjects">
                {syllabusSubjectOptions.map((subject) => (
                  <button
                    key={subject}
                    className={selectedSubject === subject ? "active" : ""}
                    onClick={() => { setSelectedSubject(subject); setSelectedChapter(null); setSelectedTopic(null); }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="designer-syllabus-main">
              <section className="designer-chapter-panel" aria-label={`${selectedSubject} chapters`}>
                <div className="designer-panel-heading">
                  <div>
                    <span>CLASS {classLevel} · {board}</span>
                    <h2>{selectedSubject} Chapters</h2>
                  </div>
                  <strong>{currentChapters.length}</strong>
                </div>

                <div className="designer-chapter-accordion">
                  {currentChapters.map((chapter, chapterIndex) => {
                    const chapterProgress = getChapterProgress(selectedSubject, chapter);
                    const expanded = currentChapter?.title === chapter.title;
                    return (
                      <article key={chapter.title} className={`designer-chapter-card ${expanded ? "expanded" : ""}`}>
                        <button
                          className="designer-chapter-trigger"
                          onClick={() => {
                            setSelectedChapter(expanded ? null : chapter);
                            setSelectedTopic(null);
                          }}
                          aria-expanded={expanded}
                        >
                          <span className="designer-chapter-number">{chapterIndex + 1}</span>
                          <span className="designer-chapter-copy">
                            <strong>{chapter.title}</strong>
                            <small>{chapterProgress.completed}/{chapterProgress.total} topics · {chapterProgress.status}</small>
                            <span className="designer-inline-progress"><i style={{ width: `${chapterProgress.percent}%` }} /></span>
                          </span>
                          <span className="designer-chevron">{expanded ? "−" : "+"}</span>
                        </button>

                        {expanded && (
                          <div className="designer-topic-list">
                            {(chapter.subtopics || []).map((topic, topicIndex) => {
                              const status = getTopicStatus(selectedSubject, chapter.title, topic);
                              const completed = isCompletedStatus(status);
                              const revised = getRevisionStatus(selectedSubject, chapter.title, topic);
                              return (
                                <button
                                  key={topic}
                                  className={selectedTopic === topic ? "active" : ""}
                                  onClick={() => { setSelectedChapter(chapter); setSelectedTopic(topic); }}
                                >
                                  <span className={completed ? "completed" : ""}>{completed ? "✓" : topicIndex + 1}</span>
                                  <span><strong>{topic}</strong><small>{status}{revised ? " · Revised" : ""}</small></span>
                                  <i>›</i>
                                </button>
                              );
                            })}
                            <button
                              className="designer-chapter-test"
                              disabled={testLoading || isLoading}
                              onClick={() => startTest({ type: "chapter", subject: selectedSubject, chapterTitle: chapter.title, topicTitle: "", topics: chapter.subtopics || [], questionCount: 20 })}
                            >
                              Take Chapter Test
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="designer-topic-drawer">
                {!selectedTopic || !currentChapter ? (
                  <div className="designer-drawer-empty">
                    <div className="designer-drawer-mascot">T</div>
                    <h2>Syllabus Overview</h2>
                    <div className="designer-progress-ring" style={{ "--progress": `${getSubjectProgress(selectedSubject).percent * 3.6}deg` }}>
                      <span>{getSubjectProgress(selectedSubject).percent}%</span>
                    </div>
                    <p>Select a chapter and topic to view its progress, revision details, and learning actions.</p>
                  </div>
                ) : (() => {
                  const status = getTopicStatus(selectedSubject, currentChapter.title, selectedTopic);
                  const completed = isCompletedStatus(status);
                  const revisionId = getTopicId(selectedSubject, currentChapter.title, selectedTopic);
                  const revisionEntry = revisionProgress[revisionId];
                  const revised = Boolean(revisionEntry?.revised);
                  const savedTest = getSavedTestResult("topic", selectedSubject, currentChapter.title, selectedTopic);
                  return (
                    <div className="designer-drawer-content">
                      <div className="designer-topic-heading">
                        <span>{selectedSubject.toUpperCase()}</span>
                        <h2>{selectedTopic}</h2>
                        <p>{currentChapter.title}</p>
                        <strong className={completed ? "completed" : ""}>{status}</strong>
                      </div>

                      {completed && !revised && (
                        <div className="designer-revision-alert">
                          <span>↻</span>
                          <p>This topic is completed. A short revision will help you remember it.</p>
                        </div>
                      )}

                      <div className="designer-study-summary">
                        <span>AI STUDY GUIDE</span>
                        <p>Your detailed content-library explanation is ready. Open it with AI to study this topic using simple examples and diagrams.</p>
                      </div>

                      <div className="designer-topic-stats">
                        <div><span>Revision</span><strong>{revised ? "Completed" : "Not yet"}</strong></div>
                        <div><span>Latest test</span><strong>{savedTest ? `${savedTest.score}/${savedTest.total}` : "Not attempted"}</strong></div>
                      </div>

                      <div className="designer-topic-actions">
                        <span>TOPIC ACTIONS</span>
                        <button className="primary" disabled={isLoading || testLoading} onClick={() => handleStudyTopic(selectedTopic)}>Start Learning with AI</button>
                        <button disabled={isLoading || testLoading || completed} onClick={() => updateTopicStatus(selectedSubject, currentChapter.title, selectedTopic, "Completed")}>{completed ? "Completed ✓" : "Mark as Completed"}</button>
                        <button disabled={isLoading || testLoading} onClick={() => handleReviseTopic(selectedTopic)}>{revised ? "Revise Again" : "Revise with AI"}</button>
                        <button className="doubt" disabled={isLoading || testLoading} onClick={() => askAiAboutTopicDoubt(selectedTopic)}>Ask AI About a Doubt</button>
                        <button disabled={isLoading || testLoading} onClick={() => handleTopicTest(selectedTopic)}>Take Topic Test</button>
                      </div>
                    </div>
                  );
                })()}
              </aside>
            </div>
          </div>
        )}

        {/* Legacy syllabus tracker retained temporarily as a non-rendered fallback */}
        {false && activeTab === "syllabus" && (
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
      </main>

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
        .student-app-layout { --designer-blue:#2c5688; --designer-pink:#fd4463; --designer-fog:#faf8f5; --designer-dove:#e2dcd5; --designer-ink:#1c1c1c; display:flex; width:100vw; height:100vh; overflow:hidden; background:#fff; color:var(--designer-ink); font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .student-app-sidebar { width:112px; flex:0 0 112px; padding:22px 14px; background:var(--designer-fog); border-right:1px solid var(--designer-dove); display:flex; flex-direction:column; align-items:center; z-index:30; }
        .student-sidebar-brand { height:38px; width:82px; display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:16px; }
        .student-sidebar-brand img { width:80px; height:auto; display:block; }
        .student-sidebar-dock { display:flex; flex-direction:column; align-items:center; gap:8px; padding:10px; margin-top:8px; background:rgba(255,255,255,.92); border:1px solid var(--designer-dove); border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04); }
        .student-nav-tab { width:46px; height:46px; padding:0; border:0; background:transparent; color:#4c4c4c; border-radius:12px; cursor:pointer; position:relative; display:flex; align-items:center; justify-content:center; transition:transform .25s ease,background-color .2s,color .2s; }
        .student-nav-tab:hover { background:var(--designer-fog); color:var(--designer-blue); transform:scale(1.08); }
        .student-nav-tab.active { background:var(--designer-blue); color:#fff; }
        .student-nav-icon { width:20px; height:20px; }
        .student-nav-badge { position:absolute; top:1px; right:1px; min-width:17px; padding:1px 4px; border-radius:999px; background:var(--designer-pink); color:#fff; font-size:9px; font-weight:700; line-height:15px; }
        .student-dock-tooltip { position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%) scale(.94); padding:6px 10px; border-radius:6px; background:var(--designer-ink); color:#fff; font-size:12px; font-weight:500; white-space:nowrap; opacity:0; pointer-events:none; transition:.18s ease; z-index:100; }
        .student-nav-tab:hover .student-dock-tooltip { opacity:1; transform:translateY(-50%) scale(1); }
        .student-dock-divider { width:24px; height:1px; margin:4px 0; background:var(--designer-dove); }
        .student-logout:hover { color:var(--designer-pink); background:#ffe6e9; }
        .student-more-wrap { position:relative; }
        .student-more-menu { position:absolute; left:58px; bottom:0; width:150px; padding:7px; border:1px solid var(--designer-dove); border-radius:14px; background:#fff; box-shadow:0 16px 35px rgba(0,0,0,.12); display:none; z-index:90; }
        .student-more-wrap:hover .student-more-menu,.student-more-wrap:focus-within .student-more-menu { display:grid; }
        .student-more-menu button { border:0; background:transparent; border-radius:9px; padding:9px 10px; color:#4c4c4c; text-align:left; cursor:pointer; font:500 12px 'Inter',sans-serif; }
        .student-more-menu button:hover { color:var(--designer-blue); background:var(--designer-fog); }
        .student-app-main { min-width:0; flex:1; height:100%; overflow:hidden; display:flex; flex-direction:column; background:#fff; }
        .student-app-header { height:72px; flex:0 0 72px; padding:0 32px; border-bottom:1px solid var(--designer-dove); display:flex; align-items:center; justify-content:space-between; background:#fff; z-index:20; }
        .student-header-logo { display:none; width:auto; height:38px; object-fit:contain; }
        .student-search-wrap { position:relative; width:320px; display:flex; align-items:center; }
        .student-search-input { width:100%; height:40px; padding:10px 14px; border:1px solid var(--designer-dove); border-radius:16px; background:#fff; color:var(--designer-ink); outline:0; font:400 14px 'Inter',sans-serif; }
        .student-search-input:focus { border-color:var(--designer-blue); box-shadow:0 0 0 3px rgba(44,86,136,.08); }
        .student-search-results { position:absolute; top:48px; left:0; right:0; overflow:hidden; border:1px solid var(--designer-dove); border-radius:16px; background:#fff; box-shadow:0 16px 35px rgba(0,0,0,.14); z-index:100; }
        .student-search-results>button { width:100%; padding:11px 13px; border:0; border-bottom:1px solid #eee; background:#fff; text-align:left; cursor:pointer; }
        .student-search-results>button:hover { background:var(--designer-fog); }
        .student-header-right { display:flex; align-items:center; gap:14px; }
        .student-profile-copy { order:1; display:flex; flex-direction:column; padding:3px 0; text-align:left !important; }
        .student-profile-copy>div:first-child { max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--designer-ink) !important; font:500 14px 'Inter',sans-serif !important; }
        .student-profile-copy>div:last-child { color:#777b86 !important; font:400 12px 'Inter',sans-serif !important; }
        .student-avatar { order:0; width:38px; height:38px; border-radius:50%; background:#ffe6e9; color:var(--designer-ink); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; }
        .student-notification-wrap { order:2; position:relative; }
        .student-notification { width:40px !important; height:40px !important; padding:0 !important; border:1px solid var(--designer-dove) !important; border-radius:50% !important; background:#fff !important; color:var(--designer-ink) !important; position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0 !important; }
        .student-notification:hover,.student-notification[aria-expanded="true"] { border-color:var(--designer-blue) !important; background:var(--designer-fog) !important; }
        .student-notification:before { content:' '; width:18px; height:18px; background:no-repeat center/18px 18px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231c1c1c' stroke-width='2'%3E%3Cpath d='M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'/%3E%3Cpath d='M13.73 21a2 2 0 0 1-3.46 0'/%3E%3C/svg%3E"); }
        .student-notification-dot { position:absolute; top:7px; right:8px; width:8px; height:8px; border:2px solid #fff; border-radius:50%; background:var(--designer-pink); }
        .student-notification-panel { position:absolute; top:49px; right:0; width:min(360px,calc(100vw - 28px)); overflow:hidden; border:1px solid var(--designer-dove); border-radius:8px; background:#fff; box-shadow:0 18px 45px rgba(28,28,28,.16); z-index:160; }
        .student-notification-panel-head { min-height:62px; padding:13px 14px; border-bottom:1px solid var(--designer-dove); display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .student-notification-panel-head>div { display:flex; flex-direction:column; gap:2px; }
        .student-notification-panel-head strong { color:var(--designer-blue); font:600 15px 'Poppins','Inter',sans-serif; }
        .student-notification-panel-head span { color:#858892; font-size:10px; }
        .student-notification-panel-head>button { width:30px; height:30px; padding:0; border:0; border-radius:50%; background:var(--designer-fog); color:#676a73; cursor:pointer; font-size:20px; line-height:1; }
        .student-notification-list { padding:7px; display:grid; gap:4px; }
        .student-notification-item { width:100%; min-height:68px; padding:10px; border:1px solid transparent; border-radius:7px; background:#fff; display:grid; grid-template-columns:32px minmax(0,1fr) 18px; align-items:center; gap:9px; color:inherit; text-align:left; cursor:pointer; }
        .student-notification-item:hover { border-color:#d7e1eb; background:#f7f9fb; }
        .student-notification-item-icon { width:30px; height:30px; border-radius:50%; background:#edf3f8; position:relative; }
        .student-notification-item-icon:after { content:''; position:absolute; inset:9px; border-radius:50%; background:var(--designer-blue); }
        .student-notification-item.doubt .student-notification-item-icon { background:#ffe6e9; }
        .student-notification-item.doubt .student-notification-item-icon:after { background:var(--designer-pink); }
        .student-notification-item.test .student-notification-item-icon { background:#e7f8ee; }
        .student-notification-item.test .student-notification-item-icon:after { background:#159455; }
        .student-notification-item>span:nth-child(2) { min-width:0; }
        .student-notification-item strong { display:block; color:var(--designer-blue); font-size:11px; font-weight:700; line-height:1.35; }
        .student-notification-item small { display:block; margin-top:3px; color:#777b86; font-size:9px; line-height:1.45; }
        .student-notification-arrow { color:#9a9da5; font-size:19px; text-align:center; }
        .student-view-container { flex:1; min-height:0; overflow-y:auto; padding:32px; background:#fff; }
        .student-view-container>div:not(.student-legacy-hero):not(.student-legacy-tabs) { max-width:1200px; margin-left:auto; margin-right:auto; }
        .student-legacy-hero,.student-legacy-tabs { display:none !important; }
        .student-chat-workspace { max-width:1080px !important; min-height:calc(100vh - 136px); border:1px solid var(--designer-dove) !important; border-radius:24px !important; box-shadow:0 20px 25px -5px rgba(0,0,0,.08),0 8px 10px -6px rgba(0,0,0,.04) !important; display:flex; flex-direction:column; }
        .student-chat-header { min-height:76px; padding:16px 22px !important; border-bottom:1px solid var(--designer-dove) !important; }
        .student-chat-header>div:first-child>span:nth-of-type(1) { color:var(--designer-blue) !important; font-family:'Poppins',sans-serif; font-size:20px !important; }
        .student-chat-header button { border:1px solid var(--designer-dove) !important; border-radius:10px !important; background:#fff !important; color:var(--designer-blue) !important; min-height:34px; padding:6px 11px !important; font-family:'Inter',sans-serif !important; }
        .student-chat-body { flex:1; min-height:420px; height:auto !important; padding:24px !important; background:#fff !important; }
        .student-chat-empty { width:min(680px,90%); padding:34px; border:1px solid #ffd7dc; border-radius:20px; background:#ffe6e9; }
        .student-chat-empty>div { filter:saturate(.75); }
        .student-chat-empty p:first-of-type { color:var(--designer-blue) !important; font:600 18px 'Poppins',sans-serif !important; }
        .student-chat-empty p:last-of-type { color:#4c4c4c !important; font:400 13px 'Inter',sans-serif !important; }
        .student-chat-followups { padding:12px 18px !important; gap:10px !important; border-top:1px solid var(--designer-dove) !important; background:#fff !important; }
        .student-chat-followups>button { min-height:42px !important; padding:9px 13px !important; border-color:var(--designer-dove) !important; border-radius:999px !important; background:var(--designer-fog) !important; color:var(--designer-blue) !important; font-family:'Inter',sans-serif !important; justify-content:center !important; text-align:center !important; }
        .student-chat-composer { padding:14px 18px !important; gap:10px !important; border-top:1px solid var(--designer-dove) !important; background:#fff !important; }
        .student-chat-composer textarea { min-height:46px; padding:12px 16px !important; border:1px solid var(--designer-dove) !important; border-radius:16px !important; background:#fff !important; font-family:'Inter',sans-serif !important; }
        .student-chat-composer textarea:focus { border-color:var(--designer-blue) !important; box-shadow:0 0 0 3px rgba(44,86,136,.08); }
        .student-chat-composer select { height:46px !important; border:1px solid var(--designer-dove) !important; border-radius:14px !important; background:#fff !important; color:var(--designer-blue) !important; font-family:'Inter',sans-serif !important; }
        .student-chat-composer button { width:46px !important; height:46px !important; }
        .student-chat-composer button:nth-last-of-type(2) { background:var(--designer-pink) !important; box-shadow:0 4px 12px rgba(253,68,99,.24); }
        .student-chat-composer button:last-of-type { background:linear-gradient(135deg,var(--designer-pink),#a855f7) !important; color:#fff !important; box-shadow:0 4px 12px rgba(253,68,99,.24); }
        .student-chat-shortcut { padding:9px 16px !important; border-top:1px solid #f1eeea !important; color:#777b86 !important; background:#fff !important; }
        .designer-syllabus-shell { width:100%; max-width:1200px; margin:0 auto; color:var(--designer-ink); }
        .designer-syllabus-header { display:flex; align-items:flex-end; justify-content:space-between; gap:28px; margin-bottom:24px; }
        .designer-syllabus-title-block { flex:1; min-width:0; }
        .designer-syllabus-title-block h1 { margin:0 0 5px; color:var(--designer-blue); font:600 28px/1.25 'Poppins','Inter',sans-serif; }
        .designer-syllabus-title-block>p { margin:0; color:#777b86; font-size:13px; line-height:1.55; }
        .designer-syllabus-progress-strip { max-width:440px; margin-top:16px; }
        .designer-syllabus-progress-strip>div { display:flex; justify-content:space-between; gap:16px; margin-bottom:7px; color:#4c4c4c; font-size:12px; }
        .designer-syllabus-progress-strip strong { color:var(--designer-blue); font-weight:650; }
        .designer-subject-pills { max-width:52%; display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
        .designer-subject-pills button { min-height:38px; padding:8px 15px; border:1px solid var(--designer-dove); border-radius:999px; background:#fff; color:#4c4c4c; cursor:pointer; font:600 12px 'Inter',sans-serif; transition:.18s ease; }
        .designer-subject-pills button:hover { border-color:var(--designer-blue); color:var(--designer-blue); }
        .designer-subject-pills button.active { border-color:var(--designer-blue); background:var(--designer-blue); color:#fff; box-shadow:0 5px 14px rgba(44,86,136,.18); }
        .designer-syllabus-main { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(300px,.75fr); align-items:start; gap:22px; }
        .designer-chapter-panel,.designer-topic-drawer { border:1px solid var(--designer-dove); border-radius:8px; background:#fff; box-shadow:0 12px 30px rgba(44,86,136,.06); }
        .designer-panel-heading { min-height:78px; padding:17px 20px; border-bottom:1px solid var(--designer-dove); display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .designer-panel-heading span { display:block; margin-bottom:4px; color:#8a8d96; font-size:10px; font-weight:750; letter-spacing:0; }
        .designer-panel-heading h2 { margin:0; color:var(--designer-blue); font:600 19px/1.3 'Poppins','Inter',sans-serif; }
        .designer-panel-heading>strong { min-width:38px; height:38px; border-radius:50%; background:#ffe6e9; color:var(--designer-pink); display:flex; align-items:center; justify-content:center; font-size:13px; }
        .designer-chapter-accordion { padding:10px; display:grid; gap:8px; }
        .designer-chapter-card { overflow:hidden; border:1px solid #ece8e3; border-radius:8px; background:#fff; transition:border-color .18s ease,box-shadow .18s ease; }
        .designer-chapter-card.expanded { border-color:#cbd8e6; box-shadow:0 5px 16px rgba(44,86,136,.07); }
        .designer-chapter-trigger { width:100%; min-height:76px; padding:13px 14px; border:0; background:#fff; display:flex; align-items:center; gap:13px; color:inherit; text-align:left; cursor:pointer; }
        .designer-chapter-trigger:hover { background:var(--designer-fog); }
        .designer-chapter-number { width:36px; height:36px; flex:0 0 36px; border-radius:50%; background:#edf3f8; color:var(--designer-blue); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:750; }
        .designer-chapter-card.expanded .designer-chapter-number { background:var(--designer-blue); color:#fff; }
        .designer-chapter-copy { min-width:0; flex:1; display:block; }
        .designer-chapter-copy>strong { display:block; color:#252525; font-size:14px; font-weight:650; line-height:1.35; }
        .designer-chapter-copy>small { display:block; margin:4px 0 7px; color:#858892; font-size:11px; line-height:1.3; }
        .designer-inline-progress { display:block; width:min(210px,100%); height:4px; overflow:hidden; border-radius:999px; background:#ece8e3; }
        .designer-inline-progress i { display:block; height:100%; border-radius:inherit; background:var(--designer-pink); }
        .designer-chevron { width:28px; height:28px; flex:0 0 28px; border-radius:50%; background:#f5f3f0; color:var(--designer-blue); display:flex; align-items:center; justify-content:center; font-size:19px; font-weight:400; }
        .designer-topic-list { padding:0 12px 12px 61px; display:grid; gap:6px; }
        .designer-topic-list>button:not(.designer-chapter-test) { width:100%; min-height:52px; padding:8px 10px; border:1px solid transparent; border-radius:7px; background:#fafafa; display:grid; grid-template-columns:28px minmax(0,1fr) 16px; align-items:center; gap:9px; color:#333; text-align:left; cursor:pointer; }
        .designer-topic-list>button:not(.designer-chapter-test):hover,.designer-topic-list>button.active { border-color:#cbd8e6; background:#f5f8fb; }
        .designer-topic-list>button>span:first-child { width:25px; height:25px; border-radius:50%; background:#ece8e3; color:#686b74; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:750; }
        .designer-topic-list>button>span:first-child.completed { background:#e7f8ee; color:#159455; }
        .designer-topic-list>button>span:nth-child(2) { min-width:0; }
        .designer-topic-list strong { display:block; overflow:hidden; color:var(--designer-blue); font-size:12px; font-weight:650; line-height:1.35; text-overflow:ellipsis; white-space:nowrap; }
        .designer-topic-list small { display:block; margin-top:2px; color:#8a8d96; font-size:10px; }
        .designer-topic-list i { color:#9a9da5; font-size:18px; font-style:normal; }
        .designer-chapter-test { width:100%; min-height:38px; margin-top:3px; border:1px solid #cbd8e6; border-radius:7px; background:#fff; color:var(--designer-blue); cursor:pointer; font:650 11px 'Inter',sans-serif; }
        .designer-chapter-test:hover { background:#edf3f8; }
        .designer-topic-drawer { position:sticky; top:0; min-height:420px; overflow:hidden; }
        .designer-drawer-empty { min-height:420px; padding:36px 26px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .designer-drawer-mascot { width:50px; height:50px; margin-bottom:14px; border-radius:16px; background:linear-gradient(145deg,var(--designer-pink),#a855f7); color:#fff; display:flex; align-items:center; justify-content:center; font:700 21px 'Poppins',sans-serif; box-shadow:0 8px 20px rgba(253,68,99,.22); }
        .designer-drawer-empty h2 { margin:0 0 16px; color:var(--designer-blue); font:600 18px 'Poppins','Inter',sans-serif; }
        .designer-drawer-empty p { max-width:280px; margin:16px 0 0; color:#777b86; font-size:12px; line-height:1.6; }
        .designer-progress-ring { width:104px; height:104px; border-radius:50%; background:conic-gradient(var(--designer-pink) var(--progress),#eeeae6 0); display:grid; place-items:center; position:relative; }
        .designer-progress-ring:before { content:''; position:absolute; inset:9px; border-radius:50%; background:#fff; }
        .designer-progress-ring span { z-index:1; color:var(--designer-blue); font-size:18px; font-weight:750; }
        .designer-drawer-content { padding:22px; }
        .designer-topic-heading { padding-bottom:18px; border-bottom:1px solid #ece8e3; }
        .designer-topic-heading>span,.designer-study-summary>span,.designer-topic-actions>span { color:var(--designer-pink); font-size:10px; font-weight:800; letter-spacing:0; }
        .designer-topic-heading h2 { margin:7px 0 4px; color:var(--designer-blue); font:600 20px/1.3 'Poppins','Inter',sans-serif; overflow-wrap:anywhere; }
        .designer-topic-heading p { margin:0 0 11px; color:#777b86; font-size:12px; line-height:1.45; }
        .designer-topic-heading>strong { display:inline-flex; padding:5px 9px; border-radius:999px; background:#f2f0ed; color:#777b86; font-size:10px; }
        .designer-topic-heading>strong.completed { background:#e7f8ee; color:#159455; }
        .designer-revision-alert { margin-top:16px; padding:12px; border:1px solid #f5d49a; border-radius:7px; background:#fff9ec; display:flex; align-items:flex-start; gap:10px; color:#7a5a20; }
        .designer-revision-alert span { font-size:18px; line-height:1; }
        .designer-revision-alert p { margin:0; font-size:11px; line-height:1.5; }
        .designer-study-summary { margin-top:16px; padding:14px; border-radius:7px; background:#f5f8fb; }
        .designer-study-summary p { margin:7px 0 0; color:#4c4c4c; font-size:11px; line-height:1.55; }
        .designer-topic-stats { margin:14px 0; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .designer-topic-stats>div { padding:11px; border:1px solid #ece8e3; border-radius:7px; background:#fff; }
        .designer-topic-stats span { display:block; margin-bottom:4px; color:#8a8d96; font-size:9px; }
        .designer-topic-stats strong { color:var(--designer-blue); font-size:11px; overflow-wrap:anywhere; }
        .designer-topic-actions { padding-top:3px; display:grid; gap:8px; }
        .designer-topic-actions>span { margin-bottom:2px; }
        .designer-topic-actions button { width:100%; min-height:40px; padding:9px 11px; border:1px solid var(--designer-dove); border-radius:7px; background:#fff; color:var(--designer-blue); cursor:pointer; font:650 11px 'Inter',sans-serif; }
        .designer-topic-actions button:hover:not(:disabled) { border-color:var(--designer-blue); background:#f5f8fb; }
        .designer-topic-actions button.primary { border-color:var(--designer-blue); background:var(--designer-blue); color:#fff; }
        .designer-topic-actions button.doubt { border-color:#ffd0d8; color:#d52d4a; }
        .designer-topic-actions button:disabled,.designer-chapter-test:disabled { cursor:not-allowed; opacity:.55; }
        .designer-test-center { width:100%; max-width:1200px; margin:0 auto; color:var(--designer-ink); }
        .designer-test-heading { margin-bottom:20px; }
        .designer-test-heading h1 { margin:0 0 5px; color:var(--designer-blue); font:600 28px/1.25 'Poppins','Inter',sans-serif; }
        .designer-test-heading p { max-width:720px; margin:0; color:#777b86; font-size:13px; line-height:1.55; }
        .designer-test-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:18px; }
        .designer-test-stats>div { min-height:94px; padding:16px; border:1px solid var(--designer-dove); border-radius:8px; background:#fff; box-shadow:0 8px 22px rgba(44,86,136,.05); display:flex; flex-direction:column; justify-content:space-between; }
        .designer-test-stats span { color:#858892; font-size:10px; font-weight:700; }
        .designer-test-stats strong { color:var(--designer-blue); font-size:25px; line-height:1.15; }
        .designer-test-stats strong.topic-stat { font-size:14px; overflow-wrap:anywhere; }
        .designer-test-grid { display:grid; grid-template-columns:minmax(0,1.18fr) minmax(310px,.82fr); align-items:start; gap:16px; }
        .designer-test-panel { min-width:0; overflow:hidden; border:1px solid var(--designer-dove); border-radius:8px; background:#fff; box-shadow:0 10px 26px rgba(44,86,136,.05); }
        .designer-test-panel-head { min-height:75px; padding:16px 18px; border-bottom:1px solid var(--designer-dove); display:flex; align-items:center; justify-content:space-between; }
        .designer-test-panel-head h2 { margin:0; color:var(--designer-blue); font:600 18px/1.3 'Poppins','Inter',sans-serif; }
        .designer-test-panel-head p { margin:4px 0 0; color:#858892; font-size:10px; line-height:1.4; }
        .designer-test-filters { padding:12px 14px 9px; display:flex; gap:7px; overflow-x:auto; scrollbar-width:thin; }
        .designer-test-filters button { min-height:34px; flex:0 0 auto; padding:7px 12px; border:1px solid var(--designer-dove); border-radius:999px; background:#fff; color:#5f626b; cursor:pointer; font:650 10px 'Inter',sans-serif; }
        .designer-test-filters button.active { border-color:var(--designer-blue); background:var(--designer-blue); color:#fff; }
        .designer-test-list { max-height:510px; padding:7px 12px 12px; display:grid; gap:8px; overflow-y:auto; scrollbar-width:thin; }
        .designer-test-list.history { padding-top:12px; }
        .designer-available-test { min-width:0; min-height:78px; padding:11px; border:1px solid #ece8e3; border-radius:8px; display:grid; grid-template-columns:34px minmax(0,1fr) auto; align-items:center; gap:10px; }
        .designer-available-test:hover { border-color:#cbd8e6; background:#fafcfd; }
        .designer-test-icon { width:32px; height:32px; border-radius:50%; background:#edf3f8; color:var(--designer-blue); display:grid; place-items:center; font-size:12px; font-weight:800; }
        .designer-test-copy { min-width:0; }
        .designer-test-copy h3,.designer-test-history-row h3 { margin:0; color:var(--designer-blue); font-size:12px; font-weight:700; line-height:1.35; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .designer-test-copy p,.designer-test-history-row p { margin:3px 0; color:#777b86; font-size:9px; line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .designer-test-copy span,.designer-test-history-row>div>span { color:#999ca4; font-size:9px; }
        .designer-available-test>button { min-width:62px; min-height:34px; padding:7px 12px; border:0; border-radius:7px; background:var(--designer-blue); color:#fff; cursor:pointer; font:700 10px 'Inter',sans-serif; }
        .designer-available-test>button:disabled { cursor:not-allowed; opacity:.55; }
        .designer-test-history-row { width:100%; min-width:0; min-height:78px; padding:12px; border:1px solid #ece8e3; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:space-between; gap:12px; color:inherit; text-align:left; cursor:pointer; }
        .designer-test-history-row:hover { border-color:#cbd8e6; background:#fafcfd; }
        .designer-test-history-row>div:first-child { min-width:0; flex:1; }
        .designer-test-score { flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
        .designer-test-score strong { color:var(--designer-blue); font-size:16px; }
        .designer-test-score span { padding:4px 7px; border-radius:999px; font-size:8px; font-weight:800; }
        .designer-test-empty { min-height:150px; padding:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:#858892; text-align:center; font-size:11px; }
        .designer-test-empty strong { color:var(--designer-blue); font-size:13px; }
        @media (max-width:767px) {
          .student-app-layout { flex-direction:column-reverse; }
          .student-app-main { width:100%; min-width:0; }
          .student-app-sidebar { width:100%; height:68px; flex:0 0 68px; padding:7px 10px; border-right:0; border-top:1px solid var(--designer-dove); }
          .student-sidebar-brand { display:none; }
          .student-sidebar-dock { width:100%; height:54px; margin:0; padding:4px 8px; flex-direction:row; justify-content:space-around; gap:2px; border:0; border-radius:0; box-shadow:none; background:transparent; }
          .student-nav-tab { width:40px; height:40px; }
          .student-dock-tooltip,.student-dock-divider,.student-more-wrap,.student-logout { display:none; }
          .student-app-header { width:100%; height:64px; flex-basis:64px; padding:0 14px; gap:10px; overflow:visible; }
          .student-header-logo { display:block; height:27px; max-width:94px; }
          .student-search-wrap { width:min(38vw,180px); min-width:0; }
          .student-search-input { min-width:0; padding:9px 11px; text-overflow:ellipsis; }
          .student-header-right { gap:6px; }
          .student-profile-copy { display:none; }
          .student-avatar { width:34px; height:34px; }
          .student-notification { width:36px !important; height:36px !important; }
          .student-notification-panel { position:fixed; top:58px; right:10px; width:min(360px,calc(100vw - 20px)); max-height:calc(100vh - 140px); overflow-y:auto; }
          .student-view-container { width:100%; min-width:0; padding:14px; overflow-x:hidden; }
          .student-view-container>div { width:100%; min-width:0; }
          .student-view-container [style*="grid-template-columns"] { grid-template-columns:minmax(0,1fr) !important; }
          .student-view-container [style*="minmax(280px"] { grid-template-columns:minmax(0,1fr) !important; }
          .student-view-container img,.student-view-container video,.student-view-container canvas,.student-view-container svg { max-width:100%; }
          .student-view-container img { height:auto; object-fit:contain; }
          .student-view-container table { display:block; width:100%; overflow-x:auto; }
          .student-view-container pre,.student-view-container code { max-width:100%; white-space:pre-wrap; overflow-wrap:anywhere; }
          .student-view-container p,.student-view-container h1,.student-view-container h2,.student-view-container h3,.student-view-container h4,.student-view-container span,.student-view-container button { overflow-wrap:anywhere; }
          .student-view-container button { max-width:100%; white-space:normal; }
          .student-view-container input,.student-view-container textarea,.student-view-container select { max-width:100%; min-width:0; }
          .student-chat-workspace { min-height:calc(100vh - 180px); border-radius:18px !important; }
          .student-chat-header { padding:12px !important; align-items:flex-start !important; gap:10px; }
          .student-chat-header>div:first-child { flex-wrap:wrap; }
          .student-chat-body { min-height:340px; padding:14px !important; }
          .student-chat-empty { width:100%; padding:22px 14px; }
          .student-chat-followups { width:100%; overflow-x:auto; overscroll-behavior-x:contain; scroll-snap-type:x proximity; flex-wrap:nowrap !important; scrollbar-width:thin; }
          .student-chat-followups>button { flex:0 0 min(210px,78vw) !important; scroll-snap-align:start; }
          .student-chat-composer { flex-wrap:wrap; padding:10px !important; }
          .student-chat-composer textarea { flex:1 1 calc(100% - 112px) !important; }
          .student-chat-composer select { order:4; width:100%; }
          .designer-syllabus-header { align-items:stretch; flex-direction:column; gap:16px; margin-bottom:16px; }
          .designer-syllabus-title-block h1 { font-size:23px; }
          .designer-subject-pills { max-width:none; width:100%; padding-bottom:4px; flex-wrap:nowrap; justify-content:flex-start; overflow-x:auto; scrollbar-width:thin; }
          .designer-subject-pills button { flex:0 0 auto; }
          .designer-syllabus-main { grid-template-columns:minmax(0,1fr); gap:14px; }
          .designer-topic-drawer { position:static; min-height:0; }
          .designer-drawer-empty { min-height:310px; }
          .designer-test-heading h1 { font-size:23px; }
          .designer-test-grid { grid-template-columns:minmax(0,1fr); }
          .designer-test-stats { grid-template-columns:repeat(3,minmax(150px,1fr)); overflow-x:auto; padding-bottom:5px; scrollbar-width:thin; }
          .designer-test-list { max-height:430px; }
        }
        @media (max-width:520px) {
          .student-search-wrap { display:none; }
          .student-app-header { justify-content:space-between; }
          .student-header-right { margin-left:auto; }
          .student-sidebar-dock { overflow:visible; }
          .designer-syllabus-progress-strip { max-width:none; }
          .designer-panel-heading { min-height:68px; padding:14px; }
          .designer-chapter-accordion { padding:7px; }
          .designer-chapter-trigger { min-height:68px; padding:10px; gap:9px; }
          .designer-chapter-number { width:31px; height:31px; flex-basis:31px; }
          .designer-topic-list { padding:0 8px 9px; }
          .designer-topic-list strong { white-space:normal; }
          .designer-drawer-content { padding:17px; }
          .designer-topic-stats { grid-template-columns:1fr; }
          .designer-test-stats { grid-template-columns:1fr; overflow:visible; }
          .designer-test-stats>div { min-height:78px; }
          .designer-available-test { grid-template-columns:30px minmax(0,1fr); }
          .designer-available-test>button { grid-column:2; width:100%; }
          .designer-test-history-row { align-items:flex-start; }
        }
        @media (max-width:360px) {
          .student-app-sidebar { padding-left:4px; padding-right:4px; }
          .student-sidebar-dock { padding-left:2px; padding-right:2px; }
          .student-nav-tab { width:36px; height:40px; }
          .student-view-container { padding:10px; }
          .student-chat-header { flex-direction:column; }
          .student-chat-composer textarea { flex-basis:calc(100% - 104px) !important; }
        }
      `}</style>
    </div>
  );
}
