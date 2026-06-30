// Curriculum Explorer Syllabus Data (Classes 5-10 AI & Math/Science outcomes)
const SYLLABUS_DATA = {
  "5": {
    badge: "CLASSES 5-6 | AGE 10-12 | AI ORIGINS",
    tagline: "\"Explore the digital sandbox where coding starts.\"",
    outcomes: "Develop computational thinking, block coding concepts, and understand AI limitations.",
    timeline: [
      {
        term: "Term 1: Algorithms & Scratch Demos",
        content: "Introduction to logical thinking. Students learn sorting, search, and sequential actions through block-based coding in Scratch.",
        activity: "Algorithm relay game with cards & Scratch custom animation."
      },
      {
        term: "Term 2: Supervised vs. Unsupervised Learning",
        content: "Discover how AI learns patterns. Visual classifier training in browser without math formulas.",
        activity: "Train Google Teachable Machine model on 3 hand gestures."
      }
    ]
  },
  "6": {
    badge: "CLASSES 5-6 | AGE 10-12 | AI ORIGINS",
    tagline: "\"Explore the digital sandbox where coding starts.\"",
    outcomes: "Develop computational thinking, block coding concepts, and understand AI limitations.",
    timeline: [
      {
        term: "Term 1: Logic & Conditionals",
        content: "Deep dive into binary logic and flowcharts. Program basic math solvers and interactive games.",
        activity: "Build an interactive maze game in Scratch."
      },
      {
        term: "Term 2: Bias in AI & Data Labels",
        content: "Understand why AI makes mistakes. Identify sources of AI bias in everyday Indian case studies.",
        activity: "Design a clean training dataset with 50 labeled images."
      }
    ]
  },
  "7": {
    badge: "CLASSES 7-8 | AGE 12-14 | AI WORKS",
    tagline: "\"Translate logic into code, laying the foundations of Python.\"",
    outcomes: "Write basic Python scripts, create data visualizations, and build basic machine learning algorithms.",
    timeline: [
      {
        term: "Term 1: Introduction to Python & Colab",
        content: "Syntax, variables, inputs, and conditional branches. Learn to run code in Google Colab environment.",
        activity: "Python mark checker script predicting pass/fail."
      },
      {
        term: "Term 2: Data Visualisation & Tables",
        content: "Analyze data sets using Python (Matplotlib). Create bar charts and line graphs from real-world datasets.",
        activity: "Clean a messy census dataset and plot findings."
      }
    ]
  },
  "8": {
    badge: "CLASSES 7-8 | AGE 12-14 | AI LEARNS",
    tagline: "\"Data is the fuel, and Python is the engine.\"",
    outcomes: "Apply linear regression concepts, train simple decision trees, and understand AI usage in Indian industries.",
    timeline: [
      {
        term: "Term 1: Data Wrangling & Linear Trends",
        content: "Study data cleaning and interpolation. Plot trends and understand linear relationships without complex equations.",
        activity: "Predict crop yields using historical rain datasets."
      },
      {
        term: "Term 2: Classification Trees & Scikit-learn",
        content: "Sort data points into categories. Implement simple ML decision trees using Python.",
        activity: "Build a \"Which career fits me?\" recommendation program."
      }
    ]
  },
  "9": {
    badge: "CLASSES 9 | AGE 14-15 | AI BUILDS",
    tagline: "\"Move from using AI to shaping it, ethically and powerfully.\"",
    outcomes: "Understand NLP chatbot architectures, deploy intent classifiers, and evaluate AI ethics regulations.",
    timeline: [
      {
        term: "Term 1: Natural Language Processing & Dialogflow",
        content: "Sentiment analysis, intent detection, and entity extraction. Create school helpdesk support bots.",
        activity: "Build and deploy a functional School FAQ chatbot."
      },
      {
        term: "Term 2: Generative AI & Digital Ethics",
        content: "Examine deepfakes, legal frameworks (DPDP Bill, IT Act), and fairness principles in algorithmic pipelines.",
        activity: "Debate case studies at a mock AI Ethics Tribunal."
      }
    ]
  },
  "10": {
    badge: "CLASSES 10 | AGE 15-16 | AI FUTURE",
    tagline: "\"AI-ready for board exams, competitive tests, and the careers of tomorrow.\"",
    outcomes: "Explain neural network architecture conceptually, write advanced prompts, and complete a capstone project.",
    timeline: [
      {
        term: "Term 1: Neural Networks & Computer Vision",
        content: "Perceptrons, hidden layers, activation functions, and Convolutional Neural Networks (CNN) conceptually.",
        activity: "TensorFlow Playground simulation visualising network training."
      },
      {
        term: "Term 2: Capstone Project & Portfolio",
        content: "Design and implement an end-to-end AI project solving a real problem. Prepare GitHub portfolio.",
        activity: "Capstone showcase demoing custom model to review panel."
      }
    ]
  }
};

