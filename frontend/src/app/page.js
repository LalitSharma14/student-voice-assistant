"use client";
import { useState, useRef, useEffect } from "react";
 
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
} from "firebase/firestore";
import { SYLLABUS_DATA } from "../data/syllabus";
 
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
 
// ── Teachifyy Logo Image ───────────────────────────────────
// Save the uploaded logo image as: frontend/public/logo.png
function TeachifyyLogo({ size = 32, showText = true, light = false }) {
  const textColor = light ? B.white : B.navy;
 
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src="/logo.png"
        alt="Teachifyy logo"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
        }}
      />
 
      {showText && (
        <span style={{
          fontSize: size * 0.6,
          fontWeight: 700,
          color: textColor,
          letterSpacing: "-0.3px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Teachifyy
        </span>
      )}
    </div>
  );
}
 
const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Revision Done", "Test Done"];
const COMPLETED_STATUSES = ["Completed", "Test Done"];
 
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
function AssistantBubble({ msg, index, playingIndex, playAudio, stopAudio, onTypingComplete }) {
  const { displayed, done } = useTypewriter(msg.typing ? msg.text : "");
  const [audioReady, setAudioReady] = useState(false);
  const ttsStarted = useRef(false);
 
  useEffect(() => {
    if (done && msg.typing) onTypingComplete?.(msg.id);
  }, [done, msg.typing, msg.id, onTypingComplete]);
 
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
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      {/* AI avatar */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: 700, color: B.white, marginTop: "2px",
      }}>
        AI
      </div>
 
      <div style={{
        maxWidth: "82%", padding: "12px 16px",
        borderRadius: "4px 16px 16px 16px",
        background: B.white,
        border: `1px solid ${B.gray200}`,
        fontSize: "14px", lineHeight: "1.7", color: B.gray900,
        boxShadow: "0 1px 4px rgba(43,88,136,0.06)",
      }}>
        {/* Scrollable text for long content */}
        <div style={{
          whiteSpace: "pre-wrap", lineHeight: "1.7",
          maxHeight: "320px", overflowY: "auto",
          paddingRight: textToShow.length > 400 ? "4px" : "0",
        }}>
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
              <div key={i} style={{
                color: isHeading ? B.navy : "inherit",
                fontWeight: isHeading || isImportant ? 700 : "inherit",
                marginBottom: line.trim() === "" ? "8px" : "3px",
              }}>
                {cleanLine}
              </div>
            );
          })}
          {msg.typing && !done && (
            <span style={{
              display: "inline-block", width: "2px", height: "14px",
              background: B.red, marginLeft: "3px", verticalAlign: "middle",
              animation: "blink 0.8s infinite",
            }} />
          )}
        </div>
 
        {/* Stop typewriter button while generating */}
        {msg.typing && !done && (
          <button
            onClick={() => onTypingComplete?.(msg.id)}
            style={{
              marginTop: "10px", fontSize: "11px", padding: "4px 10px",
              borderRadius: "20px", border: `1px solid ${B.gray300}`,
              background: B.gray100, color: B.gray700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            ⏹ Stop generating
          </button>
        )}
 
        {msg.typing && done && !msg.audioUrl && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: B.gray500, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>⏳</span> Preparing audio...
          </div>
        )}
 
        {audioReady && msg.audioUrl && (
          <div style={{ marginTop: "10px" }}>
            {playingIndex === index ? (
              <button onClick={stopAudio} style={{
                fontSize: "11px", padding: "5px 12px", borderRadius: "20px",
                border: `1px solid ${B.red}`, background: B.redLight,
                color: B.red, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600,
              }}>
                ⏹ Stop
              </button>
            ) : (
              <button onClick={() => playAudio(msg.audioUrl, index)} style={{
                fontSize: "11px", padding: "5px 12px", borderRadius: "20px",
                border: `1px solid ${B.gray300}`, background: B.white,
                color: B.gray700, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 500,
              }}>
                🔊 Hear answer
              </button>
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
 
// ── Main component ─────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [playingIndex, setPlayingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [topicProgress, setTopicProgress] = useState({});
  const [revisionProgress, setRevisionProgress] = useState({});
  const [testResults, setTestResults] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedTestResult, setSubmittedTestResult] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupClassLevel, setSignupClassLevel] = useState("5");
  const [signupBoard, setSignupBoard] = useState("CBSE");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [classLevel, setClassLevel] = useState("5");
  const [board, setBoard] = useState("CBSE");
  const [answerLanguage, setAnswerLanguage] = useState("en");
  const [profileCompleted, setProfileCompleted] = useState(false);
 
  const currentSyllabus = SYLLABUS_DATA[classLevel]?.[board] || SYLLABUS_DATA["5"]?.CBSE;
  const currentChapters = selectedSubject ? currentSyllabus?.[selectedSubject] || [] : [];
  const currentChapter = selectedChapter;
 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cancelledRef = useRef(false);
  const pendingVoiceDataRef = useRef(null);
  const requestLockRef = useRef(false);
 
  // Shared input/label styles
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, color: B.gray700, marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const inputStyle = {
    width: "100%", padding: "11px 14px", marginBottom: "14px",
    borderRadius: "10px", border: `1.5px solid ${B.gray300}`,
    background: B.white, fontSize: "14px", color: B.gray900, outline: "none",
    boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color 0.2s",
  };
 
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
 
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
      } catch (error) {
        console.error("Auth profile load error:", error);
        setAuthError("Could not load your profile. Please try again.");
      } finally { setAuthLoading(false); }
    });
    return () => unsubscribe();
  }, []);
 
  useEffect(() => {
    if (user) { loadTopicProgress(user.uid); loadRevisionProgress(user.uid); loadTestResults(user.uid); }
    else { setTopicProgress({}); setRevisionProgress({}); setTestResults({}); }
  }, [user]);
 
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.onended = null; audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setPlayingIndex(null);
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

  const getTtsLanguage = () => {
    if (answerLanguage === "hi") return "hi";
    return "en";
  };

  const generateAnswerAudio = async (text, language = getTtsLanguage()) => {
    const ttsFormData = new FormData();
    ttsFormData.append("text", text);
    ttsFormData.append("language", language);
    const ttsRes = await fetch("/api/tts", { method: "POST", body: ttsFormData });
    if (!ttsRes.ok) return null;
    const ttsData = await ttsRes.json();
    return ttsData.audio_url || null;
  };
 
  const updateHistory = (question, answer) => {
    setHistory((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: answer }]);
  };
 
  // All original functions — unchanged
  const getTopicId = (subject, chapterTitle, topicTitle) =>
    `${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const getContentId = (subject, chapterTitle, topicTitle) =>
    `class_${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const getTopicStatus = (subject, chapterTitle, topicTitle) => topicProgress[getTopicId(subject, chapterTitle, topicTitle)]?.status || "Not Started";
  const isCompletedStatus = (status) => COMPLETED_STATUSES.includes(status);
  const getProgressStatus = (completed, total) => { if (total === 0 || completed === 0) return "Not Started"; if (completed === total) return "Completed"; return "In Progress"; };
  const getStatusColor = (status) => { if (status === "Completed") return B.green; if (status === "In Progress") return B.navy; return B.gray500; };
 
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
    } catch (error) { setAuthError(error.message || "Could not create account."); } finally { setAuthLoading(false); }
  };
 
  const handleLogin = async () => {
    setAuthError("");
    if (!loginEmail.trim() || !loginPassword.trim()) { setAuthError("Please enter email and password."); return; }
    try { setAuthLoading(true); await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword); }
    catch (error) { setAuthError(error.message || "Could not login."); } finally { setAuthLoading(false); }
  };
 
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setUserProfile(null); setMessages([]); setHistory([]); setTextInput("");
    setTopicProgress({}); setRevisionProgress({}); setTestResults({});
    setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null);
    setActiveTab("chat"); setSelectedSubject(null); setSelectedChapter(null);
    setProfileCompleted(false); pendingVoiceDataRef.current = null;
  };
 
  const loadTopicProgress = async (uid) => {
    if (!uid) return;
    try { setProgressLoading(true); const snap = await getDocs(collection(db, "users", uid, "topicProgress")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setTopicProgress(loaded); }
    catch (error) { console.error("Progress load error:", error); } finally { setProgressLoading(false); }
  };
 
  const updateTopicStatus = async (subject, chapterTitle, topicTitle, status) => {
    if (!user) { setError("Please login to save progress."); return; }
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    const progressData = { subject, chapterTitle, topicTitle, status, classLevel, board, updatedAt: serverTimestamp() };
    setTopicProgress((prev) => ({ ...prev, [topicId]: { ...progressData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "topicProgress", topicId), progressData, { merge: true }); }
    catch (error) { console.error("Progress save error:", error); }
  };
 
  const markTypingComplete = (messageId) => {
    setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, typing: false } : msg));
  };
 
  const clearConversation = () => { stopAudio(); setMessages([]); setHistory([]); setError(""); pendingVoiceDataRef.current = null; requestLockRef.current = false; };
 
  const getRevisionStatus = (subject, chapterTitle, topicTitle) => revisionProgress[getTopicId(subject, chapterTitle, topicTitle)]?.revised || false;
 
  const loadRevisionProgress = async (uid) => {
    if (!uid) return;
    try { const snap = await getDocs(collection(db, "users", uid, "revisionProgress")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setRevisionProgress(loaded); }
    catch (error) { console.error("Revision progress load error:", error); }
  };
 
  const updateRevisionStatus = async (subject, chapterTitle, topicTitle) => {
    if (!user) return;
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    const revisionData = { subject, chapterTitle, topicTitle, revised: true, classLevel, board, updatedAt: serverTimestamp() };
    setRevisionProgress((prev) => ({ ...prev, [topicId]: { ...revisionData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "revisionProgress", topicId), revisionData, { merge: true }); }
    catch (error) { console.error("Revision save error:", error); }
  };
 
  const getTestId = (type, subject, chapterTitle, topicTitle = "") =>
    (type === "topic" ? `topic_${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}` : `chapter_${classLevel}_${board}_${subject}_${chapterTitle}`)
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
 
  const getSavedTestResult = (type, subject, chapterTitle, topicTitle = "") => testResults[getTestId(type, subject, chapterTitle, topicTitle)] || null;
 
  const loadTestResults = async (uid) => {
    if (!uid) return;
    try { const snap = await getDocs(collection(db, "users", uid, "testResults")); const loaded = {}; snap.forEach((d) => { loaded[d.id] = d.data(); }); setTestResults(loaded); }
    catch (error) { console.error("Test results load error:", error); }
  };
 
  const saveTestResult = async (resultData) => {
    if (!user || !resultData?.testId) return;
    setTestResults((prev) => ({ ...prev, [resultData.testId]: { ...resultData, updatedAt: new Date().toISOString() } }));
    try { await setDoc(doc(db, "users", user.uid, "testResults", resultData.testId), { ...resultData, updatedAt: serverTimestamp() }, { merge: true }); }
    catch (error) { console.error("Test result save error:", error); }
  };
 
  const startTest = async ({ type, subject, chapterTitle, topicTitle = "", topics = [], questionCount }) => {
    if (!user) { setError("Please login to start a test."); return; }
    setError(""); setTestLoading(true); setSelectedAnswers({}); setSubmittedTestResult(null); setCurrentTest(null); setActiveTab("test");
    const testId = getTestId(type, subject, chapterTitle, topicTitle);
    const formData = new FormData();
    formData.append("test_type", type); formData.append("subject", subject); formData.append("chapter_title", chapterTitle);
    formData.append("topic_title", topicTitle || ""); formData.append("topics", JSON.stringify(topics || []));
    formData.append("question_count", String(questionCount)); formData.append("class_level", classLevel);
    formData.append("board", board); formData.append("answer_language", answerLanguage);
    try {
      const res = await fetch("/api/generate-test", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Could not generate test."); }
      const data = await res.json();
      const questions = Array.isArray(data.questions) ? data.questions : [];
      if (!questions.length) throw new Error("No questions generated. Please try again.");
      setCurrentTest({ testId, type, subject, chapterTitle, topicTitle, questionCount, questions });
    } catch (error) { console.error("Test generation error:", error); setError(error.message || "Could not generate test."); setActiveTab("syllabus"); }
    finally { setTestLoading(false); }
  };
 
  const handleTopicTest = (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic) return;
    startTest({ type: "topic", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: subtopic, topics: [subtopic], questionCount: 10 });
  };
 
  const handleChapterTest = () => {
    if (!selectedSubject || !currentChapter) return;
    startTest({ type: "chapter", subject: selectedSubject, chapterTitle: currentChapter.title, topicTitle: "", topics: currentChapter.subtopics || [], questionCount: 20 });
  };
 
  const submitCurrentTest = async () => {
    if (!currentTest?.questions?.length) return;
    let score = 0;
    currentTest.questions.forEach((q, i) => { if (Number(selectedAnswers[i]) === Number(q.answerIndex)) score += 1; });
    const resultData = { testId: currentTest.testId, type: currentTest.type, subject: currentTest.subject, chapterTitle: currentTest.chapterTitle, topicTitle: currentTest.topicTitle || "", score, total: currentTest.questions.length, percentage: Math.round((score / currentTest.questions.length) * 100), classLevel, board };
    setSubmittedTestResult(resultData);
    await saveTestResult(resultData);
  };
 
  const resetTestView = () => { setCurrentTest(null); setSelectedAnswers({}); setSubmittedTestResult(null); setActiveTab("syllabus"); };

  const formatList = (items = []) => items.filter(Boolean).map((item) => `- ${item}`).join("\n");

  const formatTermList = (items = []) =>
    items.filter(Boolean).map((item) => `- ${item.term}: ${item.meaning}`).join("\n");

  const formatStudyContent = (contentDoc) => {
    const content = contentDoc.studyContent || {};
    const diagram = content.diagram || {};
    return [
      content.title || contentDoc.topicTitle || "Study Topic",
      "",
      "Meaning",
      content.intro || "",
      "",
      "NCERT-Based Explanation",
      content.ncertBasedExplanation || "",
      "",
      "Easy Explanation",
      content.aiSimplifiedExplanation || "",
      "",
      "Step-by-Step Explanation",
      formatList(content.stepByStep),
      "",
      "Important Keywords",
      formatTermList(content.keywords),
      "",
      "Simple Real-Life Example",
      content.realLifeExample || "",
      "",
      diagram.content ? `${diagram.title || "Simple Diagram"}\n${diagram.content}` : "",
      "",
      "Quick Summary",
      formatList(content.summary),
      "",
      contentDoc.sourceLabel || "",
    ].filter((part) => part !== "").join("\n");
  };

  const formatRevisionContent = (contentDoc) => {
    const content = contentDoc.revisionContent || {};
    return [
      `Quick Revision: ${contentDoc.topicTitle || ""}`.trim(),
      "",
      "Quick Meaning",
      content.quickMeaning || "",
      "",
      "Key Points",
      formatList(content.keyPoints),
      "",
      "Important Terms",
      formatTermList(content.importantTerms),
      "",
      "Must Remember",
      formatList(content.mustRemember),
      "",
      content.quickFlowchart ? `Quick Flowchart\n${content.quickFlowchart}` : "",
      "",
      "Exam Points",
      formatList(content.examPoints),
      "",
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

  const addStoredContentToChat = (label, answer) => {
    const assistantId = crypto.randomUUID();
    stopAudio();
    setMessages((prev) => [
      ...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg),
      { id: crypto.randomUUID(), role: "user", text: label, isVoice: false },
      { id: assistantId, role: "assistant", text: answer, audioUrl: null, typing: true },
    ]);
    updateHistory(label, answer);
    setActiveTab("chat");
    return assistantId;
  };

  const convertStoredContentLanguage = async ({ label, sourceText, mode }) => {
    if (answerLanguage === "en") return sourceText;

    const languageLabel = answerLanguage === "hi" ? "Hindi in Devanagari script" : "natural Roman Hinglish";
    const modeMarker = mode === "revision" ? "REVISION_TOPIC_MODE" : "STUDY_TOPIC_MODE";
    const formData = new FormData();
    formData.append(
      "question",
      `${modeMarker}\n\nRewrite the stored ${mode} content below in ${languageLabel} for a Class ${classLevel} CBSE student.\n\nRules:\n- Do not say that you are rewriting or translating.\n- Keep the full lesson useful and detailed; do not shorten it to only 2-3 lines.\n- Keep all useful teaching points from the source.\n- Keep headings, bullet points, examples, summaries, and important keywords.\n- Keep it easy, warm, and student-friendly.\n- Do not add unrelated facts.\n- If the target is Hinglish, use Roman English letters only and no Devanagari.\n- If the target is Hindi, use simple Devanagari Hindi only, suitable for a Class ${classLevel} student.\n\nVisible student request: ${label}\n\nStored source content:\n${sourceText}`
    );
    formData.append("history", JSON.stringify([]));
    formData.append("class_level", classLevel);
    formData.append("board", board);
    formData.append("answer_language", answerLanguage);

    const res = await fetch("/api/ask-text", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Could not convert stored content language.");
    }
    const data = await res.json();
    return data.answer || sourceText;
  };

  const addStoredContentWithLanguage = async ({ label, sourceText, mode }) => {
    if (requestLockRef.current) return;
    requestLockRef.current = true;
    pendingVoiceDataRef.current = null;
    setTextInput("");
    setError("");
    setIsLoading(answerLanguage !== "en");
    setActiveTab("chat");
    try {
      const answer = await convertStoredContentLanguage({ label, sourceText, mode });
      const assistantId = addStoredContentToChat(label, answer);
      try {
        const audioUrl = await generateAnswerAudio(answer);
        if (audioUrl) {
          setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
        }
      } catch (ttsError) {
        console.error("Stored content TTS failed:", ttsError);
      }
    } catch (error) {
      console.error("Stored content language conversion error:", error);
      setError(error.message || "Could not prepare this answer in the selected language.");
      const assistantId = addStoredContentToChat(label, sourceText);
      try {
        const audioUrl = await generateAnswerAudio(sourceText);
        if (audioUrl) {
          setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
        }
      } catch (ttsError) {
        console.error("Stored content fallback TTS failed:", ttsError);
      }
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
      if (contentDoc?.revisionContent) {
        await addStoredContentWithLanguage({ label, sourceText: formatRevisionContent(contentDoc), mode: "revision" });
        return;
      }
    } catch (error) {
      console.error("Content library revision load error:", error);
    }
    const prompt = `REVISION_TOPIC_MODE\n\nTopic: ${subtopic}\nChapter: ${currentChapter.title}\nSubject: ${selectedSubject}\nClass: ${classLevel}\nBoard: ${board}\n\nCreate short and crisp revision notes for this topic.\n\nRevision format:\n1. Quick Meaning\n2. Key Points\n3. Important Terms\n4. Must Remember\n5. Quick Flowchart\n6. Exam Points\n\nRules:\n- Keep it short and crisp.\n- Use mostly bullet points.\n- Do not write long paragraphs.\n- Follow the selected answer language.`;
    pendingVoiceDataRef.current = null; setTextInput(prompt); setActiveTab("chat");
  };
 
  const handleStudyTopic = async (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic || requestLockRef.current) return;
    await updateTopicStatus(selectedSubject, currentChapter.title, subtopic, "Completed");
    const label = `Study Topic: ${subtopic}`;
    try {
      const contentDoc = await loadPublishedContent(selectedSubject, currentChapter.title, subtopic);
      if (contentDoc?.studyContent) {
        await addStoredContentWithLanguage({ label, sourceText: formatStudyContent(contentDoc), mode: "study topic" });
        return;
      }
    } catch (error) {
      console.error("Content library study load error:", error);
    }
    const prompt = `STUDY_TOPIC_MODE\n\nTopic: ${subtopic}\nChapter: ${currentChapter.title}\nSubject: ${selectedSubject}\nClass: ${classLevel}\nBoard: ${board}\n\nExplain this topic in detail for a school student.\n\nAnswer format:\n1. Meaning of the topic\n2. Why it is important\n3. Step-by-step explanation\n4. Important keywords with simple meanings\n5. One simple real-life example\n6. Quick revision summary\n\nRules:\n- Give a large answer, not 4-5 lines.\n- Use headings and bullet points.\n- Keep the language easy for Class ${classLevel}.\n- Follow the selected answer language.`;
    pendingVoiceDataRef.current = null; setTextInput(prompt); setActiveTab("chat");
  };
 
  const cancelProcessing = () => {
    cancelledRef.current = true;
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    requestLockRef.current = false;
    setIsLoading(false); setIsTranscribing(false); setError("");
  };
 
  const handleTextSend = async () => {
    if (!textInput.trim() || isLoading || requestLockRef.current) return;
    requestLockRef.current = true;
    const question = textInput.trim();
    const assistantId = crypto.randomUUID();
    setTextInput(""); setError(""); setIsLoading(true);
    setMessages((prev) => [...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg), { id: crypto.randomUUID(), role: "user", text: question, isVoice: false }]);
    const formData = new FormData();
    formData.append("question", question); formData.append("history", JSON.stringify(history));
    formData.append("class_level", classLevel); formData.append("board", board); formData.append("answer_language", answerLanguage);
    try {
      const res = await fetch("/api/ask-text", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Server error"); }
      const data = await res.json();
      setMessages((prev) => [...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg), { id: assistantId, role: "assistant", text: data.answer, audioUrl: null, typing: true }]);
      updateHistory(question, data.answer); setIsLoading(false); requestLockRef.current = false;
      try {
        const audioUrl = await generateAnswerAudio(data.answer, data.language === "hi" ? "hi" : "en");
        if (audioUrl) setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, audioUrl } : msg));
      } catch (ttsError) { console.error("TTS failed:", ttsError); }
    } catch (e) { setError(e.message); setIsLoading(false); requestLockRef.current = false; }
  };
 
  const stopRecordingAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const stream = mediaRecorderRef.current?.stream;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false); setIsTranscribing(true); cancelledRef.current = false;
      abortControllerRef.current = new AbortController();
      const formData = new FormData();
      formData.append("file", blob, "recording.webm"); formData.append("history", JSON.stringify(history));
      try {
        const res = await fetch("/api/ask", { method: "POST", body: formData, signal: abortControllerRef.current.signal });
        if (cancelledRef.current) return;
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Server error"); }
        const data = await res.json();
        setIsTranscribing(false); setTextInput(data.question); pendingVoiceDataRef.current = data;
      } catch (e) { if (e.name === "AbortError" || cancelledRef.current) { setIsTranscribing(false); return; } setIsTranscribing(false); setError(e.message); }
    };
    mediaRecorderRef.current.stop();
  };
 
  const handleSend = async () => {
    if (!textInput.trim() || isLoading || requestLockRef.current) return;
    if (pendingVoiceDataRef.current) {
      requestLockRef.current = true;
      const data = pendingVoiceDataRef.current;
      const question = textInput.trim();
      pendingVoiceDataRef.current = null; setTextInput(""); setError("");
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev.map((msg) => msg.role === "assistant" ? { ...msg, typing: false } : msg), { id: crypto.randomUUID(), role: "user", text: question, isVoice: true }, { id: assistantId, role: "assistant", text: data.answer, audioUrl: data.audio_url, typing: false }]);
      updateHistory(question, data.answer);
      if (data.audio_url) { setTimeout(() => { setMessages((prev) => { const aiIndex = prev.findIndex((m) => m.id === assistantId); if (aiIndex !== -1) playAudio(data.audio_url, aiIndex); return prev; }); }, 200); }
      requestLockRef.current = false;
      return;
    }
    await handleTextSend();
  };
 
  const startRecording = async () => {
    setError(""); stopAudio(); pendingVoiceDataRef.current = null; setTextInput("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
 
        {/* Navbar */}
        <nav style={{ background: B.navy, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(43,88,136,0.15)" }}>
          <TeachifyyLogo size={30} light />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Student Voice Assistant</span>
        </nav>
 
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "48px 16px" }}>
          {/* Brand accent bar */}
          <div style={{ height: "4px", borderRadius: "2px", background: `linear-gradient(90deg, ${B.navy}, ${B.red})`, marginBottom: "28px" }} />
 
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 8px 32px rgba(43,88,136,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <TeachifyyLogo size={36} />
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: B.navy, margin: "14px 0 6px" }}>
                {authMode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p style={{ fontSize: "14px", color: B.gray500, margin: 0 }}>
                {authMode === "login" ? "Login to continue learning." : "Create your student profile."}
              </p>
            </div>
 
            {authError && (
              <div style={{ marginBottom: "16px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", color: B.red, fontSize: "13px", fontWeight: 500 }}>
                ⚠️ {authError}
              </div>
            )}
 
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
                <select value={signupClassLevel} onChange={(e) => setSignupClassLevel(e.target.value)} style={inputStyle}>
                  {["5","6","7","8","9","10"].map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <label style={labelStyle}>Board</label>
                <select value={signupBoard} onChange={(e) => setSignupBoard(e.target.value)} style={inputStyle}>
                  {["CBSE","RBSE","ICSE","Other"].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </>
            )}
 
            <button
              onClick={authMode === "login" ? handleLogin : handleCreateAccount}
              disabled={authLoading}
              style={{ width: "100%", padding: "13px 16px", border: "none", borderRadius: "12px", background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, color: B.white, fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "6px", opacity: authLoading ? 0.6 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.2px" }}
            >
              {authMode === "login" ? "Login →" : "Create Account →"}
            </button>
 
            <button
              onClick={() => { setAuthError(""); setAuthMode(authMode === "login" ? "signup" : "login"); }}
              style={{ width: "100%", marginTop: "14px", background: "transparent", border: "none", color: B.navy, cursor: "pointer", fontSize: "14px", fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {authMode === "login" ? "New student? Create account" : "Already have an account? Login"}
            </button>
          </div>
 
          {/* Tagline */}
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: B.gray500, fontStyle: "italic" }}>
            Develop what teaching demands
          </p>
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
          <button onClick={handleLogout} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.15)", color: B.white, cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
            Logout
          </button>
        </nav>
 
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: "20px", padding: "32px 28px", boxShadow: "0 8px 32px rgba(43,88,136,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: B.navyLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "28px" }}>🎓</div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: B.navy, marginBottom: "6px" }}>Welcome, {userProfile?.name || "Student"}!</h1>
              <p style={{ fontSize: "14px", color: B.gray500 }}>Class {classLevel} · {board}</p>
            </div>
 
            <label style={labelStyle}>Choose answer language</label>
            <select value={answerLanguage} onChange={(e) => setAnswerLanguage(e.target.value)} style={inputStyle}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="hinglish">Hinglish</option>
            </select>
 
            <button
              onClick={() => setProfileCompleted(true)}
              style={{ width: "100%", padding: "13px 16px", border: "none", borderRadius: "12px", background: `linear-gradient(135deg, ${B.red}, ${B.orange})`, color: B.white, fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  // ── Main app ───────────────────────────────────────────
  const overallProgress = getOverallProgress();
 
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
          <button onClick={handleLogout} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: B.white, cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
            Logout
          </button>
        </div>
      </nav>
 
      {/* Red accent stripe */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${B.red}, ${B.orange}, ${B.warm})` }} />
 
      {/* Main */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 16px" }}>
 
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>
            Welcome back, {userProfile?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p style={{ fontSize: "13px", color: B.gray500 }}>
            Ask anything in Hindi, English, or Hinglish
          </p>
        </div>
 
        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", background: B.gray200, padding: "5px", borderRadius: "14px" }}>
          {[
            { key: "chat", label: "💬 Chatbot" },
            { key: "syllabus", label: "📚 Syllabus Tracker" },
            { key: "test", label: "📝 Test", disabled: !currentTest && !testLoading },
          ].map(({ key, label, disabled }) => (
            <button
              key={key}
              onClick={() => { if (key === "test" && (currentTest || testLoading)) setActiveTab("test"); else if (key !== "test") setActiveTab(key); }}
              disabled={disabled}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: "10px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: activeTab === key ? B.navy : "transparent",
                color: activeTab === key ? B.white : B.gray700,
                opacity: disabled ? 0.4 : 1,
                transition: "all 0.2s",
              }}
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
              </div>
              {history.length > 0 && (
                <button onClick={clearConversation} style={{ fontSize: "12px", color: B.gray500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  🗑 Clear chat
                </button>
              )}
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
                messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={msg.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: "row-reverse" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${B.red}, ${B.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: B.white, marginTop: "2px" }}>
                        {userProfile?.name?.[0]?.toUpperCase() || "Y"}
                      </div>
                      {/* Scrollable user bubble for long questions */}
                      <div style={{
                        maxWidth: "78%", padding: "12px 16px",
                        borderRadius: "16px 4px 16px 16px",
                        background: B.navy, color: B.white,
                        fontSize: "14px", lineHeight: "1.6",
                        maxHeight: "120px", overflowY: "auto",
                        boxShadow: "0 2px 8px rgba(43,88,136,0.2)",
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <AssistantBubble key={msg.id} msg={msg} index={i} playingIndex={playingIndex} playAudio={playAudio} stopAudio={stopAudio} onTypingComplete={markTypingComplete} />
                  )
                )
              )}
 
              {isLoading && (
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${B.navy}, ${B.navyDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: B.white, flexShrink: 0 }}>AI</div>
                  <div style={{ padding: "14px 18px", background: B.white, borderRadius: "4px 16px 16px 16px", border: `1px solid ${B.gray200}`, display: "flex", gap: "5px", alignItems: "center", boxShadow: "0 1px 4px rgba(43,88,136,0.06)" }}>
                    {[0, 0.2, 0.4].map((delay) => (
                      <div key={delay} style={{ width: "7px", height: "7px", borderRadius: "50%", background: B.navy, animation: `bounce 1.2s ${delay}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
 
            {/* Error */}
            {error && (
              <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", fontSize: "13px", color: B.red, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}
 
            {/* Transcribing bar */}
            {isTranscribing && (
              <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.navyLight, border: `1px solid ${B.navy}`, borderRadius: "10px", fontSize: "13px", color: B.navy, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: B.navy, animation: "pulse 1s infinite" }} />
                  <span style={{ fontWeight: 500 }}>Processing your voice...</span>
                </div>
                <button onClick={cancelProcessing} style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "20px", border: `1px solid ${B.navy}`, background: B.white, color: B.navy, cursor: "pointer", fontWeight: 600 }}>
                  ✕ Cancel
                </button>
              </div>
            )}
 
            {/* Recording bar */}
            {isRecording && (
              <div style={{ margin: "0 16px 10px", padding: "10px 14px", background: B.redLight, border: `1px solid ${B.red}`, borderRadius: "10px", fontSize: "13px", color: B.red, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: B.red, animation: "pulse 1s infinite" }} />
                <span style={{ fontWeight: 500 }}>Recording... press mic again to stop</span>
              </div>
            )}
 
            {/* Voice review hint */}
            {!isRecording && !isTranscribing && pendingVoiceDataRef.current && textInput && (
              <div style={{ margin: "0 16px 8px", fontSize: "12px", color: B.navy, padding: "0 4px", fontWeight: 500 }}>
                ✏️ Review or edit your question, then press Send
              </div>
            )}
 
            {/* Input area */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${B.gray200}`, display: "flex", gap: "8px", alignItems: "flex-end", background: B.white }}>
              {/* Textarea for multi-line input */}
              <textarea
                placeholder={isTranscribing ? "Transcribing your voice..." : "Type your question here..."}
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (pendingVoiceDataRef.current) pendingVoiceDataRef.current = null;
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={isLoading || isRecording || isTranscribing}
                rows={1}
                style={{
                  flex: 1, padding: "10px 16px",
                  border: `1.5px solid ${B.gray300}`,
                  borderRadius: "14px", fontSize: "14px", color: B.gray900,
                  background: isTranscribing ? B.gray100 : B.gray50,
                  outline: "none", resize: "none", overflowY: "auto",
                  maxHeight: "100px", lineHeight: "1.5",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = B.navy; }}
                onBlur={(e) => { e.target.style.borderColor = B.gray300; }}
              />
 
              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isLoading || isRecording || isTranscribing || !textInput.trim()}
                style={{
                  width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                  background: textInput.trim() ? `linear-gradient(135deg, ${B.navy}, ${B.navyDark})` : B.gray200,
                  color: B.white, border: "none", cursor: "pointer", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: (isLoading || isRecording || isTranscribing || !textInput.trim()) ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                title="Send (Enter)"
              >
                ➤
              </button>
 
              {/* Mic button */}
              <button
                onClick={isRecording ? stopRecordingAndTranscribe : startRecording}
                disabled={isLoading || isTranscribing}
                style={{
                  width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer",
                  fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  background: isRecording ? B.red : B.greenLight,
                  color: isRecording ? B.white : B.green,
                  opacity: (isLoading || isTranscribing) ? 0.4 : 1,
                  animation: isRecording ? "pulse 1s infinite" : "none",
                  transition: "all 0.2s",
                }}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                🎤
              </button>
            </div>
 
            <div style={{ textAlign: "center", fontSize: "11px", color: B.gray500, padding: "8px 16px", borderTop: `1px solid ${B.gray100}`, background: B.white }}>
              Press <kbd style={{ background: B.gray100, padding: "1px 5px", borderRadius: "4px", fontSize: "10px" }}>Enter</kbd> to send · <kbd style={{ background: B.gray100, padding: "1px 5px", borderRadius: "4px", fontSize: "10px" }}>Shift+Enter</kbd> for new line
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
                    <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {currentTest.type === "topic" ? "Topic Test" : "Chapter Test"}
                    </div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: B.navy, marginBottom: "4px" }}>
                      {currentTest.type === "topic" ? currentTest.topicTitle : currentTest.chapterTitle}
                    </h2>
                    <p style={{ fontSize: "13px", color: B.gray500 }}>{currentTest.subject} · {currentTest.questions.length} MCQs</p>
                  </div>
                  <button onClick={resetTestView} style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, cursor: "pointer", fontSize: "12px", fontWeight: 500 }}>
                    ← Back
                  </button>
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
                    const selected = selectedAnswers[qi];
                    const isSubmitted = Boolean(submittedTestResult);
                    return (
                      <div key={qi} style={{ padding: "16px", borderRadius: "14px", background: B.gray50, border: `1px solid ${B.gray200}` }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: B.navy, marginBottom: "12px" }}>Q{qi + 1}. {question.question}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(question.options || []).map((option, oi) => {
                            const isCorrect = oi === question.answerIndex;
                            const isSelected = Number(selected) === oi;
                            return (
                              <label key={oi} style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", cursor: isSubmitted ? "default" : "pointer", fontSize: "13px", color: B.gray900,
                                border: isSubmitted && isCorrect ? `1.5px solid ${B.greenBorder}` : isSubmitted && isSelected && !isCorrect ? `1.5px solid ${B.red}` : `1px solid ${B.gray200}`,
                                background: isSubmitted && isCorrect ? B.greenLight : isSubmitted && isSelected && !isCorrect ? B.redLight : B.white,
                                fontWeight: isSubmitted && isCorrect ? 600 : "normal",
                              }}>
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
                  <button
                    onClick={submitCurrentTest}
                    disabled={Object.keys(selectedAnswers).length !== currentTest.questions.length}
                    style={{
                      width: "100%", marginTop: "20px", padding: "13px 16px", borderRadius: "12px", border: "none",
                      background: Object.keys(selectedAnswers).length === currentTest.questions.length ? `linear-gradient(135deg, ${B.navy}, ${B.navyDark})` : B.gray200,
                      color: B.white, fontSize: "15px", fontWeight: 700, cursor: Object.keys(selectedAnswers).length === currentTest.questions.length ? "pointer" : "not-allowed",
                      opacity: Object.keys(selectedAnswers).length === currentTest.questions.length ? 1 : 0.5,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
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
 
            {/* Header + overall progress */}
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
                <div style={{ fontSize: "12px", color: B.gray500, marginTop: "6px" }}>
                  {overallProgress.completed}/{overallProgress.total} topics completed {progressLoading ? "· Syncing..." : ""}
                </div>
              </div>
            </div>
 
            {/* Subject grid */}
            {!selectedSubject && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {Object.keys(currentSyllabus).map((subject) => {
                  const icons = { EVS: "🌱", Maths: "➗", English: "📘", Hindi: "📕" };
                  const sp = getSubjectProgress(subject);
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
 
            {/* Chapter list */}
            {selectedSubject && !selectedChapter && (
              <div>
                <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }} style={{ marginBottom: "14px", border: "none", background: "transparent", color: B.navy, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>
                  ← Back to Subjects
                </button>
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
 
            {/* Topic list */}
            {selectedSubject && selectedChapter && (
              <div>
                <button onClick={() => setSelectedChapter(null)} style={{ marginBottom: "14px", border: "none", background: "transparent", color: B.navy, fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>
                  ← Back to Chapters
                </button>
 
                <div style={{ padding: "16px", borderRadius: "14px", background: B.navyLight, border: `1px solid rgba(43,88,136,0.15)`, marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: B.gray500, marginBottom: "3px", fontWeight: 500 }}>{selectedSubject}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: B.navy, marginBottom: "10px" }}>{currentChapter.title}</h3>
                  {(() => {
                    const cp = getChapterProgress(selectedSubject, currentChapter);
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
                          <button onClick={handleChapterTest} style={{ padding: "8px 14px", border: "none", borderRadius: "10px", background: B.navy, color: B.white, fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>
                            Chapter Test — 20 MCQs
                          </button>
                          {savedChapterTest && <span style={{ fontSize: "12px", color: B.green, fontWeight: 700 }}>Last: {savedChapterTest.score}/{savedChapterTest.total}</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>
 
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentChapter.subtopics.map((subtopic, index) => {
                    const currentStatus = getTopicStatus(selectedSubject, currentChapter.title, subtopic);
                    const topicCompleted = isCompletedStatus(currentStatus);
                    const savedTopicTest = getSavedTestResult("topic", selectedSubject, currentChapter.title, subtopic);
                    const revised = getRevisionStatus(selectedSubject, currentChapter.title, subtopic);
                    return (
                      <div key={subtopic} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", background: B.white, border: topicCompleted ? `1.5px solid ${B.greenBorder}` : `1px solid ${B.gray200}`, flexWrap: "wrap" }}>
                        <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: topicCompleted ? B.greenLight : B.navyLight, color: topicCompleted ? B.green : B.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                          {topicCompleted ? "✓" : index + 1}
                        </span>
                        <span style={{ flex: 1, fontSize: "13px", color: B.gray900, fontWeight: 500, minWidth: "120px" }}>{subtopic}</span>
                        <select value={currentStatus} onChange={(e) => updateTopicStatus(selectedSubject, currentChapter.title, subtopic, e.target.value)} style={{ padding: "5px 8px", borderRadius: "8px", border: `1px solid ${B.gray300}`, background: B.white, color: B.gray700, fontSize: "11px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {savedTopicTest && <span style={{ fontSize: "11px", color: B.green, fontWeight: 700 }}>Test: {savedTopicTest.score}/{savedTopicTest.total}</span>}
                        <button disabled={isLoading || testLoading} onClick={() => handleTopicTest(subtopic)} style={{ padding: "5px 10px", border: `1px solid ${B.greenBorder}`, borderRadius: "8px", background: B.greenLight, color: B.green, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 700, opacity: isLoading || testLoading ? 0.5 : 1 }}>Test</button>
                        <button disabled={isLoading || testLoading} onClick={() => handleReviseTopic(subtopic)} style={{ padding: "5px 10px", border: `1px solid ${revised ? B.navy : B.gray300}`, borderRadius: "8px", background: revised ? B.navyLight : B.white, color: B.navy, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 600, opacity: isLoading || testLoading ? 0.5 : 1 }}>
                          {revised ? "Revised ✓" : "Revise"}
                        </button>
                        <button disabled={isLoading || testLoading} onClick={() => handleStudyTopic(subtopic)} style={{ padding: "5px 10px", border: "none", borderRadius: "8px", background: B.navy, color: B.white, fontSize: "11px", cursor: isLoading || testLoading ? "not-allowed" : "pointer", flexShrink: 0, fontWeight: 600, opacity: isLoading || testLoading ? 0.5 : 1 }}>
                          Study
                        </button>
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
