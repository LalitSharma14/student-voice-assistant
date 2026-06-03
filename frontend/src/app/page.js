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
 
// ── Sample syllabus data for Phase 1 ───────────────────────
const SYLLABUS_DATA = {
  "5": {
    CBSE: {
      Science: [
        {
          title: "Plants and Their Life",
          subtopics: [
            "Parts of a plant",
            "Photosynthesis",
            "Uses of plants",
            "Plant reproduction",
          ],
        },
        {
          title: "Animals and Their Habitats",
          subtopics: [
            "Domestic and wild animals",
            "Animal habitats",
            "Adaptation in animals",
            "Food habits of animals",
          ],
        },
        {
          title: "Food and Health",
          subtopics: [
            "Balanced diet",
            "Nutrients in food",
            "Healthy eating habits",
            "Diseases caused by unhealthy food",
          ],
        },
        {
          title: "Our Environment",
          subtopics: [
            "Natural environment",
            "Pollution",
            "Conservation of resources",
            "Keeping surroundings clean",
          ],
        },
      ],
 
      Maths: [
        {
          title: "Numbers and Numeration",
          subtopics: [
            "Place value",
            "Expanded form",
            "Comparing numbers",
            "Roman numerals",
          ],
        },
        {
          title: "Addition and Subtraction",
          subtopics: [
            "Addition of large numbers",
            "Subtraction of large numbers",
            "Word problems",
            "Checking answers",
          ],
        },
        {
          title: "Multiplication and Division",
          subtopics: [
            "Multiplication facts",
            "Division facts",
            "Long multiplication",
            "Long division",
          ],
        },
        {
          title: "Fractions",
          subtopics: [
            "Like and unlike fractions",
            "Equivalent fractions",
            "Addition of fractions",
            "Subtraction of fractions",
          ],
        },
      ],
 
      English: [
        {
          title: "Reading Comprehension",
          subtopics: [
            "Reading short passages",
            "Finding main idea",
            "Answering questions",
            "Vocabulary from passage",
          ],
        },
        {
          title: "Nouns and Pronouns",
          subtopics: [
            "Common nouns",
            "Proper nouns",
            "Personal pronouns",
            "Using pronouns correctly",
          ],
        },
        {
          title: "Verbs and Tenses",
          subtopics: [
            "Action words",
            "Present tense",
            "Past tense",
            "Future tense",
          ],
        },
        {
          title: "Paragraph Writing",
          subtopics: [
            "Writing topic sentence",
            "Adding supporting lines",
            "Using simple examples",
            "Ending a paragraph",
          ],
        },
      ],
 
      SST: [
        {
          title: "Our Country India",
          subtopics: [
            "Location of India",
            "Neighbouring countries",
            "States and union territories",
            "National symbols",
          ],
        },
        {
          title: "Maps and Directions",
          subtopics: [
            "Types of maps",
            "Directions",
            "Symbols on maps",
            "Reading a simple map",
          ],
        },
        {
          title: "Early Humans",
          subtopics: [
            "Life of early humans",
            "Discovery of fire",
            "Stone tools",
            "Settled life",
          ],
        },
        {
          title: "Our Rights and Duties",
          subtopics: [
            "Meaning of rights",
            "Meaning of duties",
            "Good citizen habits",
            "Respecting others",
          ],
        },
      ],
    },
  },
};
 
const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "Revision Done",
  "Test Done",
];
 
const COMPLETED_STATUSES = ["Completed", "Revision Done", "Test Done"];
 
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
 
      setDisplayed((prev) => (prev ? `${prev} ${currentWord}` : currentWord));
    }, speed);
 
    return () => clearInterval(interval);
  }, [text, speed]);
 
  return { displayed, done };
}
 
// ── Assistant bubble with typewriter ──────────────────────
function AssistantBubble({
  msg,
  index,
  playingIndex,
  playAudio,
  stopAudio,
  onTypingComplete,
}) {
  const { displayed, done } = useTypewriter(msg.typing ? msg.text : "");
  const [audioReady, setAudioReady] = useState(false);
  const ttsStarted = useRef(false);
 
  useEffect(() => {
  if (done && msg.typing) {
    onTypingComplete?.(msg.id);
  }
}, [done, msg.typing, msg.id, onTypingComplete]);
 
  useEffect(() => {
    if (!msg.typing && msg.audioUrl && !ttsStarted.current) {
      ttsStarted.current = true;
      setAudioReady(true);
    }
  }, [msg.audioUrl, msg.typing]);
 
  const textToShow = msg.typing ? displayed : msg.text;
 
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 500,
          flexShrink: 0,
          background: "#eff6ff",
          color: "#1a56db",
        }}
      >
        AI
      </div>
 
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: "16px",
          borderBottomLeftRadius: "4px",
          fontSize: "14px",
          lineHeight: "1.6",
          background: "#f3f4f6",
          color: "#111827",
        }}
      >
       <div
  style={{
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
  }}
>
  {textToShow.split("\n").map((line, lineIndex) => {
    const cleanLine = line.replace(/\*\*/g, "");
    const lowerLine = cleanLine.toLowerCase().trim();
 
    // Only headings are blue. Important lines stay black but bold.
    const isHeadingLine =
      lowerLine === "topic explanation" ||
      lowerLine === "quick revision" ||
      lowerLine === "quick meaning" ||
      lowerLine === "key points" ||
      lowerLine === "important terms" ||
      lowerLine === "must remember" ||
      lowerLine === "quick flowchart" ||
      lowerLine === "simple diagram" ||
      lowerLine === "exam points" ||
      lowerLine === "quick summary" ||
      lowerLine === "meaning" ||
      lowerLine === "why it is important" ||
      lowerLine === "step-by-step explanation" ||
      lowerLine === "important keywords" ||
      lowerLine === "simple real-life example" ||
      /^\d+\.\s/.test(lowerLine);
 
    const isImportantLine =
      lowerLine.includes("definition:") ||
      lowerLine.includes("important:") ||
      lowerLine.includes("remember:") ||
      lowerLine.includes("note:");
 
    return (
      <div
        key={lineIndex}
        style={{
          color: isHeadingLine ? "#1a56db" : "inherit",
          fontWeight: isHeadingLine || isImportantLine ? 700 : "inherit",
          marginBottom: line.trim() === "" ? "8px" : "4px",
        }}
      >
        {cleanLine}
      </div>
    );
  })}
 
      {msg.typing && !done && (
        <span
          style={{
          display: "inline-block",
          width: "2px",
          height: "14px",
          background: "#1a56db",
          marginLeft: "3px",
          verticalAlign: "middle",
          animation: "blink 0.8s infinite",
        }}
    />
  )}