// Pathfinder Quiz Questions
const QUIZ_QUESTIONS = [
  {
    category: "ABOUT YOU",
    question: "Which grade are you in?",
    options: ["Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"],
    key: "grade"
  },
  {
    category: "ABOUT YOU",
    question: "What subject do you find most challenging?",
    options: ["Mathematics", "Science", "English", "AI & Tech", "All equally challenging"],
    key: "challenge"
  },
  {
    category: "YOUR LEARNING STYLE",
    question: "How do you prefer to learn something new?",
    options: ["Step-by-step with clear examples", "Through hands-on experiments", "By solving practice problems", "By watching video explanations"],
    key: "style"
  },
  {
    category: "YOUR LEARNING STYLE",
    question: "When you get stuck on a problem, what do you usually do?",
    options: ["Give up and move on", "Ask a friend or parent", "Try multiple ways until it works", "Wait for the teacher to explain it"],
    key: "stuck"
  },
  {
    category: "YOUR GOALS",
    question: "What is your biggest learning goal right now?",
    options: ["Score better in school exams", "Understand concepts deeply", "Prepare for competitive exams", "Build skills for the future"],
    key: "goal"
  },
  {
    category: "YOUR GOALS",
    question: "Are you interested in technology and AI?",
    options: ["Extremely interested", "Somewhat curious", "Not sure yet", "I prefer other subjects"],
    key: "ai_interest"
  },
  {
    category: "YOUR CONFIDENCE",
    question: "How would you rate your confidence in Math right now?",
    options: ["Unstoppable", "Fairly confident", "Neutral", "Struggling a bit"],
    key: "math_conf"
  },
  {
    category: "YOUR CONFIDENCE",
    question: "How often do you ask questions in class when you are confused?",
    options: ["Always - I ask right away", "Sometimes, if I am very stuck", "Rarely - I feel a bit shy", "Never - I figure it out later"],
    key: "asking_freq"
  },
  {
    category: "YOUR SCHEDULE",
    question: "How much time can you dedicate to learning daily outside school?",
    options: ["Less than 30 minutes", "30–60 minutes", "1–2 hours", "More than 2 hours"],
    key: "time_dedication"
  },
  {
    category: "YOUR AMBITIONS",
    question: "Where do you see yourself in 5 years?",
    options: ["Engineering or Medicine", "AI or Tech Specialist", "Business or Startup founder", "Arts & Creative field", "Still deciding!"],
    key: "future_path"
  }
];

// App State
let currentQuizIndex = 0;
let quizAnswers = {};
let selectedOption = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initCurriculumExplorer();
  initConfidenceSimulator();
  initQuiz();
  initCounterStats();
  initFaqAccordion();
  initModals();
  initHeroAnimation();
  initEyeTracking();
  initHeroFrameSequence();
});

// 1. Curriculum Explorer
function initCurriculumExplorer() {
  const pills = document.querySelectorAll(".grade-explorer-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderCurriculum(pill.dataset.grade);
    });
  });
  // Default load
  renderCurriculum("5");
}

function renderCurriculum(grade) {
  const data = SYLLABUS_DATA[grade];
  if (!data) return;

  document.getElementById("syllabus-badge").textContent = data.badge;
  document.getElementById("syllabus-title").textContent = `Grade ${grade} Syllabus`;
  document.getElementById("syllabus-tagline").textContent = data.tagline;
  document.getElementById("syllabus-outcomes").textContent = data.outcomes;

  const timelineContainer = document.getElementById("syllabus-timeline");
  timelineContainer.innerHTML = "";

  data.timeline.forEach((termData, index) => {
    const termRow = document.createElement("div");
    termRow.className = "syllabus-term-row";
    termRow.innerHTML = `
      <div class="term-number-badge">${index + 1}</div>
      <div class="term-details">
        <span class="term-title">${termData.term}</span>
        <span class="term-content">${termData.content}</span>
        <span class="term-activity">🎯 Key Activity: ${termData.activity}</span>
      </div>
    `;
    timelineContainer.appendChild(termRow);
  });
}

// 2. Confidence Score Simulator (Math, Science, and English)
function initConfidenceSimulator() {
  const mathSlider = document.getElementById("slider-math");
  const scienceSlider = document.getElementById("slider-science");
  const englishSlider = document.getElementById("slider-english");

  const updateSim = () => {
    const mathVal = parseInt(mathSlider.value);
    const scienceVal = parseInt(scienceSlider.value);
    const englishVal = parseInt(englishSlider.value);

    // Update Slider UI values
    document.getElementById("math-slider-val").textContent = `${mathVal}%`;
    document.getElementById("science-slider-val").textContent = `${scienceVal}%`;
    document.getElementById("english-slider-val").textContent = `${englishVal}%`;

    // Calculate Average Confidence Score
    const avgScore = Math.round((mathVal + scienceVal + englishVal) / 3);

    // Update Mockup Chart Circle Ring (circumference is ~377)
    // Stroke dashoffset: 377 is empty, 0 is full
    const offset = 377 - (377 * avgScore) / 100;
    const progressCircle = document.getElementById("dash-circle");
    progressCircle.style.strokeDashoffset = offset;
    document.getElementById("dash-score-text").textContent = `${avgScore}%`;

    // Update progress bars in Mockup
    document.getElementById("dash-bar-math").style.width = `${mathVal}%`;
    document.getElementById("dash-val-math").textContent = `${mathVal}%`;

    document.getElementById("dash-bar-science").style.width = `${scienceVal}%`;
    document.getElementById("dash-val-science").textContent = `${scienceVal}%`;

    document.getElementById("dash-bar-english").style.width = `${englishVal}%`;
    document.getElementById("dash-val-english").textContent = `${englishVal}%`;

    // Update Recommendation Card below based on scores
    const recTitle = document.getElementById("dash-rec-title");
    const recDesc = document.getElementById("dash-rec-desc");

    // Determine the lowest subject
    const minVal = Math.min(mathVal, scienceVal, englishVal);

    if (minVal === englishVal && englishVal < 75) {
      recTitle.textContent = "English grammar needs a boost.";
      recDesc.textContent = "Complete 2 practice sets today to improve your confidence score before the weekend.";
    } else if (minVal === mathVal && mathVal < 75) {
      recTitle.textContent = "Math concepts need a boost.";
      recDesc.textContent = "Complete the weekly equations practice set to raise your math score and recover your streak.";
    } else if (minVal === scienceVal && scienceVal < 75) {
      recTitle.textContent = "Science conceptual gaps detected.";
      recDesc.textContent = "Try the Electromagnetism simulator module to recover your points before batch tests.";
    } else {
      recTitle.textContent = "Superb learning confidence!";
      recDesc.textContent = "All core subjects look strong. You are ready to tackle advanced masterclass challenge projects!";
    }

    // Update simulator character expression dynamically based on confidence average
    const charMouth = document.getElementById("sim-character-mouth");
    const charLeftBrow = document.getElementById("sim-character-left-brow");
    const charRightBrow = document.getElementById("sim-character-right-brow");
    const thoughtBubble = document.getElementById("sim-thought-bubble");

    if (charMouth && charLeftBrow && charRightBrow) {
      if (avgScore < 40) {
        // Underconfident / Sad
        charMouth.setAttribute("d", "M 270,356 Q 300,330 330,356");
        charLeftBrow.setAttribute("d", "M 224,196 Q 260,190 290,176");
        charRightBrow.setAttribute("d", "M 326,176 Q 352,190 382,196");
        
        // Show question mark thought bubble
        if (thoughtBubble) {
          thoughtBubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#FD4463" stroke-width="2.5" stroke-linecap="round"><path d="M 9.09 9 a 3 3 0 0 1 5.83 1 c 0 2 -3 3 -3 3 M 12 17 h .01" /></svg>`;
          thoughtBubble.style.borderColor = "var(--pink-mid)";
        }
      } else if (avgScore < 75) {
        // Neutral / Thinking
        charMouth.setAttribute("d", "M 270,340 Q 300,332 330,340");
        charLeftBrow.setAttribute("d", "M 224,188 Q 260,170 290,190");
        charRightBrow.setAttribute("d", "M 326,172 Q 352,156 382,170");
        
        // Show thinking dots bubble
        if (thoughtBubble) {
          thoughtBubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#2C5688" stroke-width="3" stroke-linecap="round"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>`;
          thoughtBubble.style.borderColor = "var(--border)";
        }
      } else {
        // Confident / Happy
        charMouth.setAttribute("d", "M 270,330 Q 300,356 330,330");
        charLeftBrow.setAttribute("d", "M 224,176 Q 260,164 290,176");
        charRightBrow.setAttribute("d", "M 326,176 Q 352,164 382,176");
        
        // Show glowing lightbulb bubble
        if (thoughtBubble) {
          thoughtBubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#FD4463" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M15.09 14c.91-.9 1.91-2.2 1.91-4a5 5 0 0 0-10 0c0 1.8 1 3.1 1.91 4" /></svg>`;
          thoughtBubble.style.borderColor = "var(--pink)";
        }
      }
    }
  };

  mathSlider.addEventListener("input", updateSim);
  scienceSlider.addEventListener("input", updateSim);
  englishSlider.addEventListener("input", updateSim);

  // Initial update
  updateSim();
}