</div>
 
        {msg.typing && done && !msg.audioUrl && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>⏳</span> Preparing audio...
          </div>
        )}
 
        {audioReady && msg.audioUrl && (
          <div style={{ marginTop: "8px" }}>
            {playingIndex === index ? (
              <button
                onClick={stopAudio}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: "1px solid #fca5a5",
                  background: "#fef2f2",
                  color: "#dc2626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ⏹ Stop
              </button>
            ) : (
              <button
                onClick={() => playAudio(msg.audioUrl, index)}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
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
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [playingIndex, setPlayingIndex] = useState(null);
 
  // ── Main app tabs ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("chat");
 
  // ── Syllabus tracker selection states ────────────────────
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
 
 
    // ── Firebase auth states ────────────────────────────────
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | signup
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
 
  // ── Student learning profile ─────────────────────────────
  const [classLevel, setClassLevel] = useState("5");
  const [board, setBoard] = useState("CBSE");
  const [answerLanguage, setAnswerLanguage] = useState("en");
  const [profileCompleted, setProfileCompleted] = useState(false);
 
  const currentSyllabus =
    SYLLABUS_DATA[classLevel]?.[board] || SYLLABUS_DATA["5"]?.CBSE;
 
  const currentChapters = selectedSubject
    ? currentSyllabus?.[selectedSubject] || []
    : [];
 
  const currentChapter = selectedChapter;
 
  const getTopicId = (subject, chapterTitle, topicTitle) => {
    return `${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };
 
  const getTopicStatus = (subject, chapterTitle, topicTitle) => {
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    return topicProgress[topicId]?.status || "Not Started";
  };
 
  const isCompletedStatus = (status) => {
    return COMPLETED_STATUSES.includes(status);
  };
 
  const getProgressStatus = (completed, total) => {
    if (total === 0 || completed === 0) return "Not Started";
    if (completed === total) return "Completed";
    return "In Progress";
  };
 
  const getStatusColor = (status) => {
    if (status === "Completed") return "#16a34a";
    if (status === "In Progress") return "#1a56db";
    return "#6b7280";
  };
 
  const getChapterProgress = (subject, chapter) => {
    const totalTopics = chapter?.subtopics?.length || 0;
 
    if (totalTopics === 0) {
      return {
        completed: 0,
        total: 0,
        percent: 0,
        status: "Not Started",
      };
    }
 
    const completedTopics = chapter.subtopics.filter((topic) =>
      isCompletedStatus(getTopicStatus(subject, chapter.title, topic))
    ).length;
 
    return {
      completed: completedTopics,
      total: totalTopics,
      percent: Math.round((completedTopics / totalTopics) * 100),
      status: getProgressStatus(completedTopics, totalTopics),
    };
  };
 
  const getSubjectProgress = (subject) => {
    const chapters = currentSyllabus?.[subject] || [];
    let totalTopics = 0;
    let completedTopics = 0;
 
    chapters.forEach((chapter) => {
      totalTopics += chapter.subtopics.length;
      completedTopics += chapter.subtopics.filter((topic) =>
        isCompletedStatus(getTopicStatus(subject, chapter.title, topic))
      ).length;
    });
 
    return {
      completed: completedTopics,
      total: totalTopics,
      percent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      status: getProgressStatus(completedTopics, totalTopics),
    };
  };
 
  const getOverallProgress = () => {
    let totalTopics = 0;
    let completedTopics = 0;
 
    Object.keys(currentSyllabus || {}).forEach((subject) => {
      const subjectProgress = getSubjectProgress(subject);
      totalTopics += subjectProgress.total;
      completedTopics += subjectProgress.completed;
    });
 
    return {
      completed: completedTopics,
      total: totalTopics,
      percent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
      status: getProgressStatus(completedTopics, totalTopics),
    };
  };
 
  const progressBar = (percent) => (
    <div
      style={{
        width: "100%",
        height: "8px",
        borderRadius: "999px",
        background: "#e5e7eb",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          borderRadius: "999px",
          background: "#1a56db",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cancelledRef = useRef(false);
  const pendingVoiceDataRef = useRef(null);
 
    const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "6px",
  };
 
  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    marginBottom: "16px",
    borderRadius: "9px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
  };
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
    // ── Firebase login state listener ───────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
 
      try {
        if (!currentUser) {
          setUser(null);
          setUserProfile(null);
          setProfileCompleted(false);
          setAuthLoading(false);
          return;
        }
 
        setUser(currentUser);
 
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
 
        if (userSnap.exists()) {
          const profile = userSnap.data();
 
          setUserProfile(profile);
          setClassLevel(profile.classLevel || "5");
          setBoard(profile.board || "CBSE");
        }
 
        setProfileCompleted(false); // after login, ask only language
      } catch (error) {
        console.error("Auth profile load error:", error);
        setAuthError("Could not load your profile. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    });
 
    return () => unsubscribe();
  }, []);
 
  useEffect(() => {
    if (user) {
      loadTopicProgress(user.uid);
      loadRevisionProgress(user.uid);
      loadTestResults(user.uid);
    } else {
      setTopicProgress({});
      setRevisionProgress({});
      setTestResults({});
    }
  }, [user]);
 
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
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
 
    setTimeout(() => {
      if (audioRef.current !== audio) return;
 
      const playPromise = audio.play();
 
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingIndex(index);
            audio.onended = () => setPlayingIndex(null);
          })
          .catch((e) => {
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
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ]);
  };
 
    const handleCreateAccount = async () => {
    setAuthError("");
 
    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      !signupMobile.trim() ||
      !signupPassword.trim()
    ) {
      setAuthError("Please fill all required fields.");
      return;
    }
 
    if (signupPassword.length < 6) {
      setAuthError("Password should be at least 6 characters.");
      return;
    }
 
    try {
      setAuthLoading(true);
 
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail.trim(),
        signupPassword
      );
 
      const createdUser = userCredential.user;
 
      const profileData = {
        name: signupName.trim(),
        email: signupEmail.trim(),
        mobile: signupMobile.trim(),
        classLevel: signupClassLevel,
        board: signupBoard,
        createdAt: serverTimestamp(),
      };
 
      await setDoc(doc(db, "users", createdUser.uid), profileData);
 
      setUser(createdUser);
      setUserProfile(profileData);
      setClassLevel(signupClassLevel);
      setBoard(signupBoard);
      setProfileCompleted(false);
    } catch (error) {
      console.error("Create account error:", error);
      setAuthError(error.message || "Could not create account.");
    } finally {
      setAuthLoading(false);
    }
  };
 
  const handleLogin = async () => {
    setAuthError("");
 
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Please enter email and password.");
      return;
    }
 
    try {
      setAuthLoading(true);
 
      await signInWithEmailAndPassword(
        auth,
        loginEmail.trim(),
        loginPassword
      );
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message || "Could not login.");
    } finally {
      setAuthLoading(false);
    }
  };
 
  const handleLogout = async () => {
    await signOut(auth);
 
    setUser(null);
    setUserProfile(null);
    setMessages([]);
    setHistory([]);
    setTextInput("");
    setTopicProgress({});
    setRevisionProgress({});
    setTestResults({});
    setCurrentTest(null);
    setSelectedAnswers({});
    setSubmittedTestResult(null);
    setActiveTab("chat");
    setSelectedSubject(null);
    setSelectedChapter(null);
    setProfileCompleted(false);
    pendingVoiceDataRef.current = null;
  };
 
  const loadTopicProgress = async (uid) => {
    if (!uid) return;
 
    try {
      setProgressLoading(true);
 
      const progressRef = collection(db, "users", uid, "topicProgress");
      const progressSnap = await getDocs(progressRef);
 
      const loadedProgress = {};
 
      progressSnap.forEach((progressDoc) => {
        loadedProgress[progressDoc.id] = progressDoc.data();
      });
 
      setTopicProgress(loadedProgress);
    } catch (error) {
      console.error("Progress load error:", error);
    } finally {
      setProgressLoading(false);
    }
  };
 
  const updateTopicStatus = async (subject, chapterTitle, topicTitle, status) => {
    if (!user) {
      setError("Please login to save progress.");
      return;
    }
 
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
 
    const progressData = {
      subject,
      chapterTitle,
      topicTitle,
      status,
      classLevel,
      board,
      updatedAt: serverTimestamp(),
    };
 
    setTopicProgress((prev) => ({
      ...prev,
      [topicId]: {
        ...progressData,
        updatedAt: new Date().toISOString(),
      },
    }));
 
    try {
      await setDoc(
        doc(db, "users", user.uid, "topicProgress", topicId),
        progressData,
        { merge: true }
      );
    } catch (error) {
      console.error("Progress save error:", error);
    }
  };
 
  const markTypingComplete = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, typing: false } : msg
      )
    );
  };
 
  const clearConversation = () => {
    stopAudio();
    setMessages([]);
    setHistory([]);
    setError("");
    pendingVoiceDataRef.current = null;
  };
 
  const getRevisionStatus = (subject, chapterTitle, topicTitle) => {
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
    return revisionProgress[topicId]?.revised || false;
  };
 
  const loadRevisionProgress = async (uid) => {
    if (!uid) return;
 
    try {
      const revisionRef = collection(db, "users", uid, "revisionProgress");
      const revisionSnap = await getDocs(revisionRef);
 
      const loadedRevision = {};
 
      revisionSnap.forEach((revisionDoc) => {
        loadedRevision[revisionDoc.id] = revisionDoc.data();
      });
 
      setRevisionProgress(loadedRevision);
    } catch (error) {
      console.error("Revision progress load error:", error);
    }
  };
 
  const updateRevisionStatus = async (subject, chapterTitle, topicTitle) => {
    if (!user) return;
 
    const topicId = getTopicId(subject, chapterTitle, topicTitle);
 
    const revisionData = {
      subject,
      chapterTitle,
      topicTitle,
      revised: true,
      classLevel,
      board,
      updatedAt: serverTimestamp(),
    };
 
    setRevisionProgress((prev) => ({
      ...prev,
      [topicId]: {
        ...revisionData,
        updatedAt: new Date().toISOString(),
      },
    }));
 
    try {
      await setDoc(
        doc(db, "users", user.uid, "revisionProgress", topicId),
        revisionData,
        { merge: true }
      );
    } catch (error) {
      console.error("Revision save error:", error);
    }
  };
 
 
  const getTestId = (type, subject, chapterTitle, topicTitle = "") => {
    const rawId =
      type === "topic"
        ? `topic_${classLevel}_${board}_${subject}_${chapterTitle}_${topicTitle}`
        : `chapter_${classLevel}_${board}_${subject}_${chapterTitle}`;
 
    return rawId
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };
 
  const getSavedTestResult = (type, subject, chapterTitle, topicTitle = "") => {
    const testId = getTestId(type, subject, chapterTitle, topicTitle);
    return testResults[testId] || null;
  };
 
  const loadTestResults = async (uid) => {
    if (!uid) return;
 
    try {
      const testRef = collection(db, "users", uid, "testResults");
      const testSnap = await getDocs(testRef);
 
      const loadedTests = {};
 
      testSnap.forEach((testDoc) => {
        loadedTests[testDoc.id] = testDoc.data();
      });
 
      setTestResults(loadedTests);
    } catch (error) {
      console.error("Test results load error:", error);
    }
  };
 
  const saveTestResult = async (resultData) => {
    if (!user || !resultData?.testId) return;
 
    setTestResults((prev) => ({
      ...prev,
      [resultData.testId]: {
        ...resultData,
        updatedAt: new Date().toISOString(),
      },
    }));
 
    try {
      await setDoc(
        doc(db, "users", user.uid, "testResults", resultData.testId),
        {
          ...resultData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Test result save error:", error);
    }
  };
 
  const startTest = async ({
    type,
    subject,
    chapterTitle,
    topicTitle = "",
    topics = [],
    questionCount,
  }) => {
    if (!user) {
      setError("Please login to start a test.");
      return;
    }
 
    setError("");
    setTestLoading(true);
    setSelectedAnswers({});
    setSubmittedTestResult(null);
    setCurrentTest(null);
    setActiveTab("test");
 
    const testId = getTestId(type, subject, chapterTitle, topicTitle);
 
    const formData = new FormData();
    formData.append("test_type", type);
    formData.append("subject", subject);
    formData.append("chapter_title", chapterTitle);
    formData.append("topic_title", topicTitle || "");
    formData.append("topics", JSON.stringify(topics || []));
    formData.append("question_count", String(questionCount));
    formData.append("class_level", classLevel);
    formData.append("board", board);
    formData.append("answer_language", answerLanguage);
 
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        body: formData,
      });
 
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not generate test.");
      }
 
      const data = await res.json();
      const questions = Array.isArray(data.questions) ? data.questions : [];
 
      if (!questions.length) {
        throw new Error("No questions generated. Please try again.");
      }
 
      setCurrentTest({
        testId,
        type,
        subject,
        chapterTitle,
        topicTitle,
        questionCount,
        questions,
      });
    } catch (error) {
      console.error("Test generation error:", error);
      setError(error.message || "Could not generate test.");
      setActiveTab("syllabus");
    } finally {
      setTestLoading(false);
    }
  };
 
  const handleTopicTest = (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic) return;
 
    startTest({
      type: "topic",
      subject: selectedSubject,
      chapterTitle: currentChapter.title,
      topicTitle: subtopic,
      topics: [subtopic],
      questionCount: 10,
    });
  };
 
  const handleChapterTest = () => {
    if (!selectedSubject || !currentChapter) return;
 
    startTest({
      type: "chapter",
      subject: selectedSubject,
      chapterTitle: currentChapter.title,
      topicTitle: "",
      topics: currentChapter.subtopics || [],
      questionCount: 20,
    });
  };
 
  const submitCurrentTest = async () => {
    if (!currentTest?.questions?.length) return;
 
    const total = currentTest.questions.length;
    let score = 0;
 
    currentTest.questions.forEach((question, index) => {
      if (Number(selectedAnswers[index]) === Number(question.answerIndex)) {
        score += 1;
      }
    });
 
    const resultData = {
      testId: currentTest.testId,
      type: currentTest.type,
      subject: currentTest.subject,
      chapterTitle: currentTest.chapterTitle,
      topicTitle: currentTest.topicTitle || "",
      score,
      total,
      percentage: Math.round((score / total) * 100),
      classLevel,
      board,
    };
 
    setSubmittedTestResult(resultData);
    await saveTestResult(resultData);
  };
 
  const resetTestView = () => {
    setCurrentTest(null);
    setSelectedAnswers({});
    setSubmittedTestResult(null);
    setActiveTab("syllabus");
  };
 
  const handleReviseTopic = async (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic) return;
 
    // Revision is tracked separately and does not affect completion percentage.
    await updateRevisionStatus(
      selectedSubject,
      currentChapter.title,
      subtopic
    );
 
    const prompt = `REVISION_TOPIC_MODE
 
Topic: ${subtopic}
Chapter: ${currentChapter.title}
Subject: ${selectedSubject}
Class: ${classLevel}
Board: ${board}
 
Create short and crisp revision notes for this topic.
 
Revision format:
1. Quick Meaning
2. Key Points
3. Important Terms
4. Must Remember
5. Quick Flowchart
6. Exam Points
 
Rules:
- Keep it short and crisp.
- Use mostly bullet points.
- Do not write long paragraphs.
- Use clear headings, but do not write the word "Heading".
- Keep headings simple like "Quick Meaning" or "Key Points".
- Use a simple text flowchart or diagram if possible.
- Definitions and most important facts can be bold, but only headings should be highlighted in blue by the frontend.
- Follow the selected answer language.`;
 
    pendingVoiceDataRef.current = null;
    setTextInput(prompt);
    setActiveTab("chat");
  };
 
  const handleStudyTopic = async (subtopic) => {
    if (!selectedSubject || !currentChapter || !subtopic) return;
 
    // When student clicks Study Topic, the topic is considered completed.
    // Chapter and subject status are calculated automatically from completed topics.
    await updateTopicStatus(
      selectedSubject,
      currentChapter.title,
      subtopic,
      "Completed"
    );
 
    const prompt = `STUDY_TOPIC_MODE
 
Topic: ${subtopic}
Chapter: ${currentChapter.title}
Subject: ${selectedSubject}
Class: ${classLevel}
Board: ${board}
 
Explain this topic in detail for a school student.
 
Answer format:
1. Meaning of the topic
2. Why it is important
3. Step-by-step explanation
4. Important keywords with simple meanings
5. One simple real-life example
6. Quick revision summary
 
Rules:
- Give a large answer, not 4-5 lines.
- Use headings and bullet points.
- Do not write one long paragraph.
- Keep the language easy for Class ${classLevel}.
- Follow the selected answer language.`;
 
    pendingVoiceDataRef.current = null;
    setTextInput(prompt);
    setActiveTab("chat");
  };
 
  const cancelProcessing = () => {
    cancelledRef.current = true;
 
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
    ...prev.map((msg) =>
    msg.role === "assistant" ? { ...msg, typing: false } : msg
    ),
    { id: crypto.randomUUID(), role: "user", text: question, isVoice: false },
    ]);
 
    const formData = new FormData();
    formData.append("question", question);
    formData.append("history", JSON.stringify(history));
    formData.append("class_level", classLevel);
    formData.append("board", board);
    formData.append("answer_language", answerLanguage);
 
    try {
      const res = await fetch("/api/ask-text", {
        method: "POST",
        body: formData,
      });
 
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
 
      const data = await res.json();
 
      setMessages((prev) => [
        ...prev.map((msg) =>
        msg.role === "assistant" ? { ...msg, typing: false } : msg
        ),
        {
          id: assistantId,
          role: "assistant",
          text: data.answer,
          audioUrl: null,
          typing: true,
        },
      ]);
      updateHistory(question, data.answer);
      setIsLoading(false);
 
      const ttsFormData = new FormData();
      ttsFormData.append("text", data.answer);
      ttsFormData.append("language", data.language || "en");
 
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          body: ttsFormData,
        });
 
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
 
  // ── Voice: stop recording, transcribe, then show text in input box ─
  const stopRecordingAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;
 
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const stream = mediaRecorderRef.current?.stream;
 
      if (stream) stream.getTracks().forEach((t) => t.stop());
 
      setIsRecording(false);
      setIsTranscribing(true);
      cancelledRef.current = false;
      abortControllerRef.current = new AbortController();
 
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("history", JSON.stringify(history));
 
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });
 
        if (cancelledRef.current) return;
 
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Server error");
        }
 
        const data = await res.json();
 
        setIsTranscribing(false);
        setTextInput(data.question);
        pendingVoiceDataRef.current = data;
      } catch (e) {
        if (e.name === "AbortError" || cancelledRef.current) {
          setIsTranscribing(false);
          return;
        }
 
        setIsTranscribing(false);
        setError(e.message);
      }
    };
 
    mediaRecorderRef.current.stop();
  };
 
  // ── Send button: voice pending data or normal text ─
  const handleSend = async () => {
    if (!textInput.trim() || isLoading) return;
 
    if (pendingVoiceDataRef.current) {
      const data = pendingVoiceDataRef.current;
      const question = textInput.trim();
      pendingVoiceDataRef.current = null;
 
      setTextInput("");
      setError("");
 
      const assistantId = crypto.randomUUID();
 
      setMessages((prev) => [
        ...prev.map((msg) =>
        msg.role === "assistant" ? { ...msg, typing: false } : msg
      ),
      { id: crypto.randomUUID(), role: "user", text: question, isVoice: true },
      {
        id: assistantId,
        role: "assistant",
        text: data.answer,
        audioUrl: data.audio_url,
        typing: false,
      },
    ]);
 
      updateHistory(question, data.answer);
 
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
 
    await handleTextSend();
  };
 
  const startRecording = async () => {
    setError("");
    stopAudio();
    pendingVoiceDataRef.current = null;
    setTextInput("");
 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
 
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
 
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
 
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  };
 
    // ── Auth loading screen ────────────────────────────────
  if (authLoading) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          background: "#f3f4f6",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#374151",
        }}
      >
        Loading...
      </div>
    );
  }
 
  // ── Login / Create Account screen ──────────────────────
  if (!user) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          background: "#f3f4f6",
          minHeight: "100vh",
        }}
      >
        <nav
          style={{
            background: "#1a56db",
            padding: "14px 24px",
          }}
        >
          <span style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>
            🎓 Student Voice Assistant
          </span>
        </nav>
 
        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "40px 16px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              padding: "28px 24px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>👋</div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "6px",
                }}
              >
                {authMode === "login" ? "Login" : "Create Account"}
              </h1>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                {authMode === "login"
                  ? "Login to continue learning."
                  : "Create your student profile."}
              </p>
            </div>
 
            {authError && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "13px",
                }}
              >
                ⚠️ {authError}
              </div>
            )}
 
            {authMode === "signup" && (
              <>
                <label style={labelStyle}>Name</label>
                <input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your name"
                  style={inputStyle}
                />
 
                <label style={labelStyle}>Mobile Number</label>
                <input
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  style={inputStyle}
                />
              </>
            )}
 
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={authMode === "login" ? loginEmail : signupEmail}
              onChange={(e) =>
                authMode === "login"
                  ? setLoginEmail(e.target.value)
                  : setSignupEmail(e.target.value)
              }
              placeholder="Enter email"
              style={inputStyle}
            />
 
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={authMode === "login" ? loginPassword : signupPassword}
              onChange={(e) =>
                authMode === "login"
                  ? setLoginPassword(e.target.value)
                  : setSignupPassword(e.target.value)
              }
              placeholder="Enter password"
              style={inputStyle}
            />
 
            {authMode === "signup" && (
              <>
                <label style={labelStyle}>Class</label>
                <select
                  value={signupClassLevel}
                  onChange={(e) => setSignupClassLevel(e.target.value)}
                  style={inputStyle}
                >
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
 
                <label style={labelStyle}>Board</label>
                <select
                  value={signupBoard}
                  onChange={(e) => setSignupBoard(e.target.value)}
                  style={inputStyle}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="RBSE">RBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="Other">Other</option>
                </select>
              </>
            )}
 
            <button
              onClick={authMode === "login" ? handleLogin : handleCreateAccount}
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#1a56db",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                marginTop: "8px",
                opacity: authLoading ? 0.6 : 1,
              }}
            >
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
 
            <button
              onClick={() => {
                setAuthError("");
                setAuthMode(authMode === "login" ? "signup" : "login");
              }}
              style={{
                width: "100%",
                marginTop: "14px",
                background: "transparent",
                border: "none",
                color: "#1a56db",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {authMode === "login"
                ? "New student? Create account"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  // ── Language selection screen after login ───────────────
  if (!profileCompleted) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          background: "#f3f4f6",
          minHeight: "100vh",
        }}
      >
        <nav
          style={{
            background: "#1a56db",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>
            🎓 Student Voice Assistant
          </span>
 
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#fff",
              color: "#1a56db",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </nav>
 
        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "56px 16px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              padding: "30px 26px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "42px", marginBottom: "10px" }}>🎓</div>
 
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Welcome, {userProfile?.name || "Student"}
              </h1>
 
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                Class {classLevel} · {board}
              </p>
            </div>
 
            <label style={labelStyle}>Choose answer language</label>
            <select
              value={answerLanguage}
              onChange={(e) => setAnswerLanguage(e.target.value)}
              style={inputStyle}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="hinglish">Hinglish</option>
            </select>
 
            <button
              onClick={() => setProfileCompleted(true)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#1a56db",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                marginTop: "16px",
              }}
            >
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#1a56db",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>
          🎓 Student Voice Assistant
        </span>
 
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
  <span style={{ color: "#fff", fontSize: "13px" }}>
    {userProfile?.name || user?.email}
  </span>
 
  <button
    onClick={handleLogout}
    style={{
      padding: "7px 16px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 500,
      border: "none",
      background: "#fff",
      color: "#1a56db",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
</div>
      </nav>
 
      {/* Main */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 500,
              color: "#111827",
              marginBottom: "6px",
            }}
          >
            Welcome, Student 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Ask anything in Hindi, English, or Hinglish — Class {classLevel} ·{" "}
            {board}
          </p>
        </div>
 
        {/* App Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            background: "#e5e7eb",
            padding: "5px",
            borderRadius: "12px",
          }}
        >
          <button
            onClick={() => setActiveTab("chat")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              background: activeTab === "chat" ? "#1a56db" : "transparent",
              color: activeTab === "chat" ? "#fff" : "#374151",
            }}
          >
            💬 Chatbot
          </button>
 
          <button
            onClick={() => setActiveTab("syllabus")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              background: activeTab === "syllabus" ? "#1a56db" : "transparent",
              color: activeTab === "syllabus" ? "#fff" : "#374151",
            }}
          >
            📚 Syllabus Tracker
          </button>
 
          <button
            onClick={() => currentTest && setActiveTab("test")}
            disabled={!currentTest && !testLoading}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "9px",
              border: "none",
              cursor: currentTest || testLoading ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: 500,
              background: activeTab === "test" ? "#1a56db" : "transparent",
              color: activeTab === "test" ? "#fff" : "#374151",
              opacity: currentTest || testLoading ? 1 : 0.45,
            }}
          >
            📝 Test
          </button>
        </div>
 
        {/* Test Section */}
        {activeTab === "test" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            {testLoading ? (
              <div style={{ textAlign: "center", padding: "40px 12px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📝</div>
                <h2 style={{ fontSize: "20px", color: "#111827", marginBottom: "6px" }}>
                  Generating your test...
                </h2>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  Please wait while AI creates class-appropriate MCQs.
                </p>
              </div>
            ) : currentTest ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                      {currentTest.type === "topic" ? "Topic Test" : "Chapter Test"}
                    </div>
                    <h2
                      style={{
                        fontSize: "21px",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "4px",
                      }}
                    >
                      {currentTest.type === "topic"
                        ? currentTest.topicTitle
                        : currentTest.chapterTitle}
                    </h2>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                      {currentTest.subject} · {currentTest.questions.length} MCQs
                    </p>
                  </div>
 
                  <button
                    onClick={resetTestView}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Back to Syllabus
                  </button>
                </div>
 
                {submittedTestResult && (
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "4px",
                          }}
                        >
                          Test Completed ✅
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          Your score has been saved.
                        </div>
                      </div>
 
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 800,
                          color: "#16a34a",
                        }}
                      >
                        {submittedTestResult.score}/{submittedTestResult.total}
                      </div>
                    </div>
                  </div>
                )}
 
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {currentTest.questions.map((question, questionIndex) => {
                    const selected = selectedAnswers[questionIndex];
                    const isSubmitted = Boolean(submittedTestResult);
 
                    return (
                      <div
                        key={questionIndex}
                        style={{
                          padding: "14px",
                          borderRadius: "14px",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "10px",
                          }}
                        >
                          Q{questionIndex + 1}. {question.question}
                        </div>
 
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(question.options || []).map((option, optionIndex) => {
                            const isCorrect = optionIndex === question.answerIndex;
                            const isSelected = Number(selected) === optionIndex;
 
                            return (
                              <label
                                key={optionIndex}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "10px",
                                  border:
                                    isSubmitted && isCorrect
                                      ? "1px solid #86efac"
                                      : isSubmitted && isSelected && !isCorrect
                                      ? "1px solid #fca5a5"
                                      : "1px solid #e5e7eb",
                                  background:
                                    isSubmitted && isCorrect
                                      ? "#f0fdf4"
                                      : isSubmitted && isSelected && !isCorrect
                                      ? "#fef2f2"
                                      : "#fff",
                                  cursor: isSubmitted ? "default" : "pointer",
                                  fontSize: "13px",
                                  color: "#111827",
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={Number(selected) === optionIndex}
                                  disabled={isSubmitted}
                                  onChange={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [questionIndex]: optionIndex,
                                    }))
                                  }
                                />
                                <span>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </span>
                              </label>
                            );
                          })}
                        </div>
 
                        {isSubmitted && question.explanation && (
                          <div
                            style={{
                              marginTop: "9px",
                              fontSize: "12px",
                              color: "#6b7280",
                              lineHeight: "1.5",
                            }}
                          >
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
 
                {!submittedTestResult && (
                  <button
                    onClick={submitCurrentTest}
                    disabled={
                      Object.keys(selectedAnswers).length !== currentTest.questions.length
                    }
                    style={{
                      width: "100%",
                      marginTop: "18px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#1a56db",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor:
                        Object.keys(selectedAnswers).length === currentTest.questions.length
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        Object.keys(selectedAnswers).length === currentTest.questions.length
                          ? 1
                          : 0.45,
                    }}
                  >
                    Submit Test
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 12px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📝</div>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Start a test from the Syllabus Tracker.
                </p>
              </div>
            )}
          </div>
        )}
 
        {/* Chatbot Section */}
        {activeTab === "chat" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#111827",
                  }}
                >
                  AI Tutor
                </span>
              </div>
 
              {history.length > 0 && (
                <button
                  onClick={clearConversation}
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  🗑 Clear chat
                </button>
              )}
            </div>
 
            {/* Messages */}
            <div
              style={{
                height: "380px",
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "#9ca3af" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
                  <p style={{ fontSize: "13px" }}>
                    Press the mic or type to start asking
                  </p>
                </div>
              ) : (
                messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-end",
                        flexDirection: "row-reverse",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 500,
                          flexShrink: 0,
                          background: "#f0fdf4",
                          color: "#16a34a",
                        }}
                      >
                        You
                      </div>
 
                      <div
                        style={{
                          maxWidth: "78%",
                          padding: "10px 14px",
                          borderRadius: "16px",
                          borderBottomRightRadius: "4px",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          background: "#1a56db",
                          color: "#fff",
                        }}
                      >
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
                      onTypingComplete={markTypingComplete}
                    />
                  )
                )
              )}
 
              {isLoading && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#1a56db",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    AI
                  </div>
 
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#f3f4f6",
                      borderRadius: "16px",
                      borderBottomLeftRadius: "4px",
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 0.2, 0.4].map((delay) => (
                      <div
                        key={delay}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#9ca3af",
                          animation: `bounce 1.2s ${delay}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
 
              <div ref={chatEndRef} />
            </div>
 
            {/* Error */}
            {error && (
              <div
                style={{
                  margin: "0 16px 12px",
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#dc2626",
                }}
              >
                ⚠️ {error}
              </div>
            )}
 
            {/* Transcribing status with cancel button */}
            {isTranscribing && (
              <div
                style={{
                  margin: "0 16px 12px",
                  padding: "10px 14px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#1a56db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#1a56db",
                      animation: "pulse 1s infinite",
                    }}
                  />
                  Processing your voice...
                </div>
 
                <button
                  onClick={cancelProcessing}
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: "1px solid #bfdbfe",
                    background: "#fff",
                    color: "#1a56db",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            )}
 
            {/* Recording bar */}
            {isRecording && (
              <div
                style={{
                  margin: "0 16px 12px",
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#dc2626",
                    animation: "pulse 1s infinite",
                  }}
                />
                Recording... press mic again to stop
              </div>
            )}
 
            {/* Transcribed text hint */}
            {!isRecording &&
              !isTranscribing &&
              pendingVoiceDataRef.current &&
              textInput && (
                <div
                  style={{
                    margin: "0 16px 8px",
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "0 4px",
                  }}
                >
                  ✏️ Review or edit your question, then press Send
                </div>
              )}
 
            {/* Input area */}
            <div
              style={{
                padding: "14px 16px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder={
                  isTranscribing
                    ? "Transcribing your voice..."
                    : "Type your question here..."
                }
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
 
                  if (pendingVoiceDataRef.current) {
                    pendingVoiceDataRef.current = null;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                disabled={isLoading || isRecording || isTranscribing}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "24px",
                  fontSize: "14px",
                  color: "#111827",
                  background: isTranscribing ? "#f3f4f6" : "#f9fafb",
                  outline: "none",
                }}
              />
 
              <button
                onClick={handleSend}
                disabled={
                  isLoading ||
                  isRecording ||
                  isTranscribing ||
                  !textInput.trim()
                }
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#1a56db",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity:
                    isLoading ||
                    isRecording ||
                    isTranscribing ||
                    !textInput.trim()
                      ? 0.4
                      : 1,
                }}
                title="Send"
              >
                ➤
              </button>
 
              <button
                onClick={
                  isRecording ? stopRecordingAndTranscribe : startRecording
                }
                disabled={isLoading || isTranscribing}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isRecording ? "#dc2626" : "#f0fdf4",
                  color: isRecording ? "#fff" : "#16a34a",
                  opacity: isLoading || isTranscribing ? 0.4 : 1,
                }}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                🎤
              </button>
            </div>
 
            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#9ca3af",
                padding: "8px 16px",
                borderTop: "1px solid #f3f4f6",
              }}
            >
              Supports Hindi · English · Hinglish · and more Indian languages
            </div>
          </div>
        )}
 
        {/* Syllabus Tracker Section */}
        {activeTab === "syllabus" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>📚</div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "6px",
                }}
              >
                Syllabus Tracker
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Class {classLevel} · {board} · Track topics, chapters, and subjects
              </p>
 
              {(() => {
                const overallProgress = getOverallProgress();
 
                return (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "14px",
                      borderRadius: "14px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        Overall Progress
                      </span>
 
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1a56db",
                        }}
                      >
                        {overallProgress.percent}%
                      </span>
                    </div>
 
                    {progressBar(overallProgress.percent)}
 
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "7px",
                      }}
                    >
                      {overallProgress.completed}/{overallProgress.total} topics completed
                      {progressLoading ? " · Syncing..." : ""}
                    </div>
                  </div>
                );
              })()}
            </div>
 
            {!selectedSubject && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                }}
              >
                {Object.keys(currentSyllabus).map((subject) => {
                  const subjectIcon =
                    subject === "Science"
                      ? "🔬"
                      : subject === "Maths"
                      ? "➗"
                      : subject === "English"
                      ? "📘"
                      : "🌍";
 
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSelectedChapter(null);
                      }}
                      style={{
                        padding: "22px 14px",
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "34px", marginBottom: "10px" }}>
                        {subjectIcon}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#111827",
                          marginBottom: "5px",
                        }}
                      >
                        {subject}
                      </div>
                      {(() => {
                        const subjectProgress = getSubjectProgress(subject);
 
                        return (
                          <>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                              {subjectProgress.percent}% completed
                            </div>
 
                            <div
                              style={{
                                fontSize: "11px",
                                color: getStatusColor(subjectProgress.status),
                                fontWeight: 700,
                                marginBottom: "8px",
                              }}
                            >
                              {subjectProgress.status}
                            </div>
 
                            {progressBar(subjectProgress.percent)}
 
                            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "7px" }}>
                              {subjectProgress.completed}/{subjectProgress.total} topics ·{" "}
                              {currentSyllabus[subject].length} chapters
                            </div>
                          </>
                        );
                      })()}
                    </button>
                  );
                })}
              </div>
            )}
 
            {selectedSubject && !selectedChapter && (
              <div>
                <button
                  onClick={() => {
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                  }}
                  style={{
                    marginBottom: "14px",
                    border: "none",
                    background: "transparent",
                    color: "#1a56db",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Subjects
                </button>
 
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  {selectedSubject} Chapters
                </h3>
 
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentChapters.map((chapter, index) => (
                    <button
                      key={chapter.title}
                      onClick={() => setSelectedChapter(chapter)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "13px 14px",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "#eff6ff",
                          color: "#1a56db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>
 
                      <span style={{ flex: 1 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          {chapter.title}
                        </span>
                        {(() => {
                          const chapterProgress = getChapterProgress(selectedSubject, chapter);
 
                          return (
                            <>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                  marginBottom: "6px",
                                }}
                              >
                                {chapterProgress.percent}% completed ·{" "}
                                {chapterProgress.completed}/{chapterProgress.total} topics
                              </span>
 
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: "11px",
                                  color: getStatusColor(chapterProgress.status),
                                  fontWeight: 700,
                                  marginBottom: "6px",
                                }}
                              >
                                {chapterProgress.status}
                              </span>
 
                              {progressBar(chapterProgress.percent)}
                            </>
                          );
                        })()}
                      </span>
 
                      <span style={{ color: "#9ca3af" }}>›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {selectedSubject && selectedChapter && (
              <div>
                <button
                  onClick={() => setSelectedChapter(null)}
                  style={{
                    marginBottom: "14px",
                    border: "none",
                    background: "transparent",
                    color: "#1a56db",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Chapters
                </button>
 
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedSubject}
                  </div>
 
                  <h3
                    style={{
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    {currentChapter.title}
                  </h3>
 
                  {(() => {
                    const chapterProgress = getChapterProgress(selectedSubject, currentChapter);
 
                    return (
                      <div
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            Chapter Progress
                          </span>
 
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#1a56db",
                            }}
                          >
                            {chapterProgress.percent}%
                          </span>
                        </div>
 
                        {progressBar(chapterProgress.percent)}
 
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "7px",
                          }}
                        >
                          {chapterProgress.completed}/{chapterProgress.total} topics completed
                        </div>
 
                        <div
                          style={{
                            fontSize: "12px",
                            color: getStatusColor(chapterProgress.status),
                            fontWeight: 700,
                            marginTop: "4px",
                          }}
                        >
                          {chapterProgress.status}
                        </div>
 
                        {(() => {
                          const savedChapterTest = getSavedTestResult(
                            "chapter",
                            selectedSubject,
                            currentChapter.title
                          );
 
                          return (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                marginTop: "12px",
                              }}
                            >
                              <button
                                onClick={handleChapterTest}
                                style={{
                                  padding: "8px 12px",
                                  border: "none",
                                  borderRadius: "9px",
                                  background: "#1a56db",
                                  color: "#fff",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: 700,
                                }}
                              >
                                Chapter Test - 20 MCQs
                              </button>
 
                              {savedChapterTest && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#16a34a",
                                    fontWeight: 700,
                                  }}
                                >
                                  Last Score: {savedChapterTest.score}/{savedChapterTest.total}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
 
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {currentChapter.subtopics.map((subtopic, index) => {
                      const currentStatus = getTopicStatus(
                        selectedSubject,
                        currentChapter.title,
                        subtopic
                      );
                      const topicCompleted = isCompletedStatus(currentStatus);
 
                      return (
                      <div
                        key={subtopic}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          background: "#fff",
                          border: topicCompleted ? "1px solid #86efac" : "1px solid #e5e7eb",
                        }}
                      >
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: topicCompleted ? "#dcfce7" : "#eff6ff",
                            color: topicCompleted ? "#16a34a" : "#1a56db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {topicCompleted ? "✓" : index + 1}
                        </span>
 
                        <span
                          style={{
                            flex: 1,
                            fontSize: "14px",
                            color: "#111827",
                            lineHeight: "1.4",
                          }}
                        >
                          {subtopic}
                        </span>
 
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            updateTopicStatus(
                              selectedSubject,
                              currentChapter.title,
                              subtopic,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "6px 8px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            color: "#374151",
                            fontSize: "12px",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
 
                        {(() => {
                          const savedTopicTest = getSavedTestResult(
                            "topic",
                            selectedSubject,
                            currentChapter.title,
                            subtopic
                          );
 
                          return (
                            <>
                              {savedTopicTest && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#16a34a",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Test: {savedTopicTest.score}/{savedTopicTest.total}
                                </span>
                              )}
 
                              <button
                                onClick={() => handleTopicTest(subtopic)}
                                style={{
                                  padding: "6px 10px",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: "8px",
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                  fontWeight: 600,
                                }}
                              >
                                Test
                              </button>
                            </>
                          );
                        })()}
 
                        <button
                          onClick={() => handleReviseTopic(subtopic)}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            background: getRevisionStatus(
                              selectedSubject,
                              currentChapter.title,
                              subtopic
                            )
                              ? "#eff6ff"
                              : "#fff",
                            color: "#1a56db",
                            fontSize: "12px",
                            cursor: "pointer",
                            flexShrink: 0,
                            fontWeight: 600,
                          }}
                        >
                          {getRevisionStatus(
                            selectedSubject,
                            currentChapter.title,
                            subtopic
                          )
                            ? "Revised"
                            : "Revise"}
                        </button>
 
                        <button
                          onClick={() => handleStudyTopic(subtopic)}
                          style={{
                            padding: "6px 10px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#1a56db",
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          Study Topic
                        </button>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