// 3. Pathfinder Quiz
function initQuiz() {
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quizContent = document.getElementById("quiz-content");
  const resultsCard = document.getElementById("quiz-results");
  
  quizContent.style.display = "block";
  resultsCard.style.display = "none";

  const question = QUIZ_QUESTIONS[currentQuizIndex];
  document.getElementById("quiz-cat").textContent = question.category;
  document.getElementById("quiz-step").textContent = `Question ${currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
  
  // Progress Bar
  const progressPercent = ((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100;
  document.getElementById("quiz-prog-fill").style.width = `${progressPercent}%`;

  // Question Text
  document.getElementById("quiz-q-text").textContent = question.question;

  // Options Grid
  const optionsGrid = document.getElementById("quiz-opts-grid");
  optionsGrid.innerHTML = "";

  question.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".quiz-option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedOption = opt;
      
      // Auto advance to next question
      setTimeout(() => {
        selectAndNext(opt, question.key);
      }, 350);
    });
    optionsGrid.appendChild(btn);
  });
}

function selectAndNext(val, key) {
  quizAnswers[key] = val;
  selectedOption = null;
  currentQuizIndex++;

  if (currentQuizIndex < QUIZ_QUESTIONS.length) {
    renderQuizQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById("quiz-content").style.display = "none";
  const resultsCard = document.getElementById("quiz-results");
  resultsCard.style.display = "flex";

  const recsContainer = document.getElementById("quiz-recs");
  recsContainer.innerHTML = "";

  const recommendations = [];

  // Logic based on answers
  if (quizAnswers.challenge && (quizAnswers.challenge.includes("Math") || quizAnswers.challenge.includes("Science"))) {
    recommendations.push({
      icon: `<svg class="stroke-icon-pink" viewBox="0 0 24 24" style="width:32px;height:32px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
      title: "Science & Maths Masterclass",
      desc: "Live small batch sessions with master educators to solve core school blockages."
    });
  }
  
  if (quizAnswers.ai_interest && (quizAnswers.ai_interest.includes("Extremely") || quizAnswers.ai_interest.includes("curious"))) {
    recommendations.push({
      icon: `<svg class="stroke-icon-pink" viewBox="0 0 24 24" style="width:32px;height:32px;"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>`,
      title: "K10 AI Curriculum",
      desc: "School-integrated coding labs preparing students to construct custom ML models."
    });
  }

  if (quizAnswers.challenge && quizAnswers.challenge.includes("English")) {
    recommendations.push({
      icon: `<svg class="stroke-icon-pink" viewBox="0 0 24 24" style="width:32px;height:32px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v19.5H6.5"/></svg>`,
      title: "English & Expression Module",
      desc: "Focus on grammar confidence, vocabulary building, and presentation skills."
    });
  }

  // Fallbacks
  if (recommendations.length < 2) {
    recommendations.push({
      icon: `<svg class="stroke-icon-pink" viewBox="0 0 24 24" style="width:32px;height:32px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
      title: "Science & Maths Masterclass",
      desc: "Conceptual masterclass streams for Class 5 to 10."
    });
    recommendations.push({
      icon: `<svg class="stroke-icon-pink" viewBox="0 0 24 24" style="width:32px;height:32px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
      title: "Confidence Score Setup",
      desc: "Run a free diagnostic assessment to calculate your baseline score."
    });
  }

  recommendations.slice(0, 3).forEach(rec => {
    const div = document.createElement("div");
    div.className = "quiz-rec-card";
    div.innerHTML = `
      <div class="quiz-rec-icon">${rec.icon}</div>
      <div>
        <div class="quiz-rec-title">${rec.title}</div>
        <div class="quiz-rec-desc">${rec.desc}</div>
      </div>
    `;
    recsContainer.appendChild(div);
  });

  const grade = quizAnswers.grade || "your class";
  document.getElementById("quiz-results-title").textContent = `Path discovered for ${grade}!`;
}

function resetQuiz() {
  currentQuizIndex = 0;
  quizAnswers = {};
  selectedOption = null;
  renderQuizQuestion();
}

// 4. Counter Stats
function initCounterStats() {
  const statSection = document.querySelector(".count-band");
  let started = false;

  const startCounters = () => {
    const studentCount = document.getElementById("c-students");
    const cityCount = document.getElementById("c-cities");
    const dayCount = document.getElementById("c-days");

    // Dynamic days left calculation (August 31, 2026 deadline)
    const deadline = new Date("2026-08-31T23:59:59").getTime();
    const now = new Date().getTime();
    const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

    animateNumber(studentCount, 4200, 2000, "+");
    animateNumber(cityCount, 38, 1500, "");
    dayCount.textContent = daysLeft;
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      startCounters();
    }
  }, { threshold: 0.2 });

  if (statSection) {
    observer.observe(statSection);
  }
}

function animateNumber(element, target, duration, suffix = "") {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    element.textContent = Math.floor(easeProgress * target).toLocaleString("en-IN") + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// 5. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  
  faqItems.forEach(item => {
    const questionButton = item.querySelector(".faq-q");
    questionButton.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      
      faqItems.forEach(i => i.classList.remove("open"));
      
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// 6. Modals
function initModals() {
  const regModal = document.getElementById("reg-modal");
  const loginModal = document.getElementById("login-modal");
  
  const openRegBtns = document.querySelectorAll(".open-reg-modal");
  const openLoginBtns = document.querySelectorAll(".open-login-modal");

  const closeBtns = document.querySelectorAll(".modal-close-btn");

  openRegBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    regModal.classList.add("open");
  }));

  openLoginBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.classList.add("open");
  }));

  closeBtns.forEach(btn => btn.addEventListener("click", () => {
    regModal.classList.remove("open");
    loginModal.classList.remove("open");
  }));

  window.addEventListener("click", (e) => {
    if (e.target === regModal) regModal.classList.remove("open");
    if (e.target === loginModal) loginModal.classList.remove("open");
  });

  // Handle forms
  const bookingForm = document.getElementById("demo-booking-form");
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you! Your demo session request has been registered. Our counsellor will contact you shortly.");
    regModal.classList.remove("open");
    bookingForm.reset();
  });

  const loginForm = document.getElementById("student-login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Login credentials submitted. Accessing Teachifyy student dashboard...");
    loginModal.classList.remove("open");
    loginForm.reset();
  });
}

// 7. Hero Canvas Background Animation
function initHeroAnimation() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const heroSection = document.getElementById("home");
  if (!heroSection) return;

  let width = 0;
  let height = 0;
  let shapes = [];
  const numShapes = 14 + Math.floor(Math.random() * 5); // 14 to 18 shapes
  
  // Colors strictly #FD4463 (pink) and #2C5688 (correct brand blue)
  const colors = ["#FD4463", "#2C5688"];

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    const oldWidth = width;
    const oldHeight = height;
    width = rect.width;
    height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Sizing style
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Recalculate shape positions proportionally on resize
    if (shapes.length > 0 && oldWidth > 0 && oldHeight > 0) {
      shapes.forEach(shape => {
        shape.x = (shape.x / oldWidth) * width;
        shape.y = (shape.y / oldHeight) * height;
      });
    }
  }

  function getWeightedRandomPosition(radius) {
    let x, y;
    // 85% chance to generate weighted near edges and corners, keeping center clear
    if (Math.random() < 0.85) {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) {
        // Left zone (0 to 25% of width)
        x = Math.random() * 0.25 * width;
        y = Math.random() * height;
      } else if (edge === 1) {
        // Right zone (75% to 100% of width)
        x = (0.75 + Math.random() * 0.25) * width;
        y = Math.random() * height;
      } else if (edge === 2) {
        // Top zone (0 to 25% of height)
        x = Math.random() * width;
        y = Math.random() * 0.25 * height;
      } else {
        // Bottom zone (75% to 100% of height)
        x = Math.random() * width;
        y = (0.75 + Math.random() * 0.25) * height;
      }
    } else {
      // 15% chance to place anywhere
      x = Math.random() * width;
      y = Math.random() * height;
    }
    return { x, y };
  }

  function createShapes() {
    shapes = [];
    for (let i = 0; i < numShapes; i++) {
      const diameter = 40 + Math.random() * 340; // 40px to 380px diameter
      const r = diameter / 2;
      const { x, y } = getWeightedRandomPosition(r);
      const isFilled = i % 2 === 0; // Roughly half solid filled, half outline rings
      const strokeWidth = 1.5 + Math.random() * 1.0; // 1.5 to 2.5px stroke width
      const color = colors[i % colors.length]; // alternating colors
      const baseOpacity = 0.05 + Math.random() * 0.04; // base opacity 0.05 to 0.09
      
      const speed = 0.2 + Math.random() * 0.25; // 0.20 to 0.45 pixels per frame (slightly faster drift)
      const angle = Math.random() * Math.PI * 2;
      const dx = speed * Math.cos(angle);
      const dy = speed * Math.sin(angle);
      
      const oscPeriod = 6000 + Math.random() * 4000; // period between 6000ms and 10000ms
      const oscPhase = Math.random() * Math.PI * 2;

      shapes.push({
        x,
        y,
        r,
        isFilled,
        strokeWidth,
        color,
        baseOpacity,
        dx,
        dy,
        oscPeriod,
        oscPhase
      });
    }
  }

  resize();
  createShapes();

  window.addEventListener("resize", resize);

  // Check prefers-reduced-motion
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReducedMotion = motionQuery.matches;
  motionQuery.addEventListener("change", (e) => {
    prefersReducedMotion = e.matches;
  });

  function drawShape(shape, t) {
    // Opacity oscillation (sine wave)
    const opacityOffset = Math.sin((t / shape.oscPeriod) * 2 * Math.PI + shape.oscPhase) * 0.03;
    const opacity = Math.max(0.01, Math.min(0.12, shape.baseOpacity + opacityOffset));
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);

    const hex = shape.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const colorStr = `rgb(${r}, ${g}, ${b})`;

    if (shape.isFilled) {
      ctx.fillStyle = colorStr;
      ctx.fill();
    } else {
      ctx.strokeStyle = colorStr;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  function loop(t) {
    ctx.clearRect(0, 0, width, height);

    shapes.forEach(shape => {
      // If motion is not reduced, update drift position
      if (!prefersReducedMotion) {
        shape.x += shape.dx;
        shape.y += shape.dy;

        // Wrap around edge invisibly
        if (shape.x < -shape.r) {
          shape.x = width + shape.r;
        } else if (shape.x > width + shape.r) {
          shape.x = -shape.r;
        }

        if (shape.y < -shape.r) {
          shape.y = height + shape.r;
        } else if (shape.y > height + shape.r) {
          shape.y = -shape.r;
        }
      }

      drawShape(shape, t);
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// 9. Interactive eye tracking wiggles (pupils follow mouse cursor)
function initEyeTracking() {
  const pupilGroups = document.querySelectorAll('.pupils, .pupils-look-up, .pupils-excited');
  
  if (pupilGroups.length === 0) return;

  let pupilCache = [];
  let needsRecalc = true;

  function updateCache() {
    pupilCache = Array.from(pupilGroups).map(pupilGroup => {
      const rect = pupilGroup.getBoundingClientRect();
      return {
        element: pupilGroup,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        isLeftPeeking: pupilGroup.closest('.peeking-student-left') !== null
      };
    });
  }

  window.addEventListener("resize", () => { needsRecalc = true; });
  window.addEventListener("scroll", () => { needsRecalc = true; }, { passive: true });

  document.addEventListener("mousemove", (e) => {
    if (needsRecalc) {
      updateCache();
      needsRecalc = false;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    pupilCache.forEach(cached => {
      const dx = mouseX - cached.centerX;
      const dy = mouseY - cached.centerY;
      const distance = Math.hypot(dx, dy);
      if (distance === 0) return;

      const angle = Math.atan2(dy, dx);
      const maxTranslate = 8;
      const translationDistance = Math.min(maxTranslate, distance / 30);

      let translateX = Math.cos(angle) * translationDistance;
      let translateY = Math.sin(angle) * translationDistance;

      // Correct for horizontal flipping on left-peeking characters
      if (cached.isLeftPeeking) {
        translateX = -translateX;
      }

      cached.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });
  });

  document.addEventListener("mouseleave", () => {
    pupilGroups.forEach(pupilGroup => {
      pupilGroup.style.transform = "translate(0px, 0px)";
    });
    needsRecalc = true;
  });
}

// 10. Sequential Frame Animation in Hero Section (Dual-State Loop)
function initHeroFrameSequence() {
  const container = document.querySelector(".hero-image-sequence-container");
  const imgElement = document.getElementById("hero-frame-img");
  if (!container || !imgElement) return;

  const totalFrames = 72;
  const preloadedStudying = [];
  const preloadedLooking = [];
  let loadedCount = 0;

  // Preload both image series immediately
  for (let i = 1; i <= totalFrames; i++) {
    const frameStr = String(i).padStart(3, '0');
    
    // Preload studying frame
    const imgStudying = new Image();
    imgStudying.onload = () => { loadedCount++; };
    imgStudying.src = `./frames_processed/studying/ezgif-frame-${frameStr}.png`;
    preloadedStudying.push(imgStudying);

    // Preload looking frame
    const imgLooking = new Image();
    imgLooking.onload = () => { loadedCount++; };
    imgLooking.src = `./frames_processed/looking/ezgif-frame-${frameStr}.png`;
    preloadedLooking.push(imgLooking);
  }

  let studyingFrame = 1;
  let lookingFrame = 1;
  let studyingDirection = 1; // 1 for forward, -1 for backward (ping-pong loop)
  let isHovered = false;
  let lookingFinished = true; // Start with lookingFinished = true so it defaults to studying loop

  function playLoop() {
    // Continue playing looking frames until finished, even if cursor leaves mid-way
    if (!lookingFinished && (isHovered || lookingFrame > 1)) {
      lookingFrame++;
      if (lookingFrame > totalFrames) {
        lookingFinished = true;
        lookingFrame = 1;
        const frameStr = String(studyingFrame).padStart(3, '0');
        imgElement.src = `./frames_processed/studying/ezgif-frame-${frameStr}.png`;
      } else {
        const frameStr = String(lookingFrame).padStart(3, '0');
        imgElement.src = `./frames_processed/looking/ezgif-frame-${frameStr}.png`;
      }
    } else {
      // Ping-pong (yoyo) loop for studying to avoid abrupt frame resets
      studyingFrame += studyingDirection;
      if (studyingFrame >= totalFrames) {
        studyingFrame = totalFrames;
        studyingDirection = -1;
      } else if (studyingFrame <= 1) {
        studyingFrame = 1;
        studyingDirection = 1;
      }
      const frameStr = String(studyingFrame).padStart(3, '0');
      imgElement.src = `./frames_processed/studying/ezgif-frame-${frameStr}.png`;
    }

    // Run the animation loop at 32fps (1000 / 32 ms interval)
    setTimeout(() => {
      requestAnimationFrame(playLoop);
    }, 1000 / 32);
  }

  container.addEventListener("mouseenter", () => {
    isHovered = true;
    lookingFinished = false;
    lookingFrame = 1;
    imgElement.src = `./frames_processed/looking/ezgif-frame-001.png`;
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    lookingFinished = false;
  });

  // Start the continuous animation loop
  playLoop();
}
