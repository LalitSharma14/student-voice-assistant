// ── MOCK SYLLABUS DATABASE FOR CLASSES 5 TO 12 ──
const SYLLABUS_DB = {
  "5": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Large Numbers",
        topics: [
          { name: "Concept of Place Value", desc: "Understanding place values up to 8 digits." },
          { name: "Comparing & Ordering Numbers", desc: "Rules for comparing large numbers and ordering them." }
        ]
      },
      {
        chapter: "Chapter 2: Roman Numerals",
        topics: [
          { name: "Reading Roman Numerals", desc: "Rules for reading symbols I, V, X, L, C, D, M." },
          { name: "Writing Roman Numerals", desc: "Converting Hindu-Arabic numerals to Roman numerals." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Parts of Speech",
        topics: [
          { name: "Nouns & Pronouns", desc: "Identifying nouns, pronouns, and their types in sentences." },
          { name: "Verbs & Adverbs", desc: "Action words and how they are described by adverbs." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: व्याकरण",
        topics: [
          { name: "संज्ञा और उसके भेद", desc: "व्यक्तिवाचक, जातिवाचक और भाववाचक संज्ञा की पहचान।" },
          { name: "सर्वनाम के भेद", desc: "सर्वनाम शब्दों का प्रयोग और उनके भेदों का अभ्यास।" }
        ]
      }
    ],
    "EVS": [
      {
        chapter: "Chapter 1: Super Senses",
        topics: [
          { name: "Senses of Animals", desc: "Exploring how animals see, hear, smell, and feel." },
          { name: "Amazing Animal Shelters", desc: "Understanding the diverse nesting and living spaces of wildlife." }
        ]
      }
    ],
    "Art Education": [
      {
        chapter: "Chapter 1: Colors & Crafts",
        topics: [
          { name: "Primary & Secondary Colors", desc: "Exploring color wheels, warm/cool shades, and mixing." },
          { name: "Landscape Sketching", desc: "Basic shading, perspective drawing, and natural environment sketches." }
        ]
      }
    ]
  },
  "6": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Knowing Our Numbers",
        topics: [
          { name: "Comparing Numbers", desc: "Practicing numbers comparison, ascending and descending orders." },
          { name: "Estimation of Sums", desc: "Rounding off numbers to nearest tens, hundreds, and thousands." }
        ]
      },
      {
        chapter: "Chapter 2: Whole Numbers",
        topics: [
          { name: "Number Line Representation", desc: "Representing addition and subtraction on the number line." },
          { name: "Properties of Whole Numbers", desc: "Closure, commutative, and associative properties." }
        ]
      }
    ],
    "Science": [
      {
        chapter: "Chapter 1: Components of Food",
        topics: [
          { name: "Nutrients in Food", desc: "Testing for starch, proteins, and fats in various food samples." },
          { name: "Balanced Diet & Deficiency Diseases", desc: "Understanding night blindness, scurvy, rickets, and anemia." }
        ]
      }
    ],
    "Social Science": [
      {
        chapter: "Chapter 1: Exploring the Earth",
        topics: [
          { name: "The Solar System", desc: "The Sun, planets, satellites, asteroids, and meteoroids." },
          { name: "Latitudes and Longitudes", desc: "Understanding prime meridian, equator, and time zones." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Vocabulary & Grammar",
        topics: [
          { name: "Active Listening", desc: "Comprehending spoken passages and summarizing details." },
          { name: "Nouns & Pronouns Usage", desc: "Proper alignment of countable/uncountable nouns and relative pronouns." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: भाषा और व्याकरण",
        topics: [
          { name: "भाषा के रूप", desc: "मौखिक, लिखित और सांकेतिक भाषा के अंतर को समझना।" },
          { name: "वर्ण विचार", desc: "स्वर और व्यंजन के भेदों का उच्चारण और लेखन स्थान।" }
        ]
      }
    ]
  },
  "7": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Integers",
        topics: [
          { name: "Properties of Addition & Subtraction", desc: "Closure, commutative, and associative properties." },
          { name: "Multiplication of Integers", desc: "Signs rules and multiplication shortcuts." }
        ]
      },
      {
        chapter: "Chapter 2: Fractions and Decimals",
        topics: [
          { name: "Multiplication of Fractions", desc: "Multiplying fractions by whole numbers and other fractions." }
        ]
      }
    ],
    "Science": [
      {
        chapter: "Chapter 1: Nutrition in Plants",
        topics: [
          { name: "Mode of Nutrition", desc: "Autotrophic vs heterotrophic modes of nutrition." },
          { name: "Photosynthesis Mechanics", desc: "Stomata, chlorophyll, and solar conversion." }
        ]
      },
      {
        chapter: "Chapter 2: Heat Transfer",
        topics: [
          { name: "Conduction & Convection", desc: "How heat flows through solids and liquids." },
          { name: "Radiation & Vacuum", desc: "Heat transfer without a medium." }
        ]
      }
    ],
    "Social Science": [
      {
        chapter: "Chapter 1: Medieval India",
        topics: [
          { name: "Tracing Changes Over Time", desc: "Comparing mappings and historical terminologies." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Grammar Basics",
        topics: [
          { name: "Nouns & Pronouns", desc: "Types of nouns and relative pronouns." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: शब्द विचार",
        topics: [
          { name: "तत्सम और तद्भव शब्द", desc: "संस्कृत से उत्पन्न हिंदी शब्दों के रूप और पहचान।" }
        ]
      }
    ],
    "Sanskrit": [
      {
        chapter: "Chapter 1: सुभाषितानि",
        topics: [
          { name: "श्लोक वाचन", desc: "कंठस्थीकरण एवं शुद्ध उच्चारण अभ्यास।" },
          { name: "श्लोकार्थ एवं व्याकरण", desc: "सुभाषित श्लोकों का हिंदी अनुवाद एवं संधि विच्छेद।" }
        ]
      }
    ]
  },
  "8": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Rational Numbers",
        topics: [
          { name: "Properties of Rational Numbers", desc: "Closure, commutativity, and distributivity of rational operations." }
        ]
      }
    ],
    "Science": [
      {
        chapter: "Chapter 1: Crop Production & Management",
        topics: [
          { name: "Agricultural Practices", desc: "Soil preparation, sowing, irrigation, and harvesting steps." }
        ]
      }
    ],
    "Social Science": [
      {
        chapter: "Chapter 1: How, When and Where",
        topics: [
          { name: "Importance of Dates", desc: "Which dates are important and how histories are periodised." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Sentence Analysis",
        topics: [
          { name: "Simple & Compound Sentences", desc: "Identifying independent clauses and coordinating conjunctions." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: कारक विचार",
        topics: [
          { name: "कारक के भेद", desc: "कर्ता से लेकर संबोधन तक के चिन्हों का वाक्य प्रयोग।" }
        ]
      }
    ]
  },
  "9": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Number Systems",
        topics: [
          { name: "Irrational Numbers", desc: "Understanding non-terminating and non-recurring decimals." },
          { name: "Real Numbers and Decimals", desc: "Representing real numbers on the number line using successive magnification." }
        ]
      },
      {
        chapter: "Chapter 2: Polynomials",
        topics: [
          { name: "Zeroes of a Polynomial", desc: "Finding the roots of constant, linear, and quadratic polynomials." }
        ]
      }
    ],
    "Science": [
      {
        chapter: "Chapter 1: Cell - Basic Unit of Life",
        topics: [
          { name: "Cell Discovery", desc: "History of cell identification and the Cell Theory." },
          { name: "Cell Organelles", desc: "Mitochondria, plastids, Golgi apparatus, and lysosomes." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Grammar Mastery",
        topics: [
          { name: "Active and Passive Voice", desc: "Rules of transformation for active-passive voice syntax." },
          { name: "Modal Auxiliaries", desc: "Using can, could, may, might, must correctly." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: उपसर्ग और प्रत्यय",
        topics: [
          { name: "उपसर्ग के भेद", desc: "संस्कृत, हिंदी और उर्दू उपसर्गों की पहचान।" },
          { name: "प्रत्यय के भेद", desc: "कृत् प्रत्यय और तद्धित प्रत्यय के उदाहरण।" }
        ]
      }
    ],
    "Skill Education": [
      {
        chapter: "Chapter 1: Information Technology",
        topics: [
          { name: "Introduction to Computers", desc: "Hardware components, software layers, and basic commands." },
          { name: "Word Processing Skills", desc: "Formatting documents, headers/footers, and shortcut keys." }
        ]
      }
    ]
  },
  "10": {
    "Mathematics": [
      {
        chapter: "Chapter 1: Quadratic Equations",
        topics: [
          { name: "Introduction to Quadratics", desc: "Understanding the standard form ax^2 + bx + c = 0." },
          { name: "Solution by Factoring", desc: "Solving quadratic equations by splitting the middle term." },
          { name: "Solution by Completing the Square", desc: "Deriving and applying the quadratic formula." },
          { name: "Nature of Roots", desc: "Using the discriminant (b^2 - 4ac) to determine real/imaginary roots." }
        ]
      },
      {
        chapter: "Chapter 2: Real Numbers",
        topics: [
          { name: "Euclid's Division Lemma", desc: "Understanding divisibility of integers and HCF algorithm." },
          { name: "Fundamental Theorem of Arithmetic", desc: "Prime factorization and LCM/HCF relations." }
        ]
      }
    ],
    "Science": [
      {
        chapter: "Chapter 1: Chemical Reactions",
        topics: [
          { name: "Chemical Equations", desc: "Balancing equations and conservation of mass." },
          { name: "Types of Chemical Reactions", desc: "Combination, decomposition, displacement, and redox reactions." }
        ]
      },
      {
        chapter: "Chapter 2: Life Processes",
        topics: [
          { name: "Nutrition in Humans", desc: "Understanding digestive enzymes and absorption processes." },
          { name: "Respiration & Energy Output", desc: "Aerobic vs anaerobic respiration mechanisms." }
        ]
      }
    ],
    "Social Science": [
      {
        chapter: "Chapter 1: Rise of Nationalism",
        topics: [
          { name: "French Revolution & Nation Idea", desc: "How national identity spread across Europe." },
          { name: "Making of Nationalism in Germany", desc: "Unification processes led by Otto von Bismarck." }
        ]
      }
    ],
    "English": [
      {
        chapter: "Chapter 1: Grammar Mastery",
        topics: [
          { name: "Active & Passive Voice", desc: "Rules of conversion across various tenses." },
          { name: "Subject-Verb Concord", desc: "Ensuring proper agreement of singular/plural subjects." }
        ]
      }
    ],
    "Hindi": [
      {
        chapter: "Chapter 1: पदबंध",
        topics: [
          { name: "संज्ञा पदबंध", desc: "वाक्यों में संज्ञा पदबंधों की पहचान एवं भेद।" }
        ]
      }
    ],
    "Sanskrit": [
      {
        chapter: "Chapter 1: शुचिपर्यावरणम्",
        topics: [
          { name: "पर्यावरण श्लोक वाचन", desc: "शुचिपर्यावरणम् पाठ के श्लोकों का लयबद्ध उच्चारण।" },
          { name: "पर्यावरण व्याकरण", desc: "श्लोकों से जुड़े संधि, समास और अव्यय पद।" }
        ]
      }
    ]
  },
  "11": {},
  "12": {}
};

// Default Fallback Database for grades 5, 6, 8, 9 (reusing or simulating)
const DEFAULT_FALLBACK_SYLLABUS = {
  "Mathematics": [
    {
      chapter: "Chapter 1: Advanced Fundamentals",
      topics: [
        { name: "Concept Introduction", desc: "Standard core rules and calculations." },
        { name: "Topic Practice", desc: "Solving standard textbook problems." }
      ]
    }
  ],
  "Science": [
    {
      chapter: "Chapter 1: Physical Sciences",
      topics: [
        { name: "Forces & Motion", desc: "Understanding speeds, pulls, and friction." }
      ]
    }
  ],
  "English": [
    {
      chapter: "Chapter 1: Reading Skills",
      topics: [
        { name: "Comprehension & Vocabulary", desc: "Answering context questions and active vocabulary." }
      ]
    }
  ],
  "Social Science": [
    {
      chapter: "Chapter 1: Civilization Studies",
      topics: [
        { name: "Early Settlements", desc: "Historical timelines of ancient cities." }
      ]
    }
  ]
};

// ── MOCK MCQ QUESTION DATABASE FOR TESTS ──
const MCQ_TESTS_DB = {
  "Introduction to Quadratics": [
    { q: "What is the standard form of a quadratic equation?", opts: ["ax^2 + bx + c = 0", "ax + b = 0", "ax^3 + bx^2 + c = 0", "y = mx + c"], ans: 0, exp: "The standard quadratic form is ax^2 + bx + c = 0 where a, b, and c are constants, and a != 0." },
    { q: "Which of the following is a quadratic equation?", opts: ["x^2 - 5x + 6 = 0", "x - 9 = 0", "3x^3 - x = 0", "sqrt(x) + 2 = 0"], ans: 0, exp: "x^2 - 5x + 6 = 0 has a maximum degree of 2, which satisfies the definition." },
    { q: "In ax^2 + bx + c = 0, what happens if a = 0?", opts: ["It becomes a linear equation", "It remains quadratic", "It is undefined", "It becomes cubic"], ans: 0, exp: "If a = 0, the x^2 term vanishes, leaving bx + c = 0, which is linear." }
  ],
  "Nature of Roots": [
    { q: "If the discriminant b^2 - 4ac > 0 and a perfect square, the roots are:", opts: ["Real, rational, and unequal", "Real, irrational, and unequal", "Real and equal", "Imaginary"], ans: 0, exp: "A positive perfect square discriminant yields unequal real rational roots." },
    { q: "What is the discriminant of x^2 - 4x + 4 = 0?", opts: ["0", "8", "-8", "16"], ans: 0, exp: "b^2 - 4ac = (-4)^2 - 4(1)(4) = 16 - 16 = 0." },
    { q: "If discriminant = 0, the roots are:", opts: ["Real and equal", "Real and unequal", "Imaginary", "Rational and unequal"], ans: 0, exp: "A discriminant of zero means both roots coincide at -b / (2a)." }
  ],
  "Photosynthesis Mechanics": [
    { q: "Which gas is primarily absorbed by plants during photosynthesis?", opts: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], ans: 0, exp: "Plants consume Carbon Dioxide (CO2) from the air to synthesize glucose." },
    { q: "Where does photosynthesis primarily take place in plants?", opts: ["Chloroplasts", "Mitochondria", "Cell Wall", "Ribosomes"], ans: 0, exp: "Chloroplasts contain chlorophyll which absorbs sunlight for the reaction." },
    { q: "What are the raw materials needed for photosynthesis?", opts: ["Carbon Dioxide and Water", "Oxygen and Glucose", "Water and Soil", "Nitrogen and Carbon Dioxide"], ans: 0, exp: "The chemical equation is 6CO2 + 6H2O + Light -> C6H12O6 + 6O2." }
  ]
};

const DEFAULT_MCQ_TEST = [
  { q: "What is the primary goal of this topic?", opts: ["Understanding foundational rules", "Memorizing questions", "Finishing exams fast", "Avoiding mistakes"], ans: 0, exp: "Understanding core concepts ensures long-term mastery." },
  { q: "How can you verify your understanding of a topic?", opts: ["Explaining it to others", "Looking at answer sheets", "Skimming chapters", "Rote learning"], ans: 0, exp: "Being able to explain a concept in simple terms shows deep understanding." },
  { q: "What is the best way to handle a study doubt?", opts: ["Ask AI or your teacher right away", "Ignore it", "Wait until the exam", "Erase the question"], ans: 0, exp: "Resolving doubts quickly prevents gaps in foundational knowledge." }
];

// ── MOCK AI TUTOR KNOWLEDGEBASE ──
const AI_TUTOR_KNOWLEDGE = {
  "quadratic": {
    English: {
      text: "A **quadratic equation** is a polynomial equation of degree 2. The standard form is:\n\n\\[ax^2 + bx + c = 0\\]\n\nWhere **a**, **b**, and **c** are numbers, and \\(a \\neq 0\\).\n\n### Core Concepts:\n1. **Roots**: The values of \\(x\\) that satisfy the equation. A quadratic always has exactly **two roots** (which may be real, equal, or imaginary).\n2. **Discriminant (D)**: Evaluated as \\(D = b^2 - 4ac\\). It tells us the *nature* of the roots:\n   * If \\(D > 0\\): Roots are real and distinct.\n   * If \\(D = 0\\): Roots are real and equal.\n   * If \\(D < 0\\): Roots are imaginary (complex).\n3. **Quadratic Formula**: The universal solution:\n   \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]",
      source: "Gr. 10 Math: Quadratic Equations foundations. (2025)",
      followups: ["Give me an example", "What is the nature of roots?", "Create a quiz on quadratics"]
    },
    Hindi: {
      text: "एक **द्विघात समीकरण (Quadratic Equation)** घात 2 का एक बहुपद समीकरण होता है। इसका मानक रूप है:\n\n\\[ax^2 + bx + c = 0\\]\n\nजहाँ **a**, **b**, और **c** वास्तविक संख्याएँ हैं, और \\(a \\neq 0\\) है।\n\n### मुख्य अवधारणाएँ:\n1. **मूल (Roots)**: \\(x\\) के वे मान जो समीकरण को संतुष्ट करते हैं। एक द्विघात समीकरण के हमेशा **दो मूल** होते हैं।\n2. **विविक्तकर (Discriminant - D)**: इसका मान \\(D = b^2 - 4ac\\) होता है। यह मूलों की प्रकृति बताता है:\n   * यदि \\(D > 0\\): मूल वास्तविक और भिन्न होंगे।\n   * यदि \\(D = 0\\): मूल वास्तविक और समान होंगे।\n   * यदि \\(D < 0\\): मूल काल्पनिक (Imaginary) होंगे।",
      source: "कक्षा 10 गणित: द्विघात समीकरण मूल सिद्धांत। (2025)",
      followups: ["मुझे एक उदाहरण दें", "मूलों की प्रकृति क्या है?", "क्विज बनाएं"]
    },
    Hinglish: {
      text: "A **quadratic equation** basically 2nd-degree polynomial equation hota hai. Iska standard format standard form hai:\n\n\\[ax^2 + bx + c = 0\\]\n\nJisme **a**, **b**, aur **c** constants hai, and \\(a \\neq 0\\) hona chahiye.\n\n### Main Points:\n1. **Roots**: \\(x\\) ki values jo equation ko solve karti hai. Har quadratic equation ke exact **2 roots** hote hain.\n2. **Discriminant (D)**: Iski value \\(D = b^2 - 4ac\\) hoti hai. Ye hume bataata hai ki roots real hain ya imaginary:\n   * Agar \\(D > 0\\): Roots real and distinct (alag-alag) hote hain.\n   * Agar \\(D = 0\\): Roots real and equal (samaan) hote hain.\n   * Agar \\(D < 0\\): Roots complex/imaginary hote hain.",
      source: "Gr. 10 Math: Quadratic Equations foundations. (2025)",
      followups: ["Give me an example", "Nature of roots samjhao", "Quadratics par quiz banao"]
    }
  },
  "photosynthesis": {
    English: {
      text: "**Photosynthesis** is the process by which green plants utilize sunlight to synthesize food from Carbon Dioxide and Water. The chemical equation is:\n\n\\[6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2\\]\n\n### Key Stages:\n1. **Light Reactions**: Occur in the thylakoid membranes of chloroplasts. Sunlight is absorbed by chlorophyll, splitting water to release oxygen and generate ATP/NADPH.\n2. **Dark Reactions (Calvin Cycle)**: Occur in the stroma. Carbon Dioxide is fixed into sugars using the ATP and NADPH generated in light stages.",
      source: "Gr. 7 Biology: Photosynthesis Mechanics. (2024)",
      followups: ["Explain light reactions", "What is Chlorophyll?", "Create a quiz on photosynthesis"]
    },
    Hindi: {
      text: "**प्रकाश संश्लेषण (Photosynthesis)** वह प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश का उपयोग करके कार्बन डाइऑक्साइड और पानी से भोजन का संश्लेषण करते हैं। रासायनिक समीकरण है:\n\n\\[6CO_2 + 6H_2O + \\text{प्रकाश} \\rightarrow C_6H_{12}O_6 + 6O_2\\]\n\n### मुख्य चरण:\n1. **प्रकाश-निर्भर प्रतिक्रिया (Light Reactions)**: क्लोरोप्लास्ट की थायलाकोइड झिल्ली में होती है। सूर्य का प्रकाश क्लोरोफिल द्वारा अवशोषित किया जाता है, जिससे पानी टूटकर ऑक्सीजन मुक्त करता है।\n2. **अंधेरी प्रतिक्रिया (Calvin Cycle)**: स्ट्रोमा में होती है। कार्बन डाइऑक्साइड को शर्करा (sugars) में बदला जाता है।",
      source: "कक्षा 7 जीव विज्ञान: प्रकाश संश्लेषण प्रक्रिया। (2024)",
      followups: ["प्रकाश प्रतिक्रिया समझाएं", "क्लोरोफिल क्या है?", "क्विज बनाएं"]
    },
    Hinglish: {
      text: "**Photosynthesis** wo process hai jisse green plants sunlight ka use karke Carbon Dioxide and Water se apna food banate hain. Iski chemical equation hai:\n\n\\[6CO_2 + 6H_2O + \\text{Sunlight} \\rightarrow C_6H_{12}O_6 + 6O_2\\]\n\n### Main Steps:\n1. **Light Reactions**: Ye chloroplast ke thylakoid membranes me hoti hain. Chlorophyll sunlight absorb karta hai aur water molecules split karke oxygen release karta hai.\n2. **Dark Reactions (Calvin Cycle)**: Ye stroma me hoti hain. Yahan Carbon Dioxide ko use karke glucose carbohydrate banaya jata hai.",
      source: "Gr. 7 Biology: Photosynthesis Mechanics. (2024)",
      followups: ["Light reactions samjhao", "Chlorophyll kya hota hai?", "Photosynthesis quiz start karo"]
    }
  }
};

// Default generic AI responses
const DEFAULT_AI_KNOWLEDGE = {
  English: {
    text: "That is an excellent conceptual question! Let's break it down step-by-step:\n\n1. **Define the Term**: Understand the base definitions of your question topic.\n2. **Understand the Mechanics**: Dive into how it connects to your active syllabus chapters.\n3. **Practical Application**: Think about real-world scenarios or numerical problems related to this topic.\n\nAsk me specific questions like *'Explain Quadratic Equations'* or click *'Create quiz'* to test your skills!",
    source: "Teachifyy AI Study Companion. (2026)",
    followups: ["Give me an example", "Create a quiz on this topic"]
  },
  Hindi: {
    text: "यह एक बहुत अच्छा वैचारिक सवाल है! आइए इसे सिलसिलेवार ढंग से समझें:\n\n1. **परिभाषा**: सबसे पहले विषय की बुनियादी परिभाषाओं को समझें।\n2. **कार्यप्रणाली**: देखें कि यह आपके सक्रिय पाठ्यक्रम (syllabus) अध्यायों से कैसे जुड़ता है।\n3. **व्यावहारिक उपयोग**: इस विषय से संबंधित वास्तविक जीवन के उदाहरणों या संख्यात्मक समस्याओं पर विचार करें।\n\nमुझसे कोई विशिष्ट प्रश्न पूछें जैसे *'प्रकाश संश्लेषण समझाएं'* या टेस्ट देने के लिए *'क्विज बनाएं'* पर क्लिक करें।",
    source: "टीचिफाई एआई सहायक। (2026)",
    followups: ["मुझे एक उदाहरण दें", "इस विषय पर क्विज बनाएं"]
  },
  Hinglish: {
    text: "Ye ek bahut hi aacha conceptual question hai! Chalo ise step-by-step samajhte hain:\n\n1. **Base Definition**: Sabse pehle is topic ki basic definition ko samajhte hain.\n2. **Syllabus Connection**: Ye dekho ki ye topic aapke active chapters se kaise connected hai.\n3. **Real-world Use**: Is topic se related numerical problems ya real life examples par dhyan do.\n\nAsk me specific questions like *'Ratio and Proportion samjhao'* ya *'Create quiz'* par click karke test shuru karo!",
    source: "Teachifyy AI Study Companion. (2026)",
    followups: ["Mujhe example do", "Is topic par quiz start karo"]
  }
};

// ── GLOBAL SUBJECT COLOR PALETTE ──
const SUBJECT_COLORS = {
  "Mathematics": "#1E3A8A",
  "Science": "#065F46",
  "Social Science": "#7C2D12",
  "English": "#9D174D",
  "Hindi": "#9A3412",
  "Sanskrit": "#78350F",
  "EVS": "#115E59",
  "Art Education": "#5B21B6",
  "Skill Education": "#374151"
};

// ── DEFAULT MOCK DATABASES FOR HISTORY ──
const defaultChatHistory = [
  {
    title: "Quadratic Equations Intro",
    date: "Yesterday",
    preview: "Solved 3 factoring examples and discussed the quadratic formula.",
    messages: [
      { sender: "student", text: "How do I solve standard quadratic equations?", time: "3:01 PM" },
      { sender: "tutor", text: "To solve ax² + bx + c = 0, we can split the middle term, complete the square, or use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. Let's look at an example.", time: "3:02 PM" },
      { sender: "student", text: "Ah, splitting the middle term is sometimes hard. Can you show me an example of that?", time: "3:03 PM" },
      { sender: "tutor", text: "Of course! Let's take x² - 5x + 6 = 0. We need two numbers that multiply to 6 and add to -5. Those are -2 and -3. So we write (x - 2)(x - 3) = 0, giving us x = 2 and x = 3.", time: "3:04 PM" }
    ]
  },
  {
    title: "Chemical Reactions balancing",
    date: "2 days ago",
    preview: "Explained conservation of mass and worked on displacement equations.",
    messages: [
      { sender: "student", text: "Can you explain why we need to balance chemical equations?", time: "10:15 AM" },
      { sender: "tutor", text: "Balancing equations satisfies the Law of Conservation of Mass: mass is neither created nor destroyed in a chemical reaction. Therefore, the number of atoms of each element must be equal on both sides.", time: "10:16 AM" }
    ]
  }
];

const defaultResolvedDoubtsHistory = [
  {
    topic: "Euclid's Division Lemma",
    date: "Yesterday",
    method: "Test retake",
    beforeScore: 33,
    afterScore: 100,
    attempts: 2,
    details: "Resolved via Euclid's Division Lemma practice test retake. Score improved from 33% to 100%."
  }
];

// ── STATE MANAGEMENT ──
let AppState = {
  studentName: "Hammad Ahmed",
  studentGrade: "10",
  studentBoard: "ICSE",
  studentAvatar: "HA",
  streak: 18,
  studyHours: 4.2,
  quizAverage: "A",
  completedTopics: ["Euclid's Division Lemma", "Chemical Equations", "Active & Passive Voice"],
  doubtTopics: ["Nature of Roots", "Types of Chemical Reactions"],
  revisedTopics: ["French Revolution & Nation Idea"],
  inProgressTopics: ["Solution by Factoring"],
  currentActiveTab: "dashboard",
  chatHistory: [...defaultChatHistory],
  testHistory: [
    { topic: "Euclid's Division Lemma", score: 3, total: 3, date: "Yesterday", subject: "Mathematics" },
    { topic: "Chemical Equations", score: 2, total: 3, date: "3 days ago", subject: "Science" }
  ],
  resolvedDoubtsHistory: [...defaultResolvedDoubtsHistory],
  doubtDetails: {
    "Nature of Roots": {
      dateMarked: "2026-06-18T14:30:00.000Z",
      diagnosis: "You got 1/3 incorrect on quadratic discriminants in the last practice test.",
      note: "I don't understand why the discriminant formula b²-4ac determines if roots are real or imaginary."
    },
    "Types of Chemical Reactions": {
      dateMarked: "2026-06-06T11:15:00.000Z",
      diagnosis: "Incorrect answers logged on double displacement reactions and balancing coefficients.",
      note: "Balancing equations with multiple oxygen atoms is confusing."
    }
  }
};

// Active topic context inside Syllabus Tracker
let activeSyllabusTopic = null;
let activeSyllabusSubject = "Mathematics";
let activeTestSubjectFilter = "All";

// Active MCQ test context
let activeMCQTest = null;
let currentMCQQuestionIndex = 0;
let mcqScoreCount = 0;
let userMCQAnswers = []; // indexes of selected options
let activeChatSessionTitle = null;

// Speech synthesis tracking
let currentSpeechUtterance = null;
let isSpeakingState = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  parseURLParams();
  loadStateFromLocalStorage();
  initSidebarTabs();
  initDashboardViews();
  initChatTutorControls();
  initSyllabusTracker();
  initTestsCenter();
  initDoubtsView();
  initProgressCharts();
  initHistoryView();
  initNotificationCenter();
  initBackgroundCirclesPhysics();
  
  // Render initial items
  renderDashboardElements();
});

// Parse grade URL parameters
function parseURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  let gradeParam = urlParams.get('grade');
  
  if (gradeParam === "11-12") gradeParam = "12";
  
  if (gradeParam === "5") {
    AppState.studentName = "Aarav Sharma";
    AppState.studentGrade = "5";
    AppState.studentBoard = "CBSE";
    AppState.studentAvatar = "AS";
    AppState.streak = 8;
    AppState.studyHours = 2.1;
    AppState.quizAverage = "A-";
    AppState.completedTopics = ["Concept of Place Value", "Nouns & Pronouns"];
    AppState.doubtTopics = ["Senses of Animals"];
    AppState.revisedTopics = ["संज्ञा और उसके भेद"];
    activeSyllabusSubject = "Mathematics";
  } else if (gradeParam === "6") {
    AppState.studentName = "Ishaan Verma";
    AppState.studentGrade = "6";
    AppState.studentBoard = "CBSE";
    AppState.studentAvatar = "IV";
    AppState.streak = 12;
    AppState.studyHours = 3.5;
    AppState.quizAverage = "B";
    AppState.completedTopics = ["Comparing Numbers", "Nutrients in Food"];
    AppState.doubtTopics = ["The Solar System"];
    AppState.revisedTopics = ["भाषा के रूप"];
    activeSyllabusSubject = "Mathematics";
  } else if (gradeParam === "7") {
    AppState.studentName = "Sarah Khan";
    AppState.studentGrade = "7";
    AppState.studentBoard = "CBSE";
    AppState.studentAvatar = "SK";
    AppState.streak = 14;
    AppState.studyHours = 3.2;
    AppState.quizAverage = "B+";
    AppState.completedTopics = ["Mode of Nutrition", "Properties of Addition & Subtraction"];
    AppState.doubtTopics = ["Conduction & Convection"];
    AppState.revisedTopics = ["Tracing Changes Over Time"];
    activeSyllabusSubject = "Mathematics";
  } else if (gradeParam === "8") {
    AppState.studentName = "Karan Malhotra";
    AppState.studentGrade = "8";
    AppState.studentBoard = "ICSE";
    AppState.studentAvatar = "KM";
    AppState.streak = 5;
    AppState.studyHours = 1.2;
    AppState.quizAverage = "N/A";
    AppState.completedTopics = [];
    AppState.doubtTopics = [];
    AppState.revisedTopics = [];
    activeSyllabusSubject = "Mathematics";
  } else if (gradeParam === "9") {
    AppState.studentName = "Ananya Iyer";
    AppState.studentGrade = "9";
    AppState.studentBoard = "ICSE";
    AppState.studentAvatar = "AI";
    AppState.streak = 22;
    AppState.studyHours = 5.1;
    AppState.quizAverage = "A+";
    AppState.completedTopics = ["Irrational Numbers", "Introduction to Computers"];
    AppState.doubtTopics = ["Cell Discovery"];
    AppState.revisedTopics = ["उपसर्ग के भेद"];
    activeSyllabusSubject = "Mathematics";
  } else if (gradeParam === "11" || gradeParam === "12") {
    AppState.studentName = "Kabir Mehta";
    AppState.studentGrade = gradeParam;
    AppState.studentBoard = "CBSE";
    AppState.studentAvatar = "KM";
    AppState.streak = 0;
    AppState.studyHours = 0;
    AppState.quizAverage = "N/A";
    AppState.completedTopics = [];
    AppState.doubtTopics = [];
    AppState.revisedTopics = [];
    activeSyllabusSubject = "";
  } else {
    // Default Grade 10 (Hammad)
    AppState.studentName = "Hammad Ahmed";
    AppState.studentGrade = "10";
    AppState.studentBoard = "ICSE";
    AppState.studentAvatar = "HA";
    AppState.streak = 18;
    AppState.studyHours = 4.2;
    AppState.quizAverage = "A";
    AppState.completedTopics = ["Euclid's Division Lemma", "Chemical Equations", "Active & Passive Voice"];
    AppState.doubtTopics = ["Nature of Roots", "Types of Chemical Reactions"];
    AppState.revisedTopics = ["French Revolution & Nation Idea"];
    activeSyllabusSubject = "Mathematics";
  }
}

// Recommended Display Order
const SUBJECT_ORDER = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
  "EVS",
  "Sanskrit",
  "Art Education",
  "Skill Education"
];

function sortSubjects(subjects) {
  return [...subjects].sort((a, b) => {
    let indexA = SUBJECT_ORDER.indexOf(a);
    let indexB = SUBJECT_ORDER.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });
}

function getSubjectIconSvg(subject) {
  const icons = {
    "Mathematics": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 4h2v2h-2V6zm0 4h2v2h-2v-2zm-4-4h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 4H7v-2h10v2zm0-4h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V6z"/></svg>`,
    "Science": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 19c.55 0 1-.45 1-1s-.45-1-1-1h-1v-4.17l3.71-5.56c.19-.28.29-.62.29-.97v-1.3c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v1.3c0 .35.1.69.29.97l3.71 5.56V17H5c-.55 0-1 .45-1 1s.45 1 1 1h14zM8.22 10l-3-4.5h13.56l-3 4.5H8.22z"/></svg>`,
    "Social Science": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/></svg>`,
    "English": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 11l-2-2-2 2V4h6v9z"/></svg>`,
    "Hindi": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,
    "EVS": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>`,
    "Art Education": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.49 2 2 5.58 2 10c0 2.5 1.5 4.85 4 6 .5.2 1 .5 1 1 0 .5-.5 1-1 2-.5.5-.5 1 0 1.5.5.5 1.5.5 2.5 0 1-.5 1.5-1 2-1s1 .5 1 1v1.5c0 .83.67 1.5 1.5 1.5 4.5 0 9-4.48 9-10 0-4.42-4.51-8-10-8zm-5 7c-.83 0-1.5-.67-1.5-1.5S6.17 6 7 6s1.5.67 1.5 1.5S7.83 9 7 9zm4-3c-.83 0-1.5-.67-1.5-1.5S10.17 3 11 3s1.5.67 1.5 1.5S11.83 6 11 6zm4 3c-.83 0-1.5-.67-1.5-1.5S14.17 6 15 6s1.5.67 1.5 1.5S15.83 9 15 9zm3 4c-.83 0-1.5-.67-1.5-1.5S17.17 10 18 10s1.5.67 1.5 1.5S18.83 13 18 13z"/></svg>`,
    "Sanskrit": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V7h8v2z"/></svg>`,
    "Skill Education": `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`
  };
  return icons[subject] || `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm2.07-7.75l-.9.92c-.41.38-.72.76-.72 1.33H11v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`;
}

// Local Storage helpers
function loadStateFromLocalStorage() {
  const key = `teachifyy_state_grade_${AppState.studentGrade}`;
  const savedState = localStorage.getItem(key);
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      AppState = { ...AppState, ...parsed };
      
      // Enrich loaded history with messages/previews if missing
      if (AppState.chatHistory && Array.isArray(AppState.chatHistory)) {
        AppState.chatHistory.forEach((session) => {
          if (!session.messages || !session.preview) {
            const defaultMatch = defaultChatHistory.find(d => d.title === session.title);
            if (defaultMatch) {
              session.preview = defaultMatch.preview;
              session.messages = defaultMatch.messages;
            } else {
              session.preview = session.preview || "AI Tutor session on this topic.";
              session.messages = session.messages || [
                { sender: "student", text: `I have a question about ${session.title}`, time: "12:00 PM" },
                { sender: "tutor", text: `I'd love to help you understand ${session.title}. What concept is confusing?`, time: "12:01 PM" }
              ];
            }
          }
        });
      }
      
      if (AppState.resolvedDoubtsHistory && Array.isArray(AppState.resolvedDoubtsHistory)) {
        AppState.resolvedDoubtsHistory.forEach((run) => {
          if (run.beforeScore === undefined) {
            const defaultMatch = defaultResolvedDoubtsHistory.find(d => d.topic === run.topic);
            if (defaultMatch) {
              run.method = defaultMatch.method;
              run.beforeScore = defaultMatch.beforeScore;
              run.afterScore = defaultMatch.afterScore;
              run.attempts = defaultMatch.attempts;
              run.details = defaultMatch.details;
            } else {
              run.method = "AI Tutor";
              run.beforeScore = 33;
              run.afterScore = 100;
              run.attempts = 1;
              run.details = "Resolved via AI Tutor tutoring sessions.";
            }
          }
        });
      }

      // Clean up any historical percentage formatting bugs (e.g., 2233% and 3333% correct)
      let stateChanged = false;
      if (AppState.testHistory && Array.isArray(AppState.testHistory)) {
        AppState.testHistory.forEach(run => {
          if (run.score > run.total) {
            run.score = Math.round((run.score / 100) * run.total);
            stateChanged = true;
          }
        });
      }
      
      if (stateChanged) {
        saveStateToLocalStorage();
      }
    } catch (e) {
      console.error("Error parsing saved state: ", e);
    }
  }
}

function saveStateToLocalStorage() {
  const key = `teachifyy_state_grade_${AppState.studentGrade}`;
  localStorage.setItem(key, JSON.stringify({
    completedTopics: AppState.completedTopics,
    doubtTopics: AppState.doubtTopics,
    revisedTopics: AppState.revisedTopics,
    inProgressTopics: AppState.inProgressTopics || [],
    chatHistory: AppState.chatHistory,
    testHistory: AppState.testHistory,
    resolvedDoubtsHistory: AppState.resolvedDoubtsHistory,
    doubtDetails: AppState.doubtDetails || {}
  }));
}

// ── SIDEBAR NAV TAB SWITCHING ──
function initSidebarTabs() {
  const buttons = document.querySelectorAll(".nav-tab-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
  
  // Connect dashboard welcome quick link
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    alert("Logging out student session...");
    window.location.search = ""; // clear params
  });
}

function switchTab(tabId) {
  // Update sidebar active classes
  const buttons = document.querySelectorAll(".nav-tab-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    }
  });
  
  // Hide active audio speech if switching away from AI Tutor
  if (AppState.currentActiveTab === "ai-tutor" && tabId !== "ai-tutor") {
    stopActiveSpeech();
  }
  
  AppState.currentActiveTab = tabId;
  
  // Toggle panels
  const panels = document.querySelectorAll(".view-panel");
  panels.forEach(panel => {
    panel.classList.remove("active");
  });
  
  const targetPanel = document.getElementById(`panel-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }
  
  // Render specifically needed views
  if (tabId === "dashboard") {
    renderDashboardElements();
  } else if (tabId === "syllabus") {
    renderSyllabusList();
  } else if (tabId === "doubt") {
    renderDoubtsList();
  } else if (tabId === "tests") {
    renderTestsOverview();

  } else if (tabId === "history") {
    renderHistoryView();
  }
}

// ── NOTIFICATION CENTER ──
function initNotificationCenter() {
  const notifBtn = document.getElementById("notif-btn");
  const panel = document.getElementById("notif-panel");
  const clearBtn = document.getElementById("clear-notif-btn");
  
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("show");
  });
  
  clearBtn.addEventListener("click", () => {
    const list = document.getElementById("notif-list-items");
    list.innerHTML = `<li class="notif-item" style="justify-content: center; padding: 16px; color: var(--graphite);">No notifications</li>`;
    const dot = document.querySelector(".notif-dot");
    if (dot) dot.style.display = "none";
  });
  
  document.addEventListener("click", () => {
    panel.classList.remove("show");
  });
}

// ── VIEW 1: HOME/DASHBOARD RENDERS ──
function initDashboardViews() {
  // Set profile metadata
  document.getElementById("student-avatar-monogram").textContent = AppState.studentAvatar;
  document.getElementById("student-display-name").textContent = AppState.studentName;
  document.getElementById("student-display-class").textContent = `Class ${AppState.studentGrade} | ${AppState.studentBoard}`;
  
  // Click handler for filter chips
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderContinueLearningCards(chip.dataset.filter);
    });
  });

  const viewAllBtn = document.getElementById("view-all-schedule-btn");
  viewAllBtn.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("tests");
  });

  // Topics Mastered modal trigger
  const masteryCard = document.getElementById("kpi-card-mastery");
  const masteryModal = document.getElementById("topics-mastered-modal");
  const closeMasteryBtn = document.getElementById("close-mastery-modal-btn");
  
  if (masteryCard && masteryModal) {
    masteryCard.addEventListener("click", () => {
      loadMasteredTopicsList();
      masteryModal.style.display = "flex";
      masteryModal.offsetHeight; // Force reflow
      masteryModal.classList.add("active");
    });
  }
  if (closeMasteryBtn && masteryModal) {
    closeMasteryBtn.addEventListener("click", () => {
      masteryModal.classList.remove("active");
      setTimeout(() => {
        masteryModal.style.display = "none";
      }, 300);
    });
    masteryModal.addEventListener("click", (e) => {
      if (e.target === masteryModal) {
        masteryModal.classList.remove("active");
        setTimeout(() => {
          masteryModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Hover handlers for calendar days preview schedule tooltip
  const calendarDays = document.querySelectorAll(".calendar-day");
  calendarDays.forEach(day => {
    day.addEventListener("mouseenter", () => {
      const dayKey = day.getAttribute("data-day");
      if (dayKey) {
        showDayScheduleTooltip(day, dayKey);
      }
    });
    day.addEventListener("mouseleave", () => {
      hideDayScheduleTooltip();
    });
  });

  // Solve Doubts CTA recommendation box button handler
  const recCtaBtn = document.getElementById("dashboard-rec-cta");
  if (recCtaBtn) {
    recCtaBtn.addEventListener("click", () => {
      const query = recCtaBtn.dataset.query;
      if (query) {
        switchTab("ai-tutor");
        const textBox = document.getElementById("chat-user-textbox");
        if (textBox) {
          textBox.value = query;
          const sendBtn = document.getElementById("chat-send-trigger-btn");
          if (sendBtn) sendBtn.disabled = false;
          textBox.focus();
          textBox.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  // Milestone claim claim click handler
  const claimBtn = document.getElementById("milestone-claim-btn");
  if (claimBtn) {
    claimBtn.addEventListener("click", () => {
      const celebrationOverlay = document.getElementById("milestone-toast-celebration");
      if (celebrationOverlay) {
        celebrationOverlay.classList.remove("active");
        setTimeout(() => {
          celebrationOverlay.style.display = "none";
          const container = document.getElementById("confetti-canvas-container");
          if (container) container.innerHTML = "";
        }, 400);
      }
    });
  }

  // Trigger celebratory milestone toast overlay
  setTimeout(() => {
    triggerMilestoneCelebration();
  }, 800);
}

function renderDashboardElements() {
  // Update header welcome info
  document.getElementById("welcome-student-name").textContent = AppState.studentName;
  document.getElementById("streak-days-text").textContent = `${AppState.streak}-day streak`;
  
  const welcomeGreeting = document.getElementById("welcome-greeting-text");
  if (welcomeGreeting) {
    const hours = new Date().getHours();
    let greeting = "Good morning";
    if (hours >= 12 && hours < 17) {
      greeting = "Good afternoon";
    } else if (hours >= 17) {
      greeting = "Good evening";
    }
    welcomeGreeting.textContent = greeting;
  }
  
  // Calculate total syllabus items
  let totalTopics = 0;
  let masteredCount = AppState.completedTopics.length;
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  Object.keys(activeSyllabus).forEach(subject => {
    (activeSyllabus[subject] || []).forEach(chap => {
      totalTopics += chap.topics.length;
    });
  });
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  // If Class 8 placeholder, let's assume 5 topics exist in total for KPI display
  if (AppState.studentGrade === "8") {
    totalTopics = 5;
  }
  
  // Dynamic Confidence Score & Bars
  let subjects = Object.keys(activeSyllabus);
  if (AppState.studentGrade === "8") {
    subjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
  }
  subjects = sortSubjects(subjects);
  // Global SUBJECT_COLORS will be used here
  
  let subjectScores = {};
  let totalSubjectScoreSum = 0;
  let validSubjectCount = 0;
  
  const barsContainer = document.getElementById("subject-confidence-bars-container");
  barsContainer.innerHTML = "";
  
  if (subjects.length === 0 || AppState.studentGrade === "11" || AppState.studentGrade === "12") {
    barsContainer.innerHTML = `<div style="text-align: center; color: var(--graphite); padding: 16px; font-size: 13px;">Syllabus structure not finalized yet.</div>`;
  } else {
    subjects.forEach(sub => {
      let subTopics = 0;
      let subCompleted = 0;
      
      const chapters = activeSyllabus[sub] || [];
      chapters.forEach(chap => {
        chap.topics.forEach(t => {
          subTopics++;
          if (AppState.completedTopics.includes(t.name)) {
            subCompleted++;
          }
        });
      });
      
      let progressPercent = 0;
      if (subTopics > 0) {
        progressPercent = Math.round((subCompleted / subTopics) * 100);
      }
      
      subjectScores[sub] = progressPercent;
      totalSubjectScoreSum += progressPercent;
      validSubjectCount++;
      
      // Let's get the chapters and subtopics for this subject
      let subtopicsHtml = "";
      chapters.forEach(chap => {
        chap.topics.forEach(t => {
          const isMastered = AppState.completedTopics.includes(t.name);
          const isDoubt = AppState.doubtTopics.includes(t.name);
          
          let statusText = "Pending";
          let statusClass = "pending";
          if (isMastered) {
            statusText = "Mastered";
            statusClass = "mastered";
          } else if (isDoubt) {
            statusText = "Needs Revision";
            statusClass = "needs-revision";
          }
          
          subtopicsHtml += `
            <div class="subtopic-drawer-row">
              <span class="subtopic-drawer-name">
                <span class="status-indicator ${statusClass}"></span>
                ${t.name}
              </span>
              <span class="subtopic-drawer-status ${statusClass}">${statusText}</span>
            </div>
          `;
        });
      });
      
      if (!subtopicsHtml) {
        subtopicsHtml = `<div style="text-align: center; padding: 10px; font-size: 11px; color: var(--graphite);">No sub-topics in this syllabus.</div>`;
      }

      // Render Bar
      const displaySubName = sub === "Mathematics" ? "Maths" : sub;
      const isLocked = (AppState.studentGrade === "8");
      const progressLabel = isLocked ? "Locked" : `${progressPercent}%`;
      const fillWidth = isLocked ? 0 : progressPercent;
      const trackStyle = isLocked ? "opacity: 0.6; border-style: dashed;" : "";
      const barColor = isLocked ? "var(--dove)" : (SUBJECT_COLORS[sub] || "var(--blue)");
      
      const barItem = document.createElement("div");
      barItem.className = "bar-progress-item";
      barItem.innerHTML = `
        <div class="bar-labels-row">
          <span>
            ${displaySubName}
          </span>
          <span style="${isLocked ? 'font-size: 11px; color: var(--graphite);' : ''}">${progressLabel}</span>
        </div>
        <div class="pencil-progress-track" style="${trackStyle}">
          <div class="pencil-fill" style="width: ${fillWidth}%; opacity: ${fillWidth === 0 ? 0 : 1};">
            <div class="pencil-tip-container">
              <svg viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
                <path d="M18 0 L0 10 L18 20 Z" fill="#FDE4C3" stroke="#1C1C1C" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M6 6.67 L0 10 L6 13.33 Z" fill="#2B3542" stroke="#1C1C1C" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="pencil-body" style="--bar-color: ${barColor};"></div>
            <div class="pencil-ferrule"></div>
            <div class="pencil-eraser"></div>
          </div>
        </div>
      `;
      
      barsContainer.appendChild(barItem);
    });
  }
  
  let confidenceScore = 0;
  if (validSubjectCount > 0 && !isPendingClass) {
    confidenceScore = Math.round(totalSubjectScoreSum / validSubjectCount);
  }
  
  // Render KPI values and animate them on dashboard load
  if (isPendingClass) {
    document.getElementById("kpi-mastery").innerHTML = `0<span class="kpi-subval">/0</span>`;
    document.getElementById("kpi-confidence").textContent = "N/A";
    document.getElementById("kpi-hours").textContent = "0.0h";
    document.getElementById("kpi-quiz-average").textContent = "N/A";
    
    document.getElementById("kpi-bar-mastery").style.width = "0%";
    document.getElementById("kpi-bar-confidence").style.width = "0%";
    document.getElementById("kpi-bar-quiz-average").style.width = "0%";
    document.getElementById("kpi-bar-hours").style.width = "0%";
    
    const ringFill = document.getElementById("streak-progress-fill");
    if (ringFill) ringFill.style.strokeDashoffset = 69.1;
    
    document.getElementById("gauge-circle-fill").style.strokeDashoffset = 314.16;
    document.getElementById("gauge-score-value").textContent = "N/A";
  } else {
    // Animate Mastery
    animateNumberValue("kpi-mastery", 0, masteredCount, 1000, (val) => {
      return `${Math.floor(val)}<span class="kpi-subval">/${totalTopics}</span>`;
    });
    // Animate Confidence Score
    animateNumberValue("kpi-confidence", 0, confidenceScore, 1000);
    // Animate Hours
    animateNumberValue("kpi-hours", 0, AppState.studyHours, 1000, (val) => {
      return `${val.toFixed(1)}h`;
    });
    // Animate Gauge score value
    animateNumberValue("gauge-score-value", 0, confidenceScore, 1000, (val) => {
      return `${Math.floor(val)}%`;
    });
    
    document.getElementById("kpi-quiz-average").textContent = AppState.quizAverage;
    
    // Animate progress bar fills
    const masteryPercent = totalTopics > 0 ? (masteredCount / totalTopics) * 100 : 0;
    const quizAverageMap = { "A+": 98, "A": 92, "A-": 88, "B+": 83, "B": 75, "B-": 70, "C+": 65, "C": 58, "N/A": 0 };
    const quizPercent = quizAverageMap[AppState.quizAverage] || 0;
    const hoursPercent = Math.min((AppState.studyHours / 6) * 100, 100);
    
    setTimeout(() => {
      const barMast = document.getElementById("kpi-bar-mastery");
      if (barMast) barMast.style.width = `${masteryPercent}%`;
      const barConf = document.getElementById("kpi-bar-confidence");
      if (barConf) barConf.style.width = `${confidenceScore}%`;
      const barQuiz = document.getElementById("kpi-bar-quiz-average");
      if (barQuiz) barQuiz.style.width = `${quizPercent}%`;
      const barHrs = document.getElementById("kpi-bar-hours");
      if (barHrs) barHrs.style.width = `${hoursPercent}%`;
    }, 100);
    
    // Animate gauge stroke offset (Circumference = 314.16)
    const strokeOffset = 314.16 - (314.16 * confidenceScore) / 100;
    setTimeout(() => {
      const gcFill = document.getElementById("gauge-circle-fill");
      if (gcFill) {
        gcFill.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)";
        gcFill.style.strokeDashoffset = strokeOffset;
      }
    }, 100);
    
    // Update streak progress ring around flame based on checked days in strip (3/7Checked = ~43%)
    const checkedDaysCount = 3; // We have 3 checked days in the week strip
    const streakPercent = checkedDaysCount / 7;
    const strokeDasharray = 69.1;
    const streakOffset = strokeDasharray - (strokeDasharray * streakPercent);
    setTimeout(() => {
      const ringFill = document.getElementById("streak-progress-fill");
      if (ringFill) {
        ringFill.style.strokeDashoffset = streakOffset;
      }
    }, 150);
    
    // Trigger sparkline draw animation
    const sparklinePath = document.getElementById("sparkline-trend-path");
    if (sparklinePath) {
      const length = sparklinePath.getTotalLength() || 100;
      sparklinePath.style.strokeDasharray = length;
      sparklinePath.style.strokeDashoffset = length;
      sparklinePath.getBoundingClientRect(); // force layout
      sparklinePath.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1)";
      sparklinePath.style.strokeDashoffset = 0;
    }
  }
  
  // Update recommendation widget message
  const recBox = document.getElementById("dashboard-recommendation-box");
  const recCta = document.getElementById("dashboard-rec-cta");
  const recHeadline = document.getElementById("dashboard-rec-headline");
  const recBody = document.getElementById("dashboard-rec-body");
  
  if (isPendingClass) {
    recHeadline.textContent = "Syllabus Content Pending";
    recBody.textContent = `Class ${AppState.studentGrade} syllabus is not uploaded yet. Content cards, doubt solvers, and quizzes will unlock automatically.`;
    recBox.classList.remove("doubt-detected-cta");
    recCta.style.display = "none";
  } else if (AppState.studentGrade === "7" && AppState.doubtTopics.includes("Conduction & Convection")) {
    recHeadline.textContent = "Heat Transfer topic has a doubt.";
    recBody.textContent = "You have 1 pending doubt in Science. Try asking the AI tutor to explain heat convection.";
    recBox.classList.add("doubt-detected-cta");
    recCta.style.display = "inline-block";
    recCta.textContent = "Solve with AI Tutor →";
    recCta.dataset.query = "Explain Conduction and Convection in heat transfer and help me resolve my doubt.";
  } else if (AppState.doubtTopics.length > 0) {
    const topic = AppState.doubtTopics[0];
    recHeadline.textContent = `Doubt detected in ${topic}.`;
    recBody.textContent = "Solve the pending doubt with AI Tutor to recover your confidence score.";
    recBox.classList.add("doubt-detected-cta");
    recCta.style.display = "inline-block";
    recCta.textContent = "Solve with AI Tutor →";
    recCta.dataset.query = `Explain ${topic} and help me resolve my doubt.`;
  } else {
    recHeadline.textContent = "All core subjects look strong!";
    recBody.textContent = "Syllabus progress is on track. Take a chapter test to check board readiness.";
    recBox.classList.remove("doubt-detected-cta");
    recCta.style.display = "inline-block";
    recCta.textContent = "Ask AI Tutor →";
    recCta.dataset.query = "I want to take a custom quiz to test my knowledge.";
  }
  
  // Render Progress charts on the dashboard
  renderProgressCharts();
  
  // Render Dynamic Filter Chips
  renderLearningFilterChips();
  
  // Load Continue Learning cards
  renderContinueLearningCards("all");
}

function renderLearningFilterChips() {
  const container = document.getElementById("learning-filter-chips-container");
  if (!container) return;
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let subjects = Object.keys(activeSyllabus);
  
  if (AppState.studentGrade === "8") {
    subjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
  }
  
  subjects = sortSubjects(subjects);
  
  if (subjects.length === 0) {
    container.innerHTML = "";
    return;
  }
  
  let html = `<button class="filter-chip active" data-filter="all">All</button>`;
  subjects.forEach(sub => {
    let displaySub = sub === "Mathematics" ? "Maths" : sub;
    html += `<button class="filter-chip" data-filter="${sub}">${displaySub}</button>`;
  });
  
  container.innerHTML = html;
  
  // Re-attach click listeners
  const filterChips = container.querySelectorAll(".filter-chip");
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderContinueLearningCards(chip.dataset.filter);
    });
  });
}

function renderContinueLearningCards(filterSubject) {
  const container = document.getElementById("continue-lessons-container");
  container.innerHTML = "";
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  if (isPendingClass) {
    container.innerHTML = `
      <div style="grid-column: span 2; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; border: 1px dashed var(--dove); border-radius: 24px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--graphite)" stroke-width="1.5" style="margin-bottom: 12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <h4 style="font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 4px;">Content Coming Soon</h4>
        <p style="font-size: 13px; color: var(--graphite); max-width: 300px;">Personalized lesson cards will be available once the class content structure is updated.</p>
      </div>
    `;
    return;
  }
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let lessons = [];
  const sortedSubs = sortSubjects(Object.keys(activeSyllabus));
  
  sortedSubs.forEach((subject, subIndex) => {
    const chapters = activeSyllabus[subject] || [];
    if (chapters.length > 0) {
      // Pick first topic
      const firstChap = chapters[0];
      if (firstChap.topics && firstChap.topics.length > 0) {
        const firstTopic = firstChap.topics[0];
        const isCompleted = AppState.completedTopics.includes(firstTopic.name);
        const percent = isCompleted ? 100 : (25 + (subIndex * 20) % 60);
        
        lessons.push({
          subject: subject,
          title: firstTopic.name,
          modName: "Module 1",
          percent: percent,
          desc: firstTopic.desc,
          icon: getSubjectIconSvg(subject),
          pinkStyle: subIndex % 2 === 1
        });
      }
    }
  });
  
  // Filter based on chip selection
  const filtered = lessons.filter(l => filterSubject === "all" || l.subject === filterSubject);
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 24px; color: var(--graphite);">No active lessons for this filter</div>`;
    return;
  }
  
  filtered.forEach(lesson => {
    const card = document.createElement("div");
    card.className = "lesson-card";
    card.setAttribute("data-glow", "");
    card.setAttribute("data-glow-color", lesson.pinkStyle ? "pink" : "blue");
    
    // Check if lesson is completed in state
    const isCompleted = AppState.completedTopics.includes(lesson.title);
    const displayPercent = isCompleted ? 100 : lesson.percent;
    
    card.innerHTML = `
      <div class="lesson-top-row">
        <div class="lesson-avatar-icon ${lesson.pinkStyle ? 'pink-style' : ''}">${lesson.icon}</div>
        <div class="lesson-meta-details">
          <span class="lesson-mod-lbl">${lesson.modName} · ${lesson.subject === "Social Science" ? "Social Science" : lesson.subject}</span>
          <span class="lesson-percent-done">${displayPercent}% Done</span>
        </div>
      </div>
      <h4 class="lesson-title">${lesson.title}</h4>
      <p class="lesson-desc">${lesson.desc}</p>
      <div class="lesson-footer">
        <button class="btn-primary continue-action-btn ${getSubjectClassName(lesson.subject)}" onclick="resumeLesson('${lesson.title.replace(/'/g, "\\'")}', '${lesson.subject}')">${isCompleted ? 'Review Lesson' : 'Resume Lesson'}</button>
        <button class="lesson-dot-menu">•••</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function resumeLesson(topicName, subject) {
  // Try to find the topic inside our database to set context
  activeSyllabusSubject = subject;
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  const chapters = activeSyllabus[subject] || [];
  
  let foundTopic = null;
  chapters.forEach(chap => {
    const matched = chap.topics.find(t => t.name === topicName);
    if (matched) foundTopic = { ...matched, chapter: chap.chapter };
  });
  
  if (foundTopic) {
    activeSyllabusTopic = foundTopic;
    switchTab("syllabus");
    renderSyllabusList();
    showTopicInDrawer(foundTopic, subject);
  } else {
    // If not found (e.g. customized fallback), launch AI tutor directly
    switchTab("ai-tutor");
    startAIChatOnTopic(topicName);
  }
}

// ── VIEW 2: AI TUTOR WORKSPACE LOGIC ──
// ── VIEW 2: AI TUTOR WORKSPACE LOGIC ──
function initChatTutorControls() {
  const textBox = document.getElementById("chat-user-textbox");
  const sendBtn = document.getElementById("chat-send-trigger-btn");
  const clearChat = document.getElementById("clear-chat-btn");
  const newChat = document.getElementById("new-chat-btn");
  const voiceBtn = document.getElementById("chat-voice-btn");
  
  // Set default button disabled
  sendBtn.disabled = true;
  
  // Render sidebar old chats
  renderChatSidebar();
  
  textBox.addEventListener("input", () => {
    sendBtn.disabled = textBox.value.trim() === "";
  });
  
  textBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && textBox.value.trim() !== "") {
      handleUserMessage(textBox.value.trim());
      textBox.value = "";
      sendBtn.disabled = true;
    }
  });
  
  sendBtn.addEventListener("click", () => {
    if (textBox.value.trim() !== "") {
      handleUserMessage(textBox.value.trim());
      textBox.value = "";
      sendBtn.disabled = true;
    }
  });
  
  // Language selection pills
  const langPills = document.querySelectorAll(".lang-pill");
  langPills.forEach(pill => {
    pill.addEventListener("click", () => {
      langPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      
      // Update welcome card and chips instantly on toggle
      updateChatWelcomeCard();
      renderChatQuickPrompts();
    });
  });
  
  clearChat.addEventListener("click", () => {
    activeChatSessionTitle = null;
    document.getElementById("chat-conversation-container").innerHTML = "";
    document.getElementById("chat-welcome-onboarding").style.display = "flex";
    document.getElementById("chat-quick-prompts").style.display = "flex";
    const recentReel = document.getElementById("chat-recent-lessons-section");
    if (recentReel) recentReel.style.display = "block";
    document.getElementById("chat-followups-panel").style.display = "none";
    stopActiveSpeech();
    
    // Update welcome card
    updateChatWelcomeCard();
    renderChatQuickPrompts();
    renderRecentTopicsReel();
    renderChatSidebar();
  });
  
  newChat.addEventListener("click", () => {
    clearChat.click();
  });
  
  // Simulated Voice Input
  voiceBtn.addEventListener("click", () => {
    voiceBtn.classList.toggle("active-recording");
    if (voiceBtn.classList.contains("active-recording")) {
      textBox.placeholder = "Listening... Speak now";
      setTimeout(() => {
        voiceBtn.classList.remove("active-recording");
        textBox.placeholder = "Ask your learning question...";
        textBox.value = AppState.studentGrade === "7" ? "Explain Photosynthesis Mechanics" : "Explain Quadratic Equations";
        sendBtn.disabled = false;
        // Trigger send button activation via artificial input event
        textBox.dispatchEvent(new Event("input"));
      }, 2500);
    }
  });

  // Floating Action Menu for Attach Button
  const attachBtn = document.getElementById("chat-attach-btn");
  const attachMenu = document.getElementById("chat-attach-menu");
  if (attachBtn && attachMenu) {
    attachBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      attachBtn.classList.toggle("active");
      const isVisible = attachMenu.style.display === "flex";
      attachMenu.style.display = isVisible ? "none" : "flex";
    });
    
    // Close attachment menu when clicking anywhere else
    document.addEventListener("click", (e) => {
      if (!attachBtn.contains(e.target) && !attachMenu.contains(e.target)) {
        attachMenu.style.display = "none";
        attachBtn.classList.remove("active");
      }
    });
  }

  // Run initial chat states
  updateChatWelcomeCard();
  renderChatQuickPrompts();
  renderRecentTopicsReel();
  updateChatContinuityStrip();
}

function renderChatSidebar() {
  const container = document.getElementById("chat-sidebar-old-chats-list");
  if (!container) return;
  container.innerHTML = "";
  
  if (!AppState.chatHistory || AppState.chatHistory.length === 0) {
    container.innerHTML = `<div style="padding: 16px 20px; font-size: 13px; color: var(--graphite); text-align: center;">No old chats.</div>`;
    return;
  }
  
  AppState.chatHistory.forEach((session) => {
    const item = document.createElement("button");
    item.className = "chat-sidebar-item";
    if (activeChatSessionTitle === session.title) {
      item.classList.add("active");
    }
    
    item.innerHTML = `
      <span class="chat-sidebar-item-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </span>
      <span class="chat-sidebar-item-text" title="${session.title}">${session.title}</span>
    `;
    
    item.addEventListener("click", () => {
      loadChatSession(session.title);
    });
    
    container.appendChild(item);
  });
}

function loadChatSession(title) {
  const session = AppState.chatHistory.find(c => c.title === title);
  if (!session) return;
  
  activeChatSessionTitle = title;
  
  // Highlight active sidebar item
  document.querySelectorAll(".chat-sidebar-item").forEach(item => {
    const textEl = item.querySelector(".chat-sidebar-item-text");
    if (textEl && textEl.textContent === title) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  
  // Hide onboarding welcome state
  document.getElementById("chat-welcome-onboarding").style.display = "none";
  document.getElementById("chat-quick-prompts").style.display = "none";
  const recentSection = document.getElementById("chat-recent-lessons-section");
  if (recentSection) recentSection.style.display = "none";
  document.getElementById("chat-followups-panel").style.display = "none";
  stopActiveSpeech();
  
  // Load conversation thread into container
  const container = document.getElementById("chat-conversation-container");
  container.innerHTML = "";
  
  const messages = session.messages || [];
  messages.forEach(msg => {
    const row = document.createElement("div");
    row.className = `chat-message-row ${msg.sender}`;
    if (msg.sender === "student") {
      row.innerHTML = `
        <div class="chat-bubble-content">
          <p class="chat-text-paragraph">${msg.text}</p>
          <span class="chat-bubble-meta-time">${msg.time} ✓✓</span>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="chat-bubble-tutor-avatar">
          <svg class="tutor-solid-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: var(--white);"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
        </div>
        <div class="chat-bubble-content">
          <div class="chat-bubble-actions-overlay">
            <button class="bubble-action-link-btn" onclick="copyBubbleText(this)">Copy</button>
            <button class="bubble-action-link-btn" onclick="regenerateBubbleText(this)">Regenerate</button>
            <button class="bubble-action-link-btn" onclick="explainSimplerBubbleText(this)">Explain Simpler</button>
          </div>
          <div class="chat-text-paragraph">${msg.text}</div>
          <span class="chat-bubble-meta-time-tutor" style="font-size: 11px; color: var(--graphite); margin-top: 6px; display: block; text-align: left;">${msg.time}</span>
        </div>
      `;
    }
    container.appendChild(row);
  });
  
  scrollChatToBottom();
}

function updateChatContinuityStrip() {
  const continuityStrip = document.getElementById("chat-continuity-strip");
  const continuityText = document.getElementById("chat-continuity-text");
  if (!continuityStrip || !continuityText) return;
  
  if (activeSyllabusTopic) {
    continuityText.textContent = `${activeSyllabusSubject} · ${activeSyllabusTopic.name}`;
    continuityStrip.style.display = "flex";
  } else {
    if (activeSyllabusSubject) {
      continuityText.textContent = `${activeSyllabusSubject} · Pick a topic to start learning`;
    } else {
      continuityText.textContent = `Mathematics · Quadratic Equations`;
    }
    continuityStrip.style.display = "flex";
  }
}

function updateChatWelcomeCard() {
  const greetingEl = document.getElementById("chat-onboarding-greeting");
  const introEl = document.getElementById("chat-onboarding-intro");
  const textBox = document.getElementById("chat-user-textbox");
  
  if (!greetingEl || !introEl) return;
  
  const activePill = document.querySelector(".lang-pill.active");
  const selectedLang = activePill ? activePill.getAttribute("data-lang") : "English";
  
  // Time greeting calculation
  const hours = new Date().getHours();
  let timeGreeting = "morning";
  if (hours >= 12 && hours < 17) {
    timeGreeting = "afternoon";
  } else if (hours >= 17) {
    timeGreeting = "evening";
  }
  
  const firstName = AppState.studentName ? AppState.studentName.split(" ")[0] : "Hammad";
  
  let recommendTopic = "Quadratic Equations";
  let isDoubt = false;
  
  if (activeSyllabusTopic) {
    recommendTopic = activeSyllabusTopic.name;
  } else if (AppState.doubtTopics && AppState.doubtTopics.length > 0) {
    recommendTopic = AppState.doubtTopics[0];
    isDoubt = true;
  } else {
    const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
    const mathChapters = activeSyllabus["Mathematics"] || [];
    if (mathChapters.length > 0 && mathChapters[0].topics.length > 0) {
      recommendTopic = mathChapters[0].topics[0].name;
    }
  }
  
  // Custom translations
  if (selectedLang === "English") {
    greetingEl.textContent = `Good ${timeGreeting}, ${firstName}!`;
    if (isDoubt) {
      introEl.textContent = `Ready to resolve your doubt on ${recommendTopic}? Ask me any questions or choose an option below.`;
    } else {
      introEl.textContent = `Pick up where you left off on ${recommendTopic}? I can explain concepts, run quizzes, or summarize chapters for you.`;
    }
    if (textBox) textBox.placeholder = "Ask your learning question...";
  } else if (selectedLang === "Hindi") {
    const greetingHindi = timeGreeting === "morning" ? "प्रभात" : (timeGreeting === "afternoon" ? "दोपहर" : "संध्या");
    greetingEl.textContent = `शुभ ${greetingHindi}, ${firstName}!`;
    if (isDoubt) {
      introEl.textContent = `क्या आप ${recommendTopic} शंका का समाधान करना चाहते हैं? मुझसे प्रश्न पूछें या नीचे दिए गए विकल्पों को चुनें।`;
    } else {
      introEl.textContent = `क्या आप ${recommendTopic} से आगे पढ़ना चाहेंगे? मैं आपको विषय समझा सकता हूँ, क्विज ले सकता हूँ या सारांश दे सकता हूँ।`;
    }
    if (textBox) textBox.placeholder = "अपना प्रश्न यहाँ पूछें...";
  } else if (selectedLang === "Hinglish") {
    greetingEl.textContent = `Good ${timeGreeting}, ${firstName}!`;
    if (isDoubt) {
      introEl.textContent = `${recommendTopic} doubt solve karne ke liye taiyar hain? Apna doubt pucho ya neeche se start karo.`;
    } else {
      introEl.textContent = `${recommendTopic} par jahan choda tha, wahan se continue karein? Main concepts samjha sakta hoon, quiz generate kar sakta hoon.`;
    }
    if (textBox) textBox.placeholder = "Apna doubt/question pucho...";
  }
}

function renderChatQuickPrompts() {
  const container = document.getElementById("chat-quick-prompts");
  if (!container) return;
  
  const activePill = document.querySelector(".lang-pill.active");
  const selectedLang = activePill ? activePill.getAttribute("data-lang") : "English";
  
  container.innerHTML = "";
  
  const promptsData = {
    English: [
      { label: "Explain this topic", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`, prompt: "Explain this topic" },
      { label: "Create quiz", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92c-.41.38-.72.76-.72 1.33H11v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`, prompt: "Create quiz" },
      { label: "Summarize chapter", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`, prompt: "Summarize chapter" },
      { label: "Help with assignment", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13l.71-.71a.998.998 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71l-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"/></svg>`, prompt: "Help with assignment" },
      { label: "Exam preparation", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`, prompt: "Exam preparation" }
    ],
    Hindi: [
      { label: "विषय समझाएं", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`, prompt: "विषय समझाएं" },
      { label: "क्विज बनाएं", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92c-.41.38-.72.76-.72 1.33H11v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`, prompt: "क्विज बनाएं" },
      { label: "अध्याय का सारांश", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`, prompt: "अध्याय का सारांश" },
      { label: "असाइनमेंट में मदद", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13l.71-.71a.998.998 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71l-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"/></svg>`, prompt: "असाइनमेंट में मदद" },
      { label: "परीक्षा की तैयारी", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`, prompt: "परीक्षा की तैयारी" }
    ],
    Hinglish: [
      { label: "Topic samjhao", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`, prompt: "Topic samjhao" },
      { label: "Quiz banao", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92c-.41.38-.72.76-.72 1.33H11v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`, prompt: "Quiz banao" },
      { label: "Chapter summarize karo", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`, prompt: "Chapter summarize karo" },
      { label: "Assignment me help", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 10h11v2H3zm0-2h11V6H3zm0 8h7v-2H3zm15.01-3.13l.71-.71a.998.998 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71l-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"/></svg>`, prompt: "Assignment me help" },
      { label: "Exam prep", icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`, prompt: "Exam prep" }
    ]
  };
  
  const activePrompts = promptsData[selectedLang] || promptsData.English;
  const colorClasses = ["rot-red", "rot-purple", "rot-green", "rot-blue"];
  
  activePrompts.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.className = `prompt-chip-btn ${colorClasses[index % colorClasses.length]}`;
    btn.dataset.prompt = item.prompt;
    btn.innerHTML = `
      <span class="prompt-icon">${item.icon}</span>
      <span>${item.label}</span>
    `;
    btn.addEventListener("click", () => {
      handlePromptChipClick(item.prompt);
    });
    container.appendChild(btn);
  });
  
  // Contextual doubt chip if doubt is pending (6th chip)
  if (AppState.doubtTopics && AppState.doubtTopics.length > 0) {
    const doubtTopic = AppState.doubtTopics[0];
    const doubtBtn = document.createElement("button");
    doubtBtn.className = "prompt-chip-btn doubt-gradient-chip";
    
    let doubtLabel = `Solve my ${doubtTopic} doubt`;
    let doubtQuery = `Explain ${doubtTopic} and help me resolve my doubt.`;
    
    if (selectedLang === "Hindi") {
      doubtLabel = `${doubtTopic} शंका का समाधान करें`;
      doubtQuery = `${doubtTopic} समझाएं और मेरी शंका दूर करें।`;
    } else if (selectedLang === "Hinglish") {
      doubtLabel = `${doubtTopic} doubt solve karo`;
      doubtQuery = `${doubtTopic} samjhao aur mera doubt solve karo.`;
    }
    
    doubtBtn.dataset.prompt = doubtQuery;
    doubtBtn.innerHTML = `
      <span class="prompt-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </span>
      <span>${doubtLabel}</span>
    `;
    
    doubtBtn.addEventListener("click", () => {
      handleUserMessage(doubtQuery);
    });
    container.appendChild(doubtBtn);
  }
}

function handlePromptChipClick(promptText) {
  const cleanPrompt = promptText.toLowerCase();
  
  if (cleanPrompt.includes("quiz") && activeSyllabusTopic) {
    generateQuizFromTutor(activeSyllabusTopic.name);
  } else if (cleanPrompt.includes("explain this topic") || cleanPrompt.includes("explain") || cleanPrompt.includes("samjhao")) {
    const currentTopicName = activeSyllabusTopic ? activeSyllabusTopic.name : "Quadratic Equations";
    handleUserMessage(`Explain ${currentTopicName}`);
  } else {
    handleUserMessage(promptText);
  }
}

function renderRecentTopicsReel() {
  const container = document.getElementById("chat-recent-lessons-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  const recentTopics = [
    { name: "Euclid's Division Lemma", subject: "Mathematics", status: "Mastered" },
    { name: "Chemical Equations", subject: "Science", status: "Mastered" },
    { name: "Nature of Roots", subject: "Mathematics", status: "Doubt Detected" }
  ];
  
  recentTopics.forEach(topic => {
    const card = document.createElement("div");
    card.className = "recent-topic-reel-card";
    card.innerHTML = `
      <div>
        <span class="recent-topic-subject-tag">${topic.subject}</span>
        <h5 class="recent-topic-title-tag">${topic.name}</h5>
      </div>
      <div class="recent-topic-action-label">
        <span>${topic.status}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    `;
    
    card.addEventListener("click", () => {
      // Set active topic
      const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
      let found = null;
      Object.keys(activeSyllabus).forEach(sub => {
        activeSyllabus[sub].forEach(chap => {
          const matched = chap.topics.find(t => t.name === topic.name);
          if (matched) found = { ...matched, subject: sub };
        });
      });
      
      if (found) {
        activeSyllabusSubject = found.subject;
        activeSyllabusTopic = found;
        updateChatContinuityStrip();
        updateChatWelcomeCard();
      }
      
      // Focus textbox
      const textBox = document.getElementById("chat-user-textbox");
      if (textBox) {
        textBox.value = `Explain ${topic.name} in detail.`;
        const sendBtn = document.getElementById("chat-send-trigger-btn");
        if (sendBtn) sendBtn.disabled = false;
        textBox.focus();
      }
    });
    container.appendChild(card);
  });
}

function handleUserMessage(message) {
  // Hide onboarding headers and reels
  document.getElementById("chat-welcome-onboarding").style.display = "none";
  document.getElementById("chat-quick-prompts").style.display = "none";
  const recentSection = document.getElementById("chat-recent-lessons-section");
  if (recentSection) recentSection.style.display = "none";
  
  const container = document.getElementById("chat-conversation-container");
  
  // User bubble
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const userRow = document.createElement("div");
  userRow.className = "chat-message-row student";
  userRow.innerHTML = `
    <div class="chat-bubble-content">
      <p class="chat-text-paragraph">${message}</p>
      <span class="chat-bubble-meta-time">${time} ✓✓</span>
    </div>
  `;
  container.appendChild(userRow);
  scrollChatToBottom();
  
  // If starting a new session, create it in chatHistory
  if (!activeChatSessionTitle) {
    const firstWords = message.split(" ").slice(0, 4).join(" ");
    const newTitle = firstWords + (message.split(" ").length > 4 ? "..." : "");
    activeChatSessionTitle = newTitle;
    
    const newSession = {
      title: newTitle,
      date: "Just now",
      preview: message,
      messages: []
    };
    AppState.chatHistory.unshift(newSession);
    renderChatSidebar();
  }
  
  const currentSession = AppState.chatHistory.find(c => c.title === activeChatSessionTitle);
  if (currentSession) {
    currentSession.messages.push({
      sender: "student",
      text: message,
      time: time
    });
    currentSession.preview = message;
    saveStateToLocalStorage();
    renderChatSidebar();
  }
  
  // Simulate AI Response delay
  showThinkingIndicator();
  setTimeout(() => {
    hideThinkingIndicator();
    generateTutorResponse(message);
  }, 1500);
}

function showThinkingIndicator() {
  const container = document.getElementById("chat-conversation-container");
  const mascotOrb = document.getElementById("chat-tutor-mascot-orb");
  if (mascotOrb) mascotOrb.classList.add("thinking");
  
  const loaderRow = document.createElement("div");
  loaderRow.className = "chat-message-row tutor";
  loaderRow.id = "chat-thinking-indicator";
  loaderRow.innerHTML = `
    <div class="chat-bubble-tutor-avatar">
      <svg class="tutor-solid-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: var(--white);"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
    </div>
    <div class="chat-bubble-content">
      <div class="tutor-thinking-loader-row">
        <span class="thinking-text-label">AI Tutor is thinking</span>
        <div class="thinking-dots-wrap">
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(loaderRow);
  scrollChatToBottom();
}

function hideThinkingIndicator() {
  const indicator = document.getElementById("chat-thinking-indicator");
  if (indicator) indicator.remove();
  const mascotOrb = document.getElementById("chat-tutor-mascot-orb");
  if (mascotOrb) mascotOrb.classList.remove("thinking");
}

function typewriterEffect(element, text, speed = 15, onWordAdded, onComplete) {
  const words = text.split(" ");
  let currentWordIndex = 0;
  element.textContent = "";
  element.classList.add("typewriter-cursor-active");
  
  function appendNextWord() {
    if (currentWordIndex < words.length) {
      element.textContent += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
      currentWordIndex++;
      if (onWordAdded) onWordAdded();
      setTimeout(appendNextWord, speed);
    } else {
      element.classList.remove("typewriter-cursor-active");
      if (onComplete) onComplete();
    }
  }
  appendNextWord();
}

function generateTutorResponse(message) {
  const container = document.getElementById("chat-conversation-container");
  const activePill = document.querySelector(".lang-pill.active");
  const selectedLang = activePill ? activePill.getAttribute("data-lang") : "English";
  
  let key = "generic";
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("quadratic") || msgLower.includes("roots") || msgLower.includes("factoring")) {
    key = "quadratic";
  } else if (msgLower.includes("photosynthesis") || msgLower.includes("chlorophyll") || msgLower.includes("leaves")) {
    key = "photosynthesis";
  }
  
  const dataset = key === "generic" ? DEFAULT_AI_KNOWLEDGE : AI_TUTOR_KNOWLEDGE[key];
  const responseData = dataset[selectedLang];
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tutorRow = document.createElement("div");
  tutorRow.className = "chat-message-row tutor";
  
  let textContent = responseData.text;
  
  tutorRow.innerHTML = `
    <div class="chat-bubble-tutor-avatar">
      <svg class="tutor-solid-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: var(--white);"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
    </div>
    <div class="chat-bubble-content">
      <!-- Hover Actions Menu overlay -->
      <div class="chat-bubble-actions-overlay">
        <button class="bubble-action-link-btn" onclick="copyBubbleText(this)">Copy</button>
        <button class="bubble-action-link-btn" onclick="regenerateBubbleText(this)">Regenerate</button>
        <button class="bubble-action-link-btn" onclick="explainSimplerBubbleText(this)">Explain Simpler</button>
      </div>

      <div class="chat-text-paragraph chat-stream-text-target"></div>
      
      <!-- Source reference - hidden during streaming -->
      <div class="chat-source-reference-card" style="display: none;">
        <div class="source-icon-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H5a2 2 0 0 1-1-1z"/></svg>
        </div>
        <div class="source-details-text">
          <span class="source-lbl-tag">Source</span>
          <span class="source-title-desc">${responseData.source}</span>
        </div>
      </div>

      <!-- Action buttons row - hidden during streaming -->
      <div class="chat-tutor-actions-row" style="display: none;">
        <button class="chat-speaker-play-btn" onclick="speakText(this)" title="Listen to response">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="btn-outline btn-chat-action" onclick="generateQuizFromTutor('${key === "generic" ? "nature of roots" : key}')">Generate Quiz</button>
      </div>

      <span class="chat-bubble-meta-time">${time}</span>
    </div>
  `;
  container.appendChild(tutorRow);
  scrollChatToBottom();
  
  const textTarget = tutorRow.querySelector(".chat-stream-text-target");
  const sourceCard = tutorRow.querySelector(".chat-source-reference-card");
  const actionsRow = tutorRow.querySelector(".chat-tutor-actions-row");
  
  typewriterEffect(textTarget, textContent, 15, () => {
    scrollChatToBottom();
  }, () => {
    textTarget.innerHTML = formatMathText(textContent);
    if (sourceCard) sourceCard.style.display = "flex";
    if (actionsRow) actionsRow.style.display = "flex";
    scrollChatToBottom();
    
    // Save tutor response to active session
    if (activeChatSessionTitle) {
      const currentSession = AppState.chatHistory.find(c => c.title === activeChatSessionTitle);
      if (currentSession) {
        currentSession.messages.push({
          sender: "tutor",
          text: textContent,
          time: time
        });
        currentSession.preview = textContent.slice(0, 60) + (textContent.length > 60 ? "..." : "");
        saveStateToLocalStorage();
        renderChatSidebar();
        renderHistoryView();
      }
    }
    
    // Load followups
    renderChatFollowups(responseData.followups);
  });
}

function renderChatFollowups(followups) {
  const panel = document.getElementById("chat-followups-panel");
  const container = document.getElementById("chat-followup-chips-container");
  
  container.innerHTML = "";
  
  if (!followups || followups.length === 0) {
    panel.style.display = "none";
    return;
  }
  
  panel.style.display = "block";
  followups.forEach(f => {
    const chip = document.createElement("button");
    chip.className = "followup-chip-btn";
    chip.textContent = f;
    chip.addEventListener("click", () => {
      if (f.toLowerCase().includes("quiz")) {
        generateQuizFromTutor(activeSyllabusTopic ? activeSyllabusTopic.name : "Introduction to Quadratics");
      } else {
        handleUserMessage(f);
      }
    });
    container.appendChild(chip);
  });
}

// Global action helpers
window.copyBubbleText = function(btn) {
  const bubble = btn.closest(".chat-bubble-content");
  const textPara = bubble.querySelector(".chat-text-paragraph") || bubble.querySelector(".chat-stream-text-target");
  if (textPara) {
    navigator.clipboard.writeText(textPara.innerText).then(() => {
      const oldText = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = oldText; }, 1500);
    });
  }
};

window.regenerateBubbleText = function(btn) {
  const chatContainer = document.getElementById("chat-conversation-container");
  const messages = Array.from(chatContainer.querySelectorAll(".chat-message-row"));
  let lastUserMessage = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].classList.contains("student")) {
      const p = messages[i].querySelector(".chat-text-paragraph");
      if (p) {
        lastUserMessage = p.textContent;
        break;
      }
    }
  }
  if (lastUserMessage) {
    generateTutorResponse(lastUserMessage);
  } else {
    generateTutorResponse("Explain Quadratic Equations");
  }
};

window.explainSimplerBubbleText = function(btn) {
  handleUserMessage("Can you explain that in simpler terms?");
};

function scrollChatToBottom() {
  const scroller = document.getElementById("chat-scroller-body");
  scroller.scrollTop = scroller.scrollHeight;
}

// Convert simulated LaTeX syntax to bold/italic HTML
function formatMathText(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\\\[([^\]]+)\\\]/g, '<div class="math-block-equation">$1</div>')
    .replace(/\\\(([^\)]+)\\\)/g, '<code class="math-inline-symbol">$1</code>')
    .replace(/###\s*([^\n<]+)/g, '<h4>$1</h4>')
    .replace(/\*\s*([^\n<]+)/g, '<li>$1</li>')
    .replace(/<li>/g, '<ul class="chat-bullet-list"><li>')
    .replace(/<\/li><br>/g, '</li>')
    .replace(/<\/li>(\s*<br>\s*)?<li>/g, '</li><li>');
}

// ── SPEECH SYNTHESIS SPEAKER ──
function speakText(button) {
  // If active speech is speaking, stop it
  if (isSpeakingState) {
    stopActiveSpeech();
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    return;
  }
  
  // Extract text content from parent bubble (ignoring tags/buttons)
  const bubble = button.closest(".chat-bubble-content");
  const clone = bubble.cloneNode(true);
  
  // Remove reference widgets and actions before extracting text
  const trash = clone.querySelectorAll(".chat-source-reference-card, .chat-tutor-actions-row, .chat-bubble-meta-time");
  trash.forEach(t => t.remove());
  
  const cleanText = clone.textContent.trim()
    .replace(/\\\[|\\\]|\\\([^\)]+\\\)/g, "") // remove math symbols
    .replace(/\+/g, " plus ")
    .replace(/\=/g, " equals ");
  
  if ('speechSynthesis' in window) {
    stopActiveSpeech();
    
    currentSpeechUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice/language pitch
    const activePill = document.querySelector(".lang-pill.active");
    const selectedLang = activePill ? activePill.getAttribute("data-lang") : "English";
    if (selectedLang === "Hindi") {
      currentSpeechUtterance.lang = "hi-IN";
    } else {
      currentSpeechUtterance.lang = "en-IN";
    }
    
    currentSpeechUtterance.onend = () => {
      isSpeakingState = false;
      button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    };
    
    isSpeakingState = true;
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    window.speechSynthesis.speak(currentSpeechUtterance);
  } else {
    alert("Audio playback speech synthesis not supported in this browser.");
  }
}

function stopActiveSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingState = false;
  }
}

function startAIChatOnTopic(topicName) {
  switchTab("ai-tutor");
  // Clean first
  document.getElementById("chat-conversation-container").innerHTML = "";
  document.getElementById("chat-welcome-onboarding").style.display = "none";
  document.getElementById("chat-quick-prompts").style.display = "none";
  const recentSection = document.getElementById("chat-recent-lessons-section");
  if (recentSection) recentSection.style.display = "none";
  
  const container = document.getElementById("chat-conversation-container");
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const row = document.createElement("div");
  row.className = "chat-message-row tutor";
  row.innerHTML = `
    <div class="chat-bubble-tutor-avatar">
      <svg class="tutor-solid-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: var(--white);"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
    </div>
    <div class="chat-bubble-content">
      <!-- Hover Actions Menu overlay -->
      <div class="chat-bubble-actions-overlay">
        <button class="bubble-action-link-btn" onclick="copyBubbleText(this)">Copy</button>
        <button class="bubble-action-link-btn" onclick="regenerateBubbleText(this)">Regenerate</button>
        <button class="bubble-action-link-btn" onclick="explainSimplerBubbleText(this)">Explain Simpler</button>
      </div>

      <div class="chat-text-paragraph chat-stream-text-target"></div>
      
      <!-- Action buttons row - hidden during streaming -->
      <div class="chat-tutor-actions-row" style="display: none;">
        <button class="btn-outline btn-chat-action" onclick="generateQuizFromTutor('${topicName}')">Generate Quiz</button>
      </div>
      <span class="chat-bubble-meta-time">${time}</span>
    </div>
  `;
  container.appendChild(row);
  scrollChatToBottom();
  
  const textTarget = row.querySelector(".chat-stream-text-target");
  const actionsRow = row.querySelector(".chat-tutor-actions-row");
  const textContent = `Hi ${AppState.studentName.split(" ")[0]}! Let's explore ${topicName} together. Ask me any conceptual question, or click below to generate a practice quiz.`;
  
  typewriterEffect(textTarget, textContent, 15, () => {
    scrollChatToBottom();
  }, () => {
    textTarget.textContent = textContent;
    if (actionsRow) actionsRow.style.display = "flex";
    scrollChatToBottom();
  });
}

// ── VIEW 3: SYLLABUS TRACKER LOGIC ──

const STUDY_SUMMARIES = {
  "Introduction to Quadratics": "Quadratic equations are second-degree algebraic equations of standard form ax² + bx + c = 0, where a ≠ 0. The graph of a quadratic equation forms a parabola. Key concepts include identifying quadratic forms and calculating basic y-intercepts.",
  "Solution by Factoring": "Solving quadratics by factoring relies on the Zero Product Property. Split the middle term bx into two terms whose sum is b and product is ac, allowing you to group and factor the expression into two linear terms like (x - r)(x - s) = 0.",
  "Solution by Completing the Square": "Completing the square converts a quadratic equation into a perfect square trinomial (x + d)² = e. It is the direct mathematical foundation used to derive the general Quadratic Formula.",
  "Nature of Roots": "The nature of roots is determined by the discriminant, D = b² - 4ac. If D > 0, roots are real and distinct; if D = 0, roots are real and equal; if D < 0, roots are complex/imaginary.",
  "Euclid's Division Lemma": "Euclid's Division Lemma states that for any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b. This forms the basis of Euclid's HCF Algorithm.",
  "Fundamental Theorem of Arithmetic": "This theorem states that every composite number can be uniquely factored as a product of prime numbers, unique up to the order of their factors. It helps establish properties of HCF and LCM.",
  "Chemical Equations": "Chemical equations are shorthand representations of chemical reactions. The Law of Conservation of Mass dictates that equations must be balanced, meaning the same number of atoms for each element must exist on both sides.",
  "Types of Chemical Reactions": "Chemical reactions fall into main classes: Combination (A+B→AB), Decomposition (AB→A+B), Displacement (A+BC→AC+B), Double Displacement (AB+CD→AD+CB), and Redox reactions involving simultaneous oxidation and reduction.",
  "Nutrition in Humans": "Human nutrition is holozoic, involving ingestion, digestion, absorption, assimilation, and egestion. The digestive tract uses specialized enzymes like amylase, pepsin, and lipase to break down nutrients.",
  "Respiration & Energy Output": "Respiration is the cellular process of breaking down food (glucose) to release energy as ATP. Aerobic respiration requires oxygen and yields 38 ATP, while anaerobic respiration occurs without oxygen, yielding 2 ATP.",
  "French Revolution & Nation Idea": "The French Revolution of 1789 introduced the concept of nationalism in Europe. It shifted sovereignty from the monarchy to French citizens and introduced collective identity markers like la patrie and le citoyen.",
  "Making of Nationalism in Germany": "German unification was a nationalist movement engineered by Prussian Chancellor Otto von Bismarck. Using three strategic wars and a policy of 'blood and iron', Germany was unified under Kaiser Wilhelm I in 1871.",
  "Active & Passive Voice": "Active voice places the agent performing the action as the grammatical subject (e.g., 'The student solved the equation'). Passive voice shifts the focus to the action's recipient, making it the subject (e.g., 'The equation was solved by the student').",
  "Subject-Verb Concord": "Subject-Verb Concord requires that a verb agree in number with its subject. Singular subjects take singular verbs, and plural subjects take plural verbs. Special rules apply to indefinite pronouns and collective nouns."
};

function getSubjectClassName(subject) {
  switch (subject) {
    case "Mathematics": return "subj-maths";
    case "Science": return "subj-science";
    case "English": return "subj-english";
    case "Social Science": return "subj-social";
    case "Hindi": return "subj-hindi";
    case "Sanskrit": return "subj-sanskrit";
    case "EVS": return "subj-evs";
    case "Art Education": return "subj-art";
    case "Skill Education": return "subj-skill";
    default: return "";
  }
}

function getSubjectProgress(subject) {
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  const chapters = activeSyllabus[subject] || [];
  let total = 0;
  let done = 0;
  chapters.forEach(chap => {
    chap.topics.forEach(topic => {
      total++;
      if (AppState.completedTopics.includes(topic.name) || AppState.revisedTopics.includes(topic.name)) {
        done++;
      }
    });
  });
  return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function getTopicStatus(topicName) {
  if (AppState.completedTopics.includes(topicName)) return "completed";
  if (AppState.doubtTopics.includes(topicName)) return "marked-doubt";
  if (AppState.revisedTopics.includes(topicName)) return "revised";
  if (AppState.inProgressTopics && AppState.inProgressTopics.includes(topicName)) return "in-progress";
  return "not-started";
}

function getStudySummary(topicName) {
  if (STUDY_SUMMARIES[topicName]) {
    return STUDY_SUMMARIES[topicName];
  }
  return `This study guide covers the core concepts, key formulas, and practical examples for "${topicName}". Access the AI Tutor or take a topic test to check your understanding.`;
}

function updateSubjectOverviewChart() {
  const { total, done, percentage } = getSubjectProgress(activeSyllabusSubject);
  const donutFill = document.getElementById("donut-progress-fill");
  const donutText = document.getElementById("donut-progress-text");
  
  if (donutFill && donutText) {
    const circumference = 238.76;
    const offset = circumference - (circumference * percentage / 100);
    donutFill.style.strokeDashoffset = offset;
    donutText.textContent = `${percentage}%`;
  }
}

function updateMacroProgressStrip() {
  const labelEl = document.getElementById("syllabus-macro-progress-label");
  const fillEl = document.getElementById("syllabus-macro-progress-fill");
  
  const displaySub = activeSyllabusSubject === "Mathematics" ? "Mathematics" : activeSyllabusSubject;
  const { total, done, percentage } = getSubjectProgress(activeSyllabusSubject);
  
  if (labelEl) {
    labelEl.textContent = `${displaySub}: ${done}/${total} mastered`;
  }
  if (fillEl) {
    fillEl.style.width = `${percentage}%`;
  }
}

function initSubjectPills() {
  const tabsContainer = document.getElementById("syllabus-subject-tabs");
  if (!tabsContainer) return;
  tabsContainer.innerHTML = "";
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let subjects = Object.keys(activeSyllabus);
  
  if (AppState.studentGrade === "8") {
    subjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
  }
  
  subjects = sortSubjects(subjects);
  
  subjects.forEach(subject => {
    const btn = document.createElement("button");
    const subClass = getSubjectClassName(subject);
    btn.className = `syllabus-tab-pill ${subClass} ${subject === activeSyllabusSubject ? 'active' : ''}`;
    
    const { total, done, percentage } = getSubjectProgress(subject);
    const svgCircle = `
      <svg class="pill-progress-circle" width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1.5"></circle>
        <circle class="pill-progress-circle-fill" cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="28.27" stroke-dashoffset="${28.27 - (28.27 * percentage / 100)}" transform="rotate(-90 6 6)"></circle>
      </svg>
    `;
    
    let displaySub = subject === "Mathematics" ? "Maths" : subject;
    btn.innerHTML = `${svgCircle}<span>${displaySub}</span>`;
    
    btn.addEventListener("click", () => {
      document.querySelectorAll(".syllabus-tab-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSyllabusSubject = subject;
      
      renderSyllabusList();
    });
    tabsContainer.appendChild(btn);
  });
}

function initSyllabusTracker() {
  initSubjectPills();
  
  // Hook drawer actions
  document.getElementById("drawer-btn-learn").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      if (!AppState.inProgressTopics) AppState.inProgressTopics = [];
      if (!AppState.inProgressTopics.includes(activeSyllabusTopic.name) &&
          !AppState.completedTopics.includes(activeSyllabusTopic.name) &&
          !AppState.revisedTopics.includes(activeSyllabusTopic.name) &&
          !AppState.doubtTopics.includes(activeSyllabusTopic.name)) {
        AppState.inProgressTopics.push(activeSyllabusTopic.name);
      }
      saveStateAndRefresh(activeSyllabusTopic.name);
      startAIChatOnTopic(activeSyllabusTopic.name);
    }
  });

  document.getElementById("drawer-btn-complete").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      toggleTopicComplete(activeSyllabusTopic.name, true);
    }
  });

  document.getElementById("drawer-btn-revise").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      toggleTopicRevise(activeSyllabusTopic.name, true);
    }
  });

  document.getElementById("drawer-btn-doubt").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      toggleTopicDoubt(activeSyllabusTopic.name, true);
    }
  });

  document.getElementById("drawer-btn-remove-doubt").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      toggleTopicDoubt(activeSyllabusTopic.name, false);
    }
  });

  document.getElementById("drawer-btn-test").addEventListener("click", () => {
    if (activeSyllabusTopic) {
      startMCQTest(activeSyllabusTopic.name, activeSyllabusSubject);
    }
  });
}

function renderSyllabusList() {
  const container = document.getElementById("syllabus-topics-accordion");
  if (!container) return;
  container.innerHTML = "";
  
  // Update state indicators
  updateSubjectOverviewChart();
  updateMacroProgressStrip();
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  if (isPendingClass) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; grid-column: span 2;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--graphite)" stroke-width="1.5" style="margin-bottom: 16px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h15v20H5a2 2 0 0 1-1-1z"/></svg>
        <h3 style="font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 8px;">Class Syllabus Pending</h3>
        <p style="font-size: 14px; color: var(--graphite); max-width: 320px; line-height: 1.5;">The curriculum structure and documents for Class ${AppState.studentGrade} have not been finalized yet. Once uploaded, you can track your chapter progress here.</p>
      </div>
    `;
    return;
  }
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let chapters = activeSyllabus[activeSyllabusSubject] || [];
  
  if (chapters.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--graphite);">No chapters available for this subject.</div>`;
    return;
  }
  
  if (activeSyllabusTopic) {
    showTopicInDrawer(activeSyllabusTopic, activeSyllabusSubject);
  } else {
    document.getElementById("drawer-unselected-msg").style.display = "flex";
    document.getElementById("drawer-topic-info-box").style.display = "none";
    updateChatContinuityStrip();
    updateChatWelcomeCard();
  }
  
  chapters.forEach((chap, cIndex) => {
    const card = document.createElement("div");
    const subClass = getSubjectClassName(activeSyllabusSubject);
    card.className = `chapter-accordion-card ${subClass}`;
    
    let totalTopics = chap.topics.length;
    let completedOrRevised = 0;
    chap.topics.forEach(t => {
      if (AppState.completedTopics.includes(t.name) || AppState.revisedTopics.includes(t.name)) {
        completedOrRevised++;
      }
    });
    
    const percentage = totalTopics > 0 ? Math.round((completedOrRevised / totalTopics) * 100) : 0;
    const cleanChapterName = chap.chapter.replace(/Chapter \d+:\s*/, "");
    
    card.innerHTML = `
      <div class="chapter-header-row" onclick="toggleChapterAccordion(this)">
        <div class="chapter-title-info">
          <span class="chapter-lbl">Chapter ${cIndex + 1}</span>
          <span class="chapter-title-text">${cleanChapterName}</span>
          <div class="chapter-progress-inline">
            <span class="chapter-progress-text">${completedOrRevised}/${totalTopics} topics</span>
            <div class="chapter-progress-bar-track">
              <div class="chapter-progress-bar-fill" style="width: ${percentage}%; background-color: ${SUBJECT_COLORS[activeSyllabusSubject] || 'var(--green)'};"></div>
            </div>
          </div>
        </div>
        <span class="chapter-toggle-indicator">−</span>
      </div>
      <div class="chapter-topics-body-list">
        <!-- Topics loaded -->
      </div>
    `;
    
    const body = card.querySelector(".chapter-topics-body-list");
    chap.topics.forEach(topic => {
      const row = document.createElement("div");
      const isSelected = activeSyllabusTopic && activeSyllabusTopic.name === topic.name;
      const status = getTopicStatus(topic.name);
      
      row.className = `topic-list-row ${isSelected ? 'selected' : ''}`;
      
      row.innerHTML = `
        <div class="topic-title-flex">
          <span class="topic-status-dot ${status}"></span>
          <span class="topic-title-label">${topic.name}</span>
        </div>
        <span class="topic-status-text-badge ${status}">${status.replace("-", " ")}</span>
      `;
      
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".topic-list-row").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        showTopicInDrawer({ ...topic, chapter: chap.chapter }, activeSyllabusSubject);
      });
      
      const badge = row.querySelector(".topic-status-text-badge");
      if (badge) {
        badge.addEventListener("click", (e) => {
          if (status === "marked-doubt") {
            e.stopPropagation();
            resolveDoubtInAITutor(topic.name);
          }
        });
      }
      
      body.appendChild(row);
    });
    
    container.appendChild(card);
  });
}



function toggleChapterAccordion(header) {
  const body = header.nextElementSibling;
  const indicator = header.querySelector(".chapter-toggle-indicator");
  if (body.style.display === "none") {
    body.style.display = "flex";
    indicator.textContent = "−";
  } else {
    body.style.display = "none";
    indicator.textContent = "+";
  }
}

function showTopicInDrawer(topic, subject) {
  activeSyllabusTopic = topic;
  
  // Update AI Tutor context continuity strip and greetings
  updateChatWelcomeCard();
  renderChatQuickPrompts();
  
  document.getElementById("drawer-unselected-msg").style.display = "none";
  document.getElementById("drawer-topic-info-box").style.display = "flex";
  
  document.getElementById("drawer-topic-subject").textContent = subject.toUpperCase();
  document.getElementById("drawer-topic-title").textContent = topic.name;
  document.getElementById("drawer-topic-chapter-desc").textContent = topic.chapter || topic.desc;
  
  // Resolve status text
  const status = getTopicStatus(topic.name);
  
  const statusPill = document.getElementById("drawer-topic-status-pill");
  statusPill.className = `status-pill-badge ${status}`;
  statusPill.textContent = status.replace("-", " ");
  
  // Populate AI summary study guide
  const summaryEl = document.getElementById("drawer-topic-summary-text");
  if (summaryEl) {
    summaryEl.textContent = getStudySummary(topic.name);
  }
  
  // Toggle spaced repetition alert
  const spacedBox = document.getElementById("drawer-spaced-repetition-box");
  const spacedMsg = document.getElementById("drawer-spaced-repetition-message");
  
  if (spacedBox && spacedMsg) {
    if (status === "completed" || status === "revised") {
      spacedBox.style.display = "flex";
      
      let lastDateText = "3 days ago";
      let warningText = "Spaced repetition recommends a quick test to prevent memory decay.";
      
      if (topic.name === "Euclid's Division Lemma") {
        lastDateText = "Yesterday";
        warningText = "Excellent progress! Review again in 2 days to cement this in your long-term memory.";
      } else if (topic.name === "Chemical Equations") {
        lastDateText = "3 days ago";
        warningText = "It has been 3 days since you completed this. Try a practice quiz to verify retention.";
      } else if (topic.name === "Active & Passive Voice") {
        lastDateText = "5 days ago";
        warningText = "Retention alert: 5 days since last study. Spaced repetition recommends taking a quick topic test now.";
      } else if (topic.name === "French Revolution & Nation Idea") {
        lastDateText = "12 days ago";
        warningText = "Retention warning: 12 days since last revision. Memory decay is likely. We recommend a revision test.";
      } else {
        lastDateText = "Just now";
        warningText = "Freshly completed! Spaced repetition suggests a brief self-test in 24 hours.";
      }
      
      spacedMsg.innerHTML = `<strong>Last revised: ${lastDateText}</strong>. ${warningText}`;
    } else {
      spacedBox.style.display = "none";
    }
  }
  
  // Populate revision and test stats
  const revisedCountEl = document.getElementById("drawer-topic-revised-count");
  const lastRevisedEl = document.getElementById("drawer-topic-last-revised");
  
  if (revisedCountEl && lastRevisedEl) {
    if (status === "completed") {
      if (topic.name === "Euclid's Division Lemma") {
        revisedCountEl.textContent = "1 time";
        lastRevisedEl.textContent = "Yesterday";
      } else if (topic.name === "Chemical Equations") {
        revisedCountEl.textContent = "1 time";
        lastRevisedEl.textContent = "3 days ago";
      } else if (topic.name === "Active & Passive Voice") {
        revisedCountEl.textContent = "1 time";
        lastRevisedEl.textContent = "5 days ago";
      } else {
        revisedCountEl.textContent = "1 time";
        lastRevisedEl.textContent = "Today";
      }
    } else if (status === "revised") {
      if (topic.name === "French Revolution & Nation Idea") {
        revisedCountEl.textContent = "2 times";
        lastRevisedEl.textContent = "12 days ago";
      } else {
        revisedCountEl.textContent = "2 times";
        lastRevisedEl.textContent = "2 days ago";
      }
    } else if (status === "marked-doubt") {
      revisedCountEl.textContent = "0 times";
      lastRevisedEl.textContent = "Never";
    } else if (status === "in-progress") {
      revisedCountEl.textContent = "0 times";
      lastRevisedEl.textContent = "Started today";
    } else {
      revisedCountEl.textContent = "0 times";
      lastRevisedEl.textContent = "Never";
    }
  }
  
  // Handle action buttons toggling
  const markCompBtn = document.getElementById("drawer-btn-complete");
  const markRevBtn = document.getElementById("drawer-btn-revise");
  const markDoubtBtn = document.getElementById("drawer-btn-doubt");
  const removeDoubtBtn = document.getElementById("drawer-btn-remove-doubt");
  
  if (status === "completed") {
    markCompBtn.style.display = "none";
    markRevBtn.style.display = "inline-flex";
    markDoubtBtn.style.display = "inline-flex";
    removeDoubtBtn.style.display = "none";
  } else if (status === "marked-doubt") {
    markCompBtn.style.display = "inline-flex";
    markRevBtn.style.display = "none";
    markDoubtBtn.style.display = "none";
    removeDoubtBtn.style.display = "inline-flex";
  } else if (status === "revised") {
    markCompBtn.style.display = "none";
    markRevBtn.style.display = "none";
    markDoubtBtn.style.display = "inline-flex";
    removeDoubtBtn.style.display = "none";
  } else {
    markCompBtn.style.display = "inline-flex";
    markRevBtn.style.display = "none";
    markDoubtBtn.style.display = "inline-flex";
    removeDoubtBtn.style.display = "none";
  }
}

// ── SYLLABUS OPERATIONS & STATE UPDATES ──
function toggleTopicComplete(topicName, isComplete) {
  if (isComplete) {
    if (!AppState.completedTopics.includes(topicName)) {
      AppState.completedTopics.push(topicName);
    }
    // Remove from doubts if completed
    AppState.doubtTopics = AppState.doubtTopics.filter(t => t !== topicName);
    AppState.revisedTopics = AppState.revisedTopics.filter(t => t !== topicName);
  } else {
    AppState.completedTopics = AppState.completedTopics.filter(t => t !== topicName);
  }
  
  saveStateAndRefresh(topicName);
}

function toggleTopicRevise(topicName, isRevise) {
  if (isRevise) {
    if (!AppState.revisedTopics.includes(topicName)) {
      AppState.revisedTopics.push(topicName);
    }
    AppState.completedTopics = AppState.completedTopics.filter(t => t !== topicName);
    AppState.doubtTopics = AppState.doubtTopics.filter(t => t !== topicName);
  }
  saveStateAndRefresh(topicName);
}

function toggleTopicDoubt(topicName, isDoubt) {
  if (isDoubt) {
    if (!AppState.doubtTopics.includes(topicName)) {
      AppState.doubtTopics.push(topicName);
    }
    AppState.completedTopics = AppState.completedTopics.filter(t => t !== topicName);
    AppState.revisedTopics = AppState.revisedTopics.filter(t => t !== topicName);
    // Initialize doubt details and date
    getOrCreateDoubtDetails(topicName);
  } else {
    AppState.doubtTopics = AppState.doubtTopics.filter(t => t !== topicName);
    // Add to history log
    if (!AppState.resolvedDoubtsHistory.find(d => d.topic === topicName)) {
      let method = "AI Tutor";
      let beforeScore = 33;
      let afterScore = 100;
      let attempts = 1;
      let details = "Resolved via AI Tutor tutoring sessions.";

      const topicTests = AppState.testHistory.filter(t => t.topic === topicName);
      if (topicTests.length > 0) {
        attempts = topicTests.length;
        const firstTest = topicTests[0];
        const lastTest = topicTests[topicTests.length - 1];
        beforeScore = Math.round((firstTest.score / firstTest.total) * 100);
        afterScore = Math.round((lastTest.score / lastTest.total) * 100);
        
        if (afterScore >= 70) {
          method = "Test retake";
          details = `Resolved via practice test retake. Score improved from ${beforeScore}% to ${afterScore}%.`;
        } else {
          method = "AI Tutor";
          details = `Resolved via AI Tutor session. Latest practice score: ${afterScore}%.`;
        }
      } else {
        // Find if they chatted about it
        const chatMatches = AppState.chatHistory.some(c => c.title.toLowerCase().includes(topicName.toLowerCase()));
        if (chatMatches) {
          method = "AI Tutor";
          beforeScore = 0;
          afterScore = 100;
          details = "Resolved after conceptual review and practice questions with AI Tutor.";
        } else {
          method = "AI Tutor";
          beforeScore = 50;
          afterScore = 100;
          details = "Resolved via manual doubt resolution and self study.";
        }
      }

      AppState.resolvedDoubtsHistory.push({
        topic: topicName,
        date: "Just now",
        method: method,
        beforeScore: beforeScore,
        afterScore: afterScore,
        attempts: attempts,
        details: details
      });
    }
    // Clean up doubt details
    if (AppState.doubtDetails && AppState.doubtDetails[topicName]) {
      delete AppState.doubtDetails[topicName];
    }
  }
  saveStateAndRefresh(topicName);
}

function saveStateAndRefresh(topicName) {
  saveStateToLocalStorage();
  updateSidebarDoubtBadge();
  
  // Refresh drawer
  if (activeSyllabusTopic && activeSyllabusTopic.name === topicName) {
    showTopicInDrawer(activeSyllabusTopic, activeSyllabusSubject);
  }
  
  // Refresh active list
  renderSyllabusList();
  
  // Refresh doubts solver lists
  renderDoubtsList();
}

function updateSidebarDoubtBadge() {
  const badge = document.getElementById("doubt-badge-count");
  const count = AppState.doubtTopics.length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

// ── VIEW 4: PRACTICE TESTS CENTER LOGIC ──

function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
  
  const resizeHandler = () => {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  };
  window.addEventListener("resize", resizeHandler);
  
  const colors = ["#FD4463", "#A855F7", "#10B981", "#3B82F6", "#F59E0B"];
  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 5 + 3,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.08 + 0.02,
      tiltAngle: 0
    });
  }
  
  let animationId;
  const startTime = Date.now();
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    updateParticles();
    
    if (Date.now() - startTime < 3500) {
      animationId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeHandler);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  function updateParticles() {
    particles.forEach(p => {
      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
  }
  
  draw();
}

function updateTestsStatsStrip() {
  const totalCompletedEl = document.getElementById("test-stats-total");
  const avgScoreEl = document.getElementById("test-stats-avg");
  const mostImprovedEl = document.getElementById("test-stats-improved");
  
  if (!totalCompletedEl || !avgScoreEl || !mostImprovedEl) return;
  
  const history = AppState.testHistory || [];
  totalCompletedEl.textContent = history.length;
  
  if (history.length === 0) {
    avgScoreEl.textContent = "0%";
    mostImprovedEl.textContent = "No retakes yet";
    return;
  }
  
  let sumPercent = 0;
  history.forEach(run => {
    sumPercent += Math.round((run.score / run.total) * 100);
  });
  const avgPercent = Math.round(sumPercent / history.length);
  avgScoreEl.textContent = `${avgPercent}%`;
  
  const topicAttempts = {};
  history.forEach(run => {
    if (!topicAttempts[run.topic]) {
      topicAttempts[run.topic] = [];
    }
    topicAttempts[run.topic].push(run);
  });
  
  let maxImprovement = -999;
  let mostImprovedTopic = "No retakes yet";
  
  Object.keys(topicAttempts).forEach(topic => {
    const runs = topicAttempts[topic];
    if (runs.length > 1) {
      const firstRun = runs[0];
      const lastRun = runs[runs.length - 1];
      const firstPercent = Math.round((firstRun.score / firstRun.total) * 100);
      const lastPercent = Math.round((lastRun.score / lastRun.total) * 100);
      const diff = lastPercent - firstPercent;
      if (diff > maxImprovement) {
        maxImprovement = diff;
        mostImprovedTopic = `${topic.length > 12 ? topic.slice(0, 10) + '...' : topic} (${diff > 0 ? '+' : ''}${diff}%)`;
      }
    }
  });
  
  if (maxImprovement > -999 && maxImprovement >= 0) {
    mostImprovedEl.textContent = mostImprovedTopic;
  } else {
    mostImprovedEl.textContent = "No improvement yet";
  }
}

function renderSubjectFilterPills() {
  const filterContainer = document.getElementById("test-subject-filters-container");
  if (!filterContainer) return;
  filterContainer.innerHTML = "";
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let subjects = Object.keys(activeSyllabus);
  if (AppState.studentGrade === "8") {
    subjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
  }
  subjects = sortSubjects(subjects);
  
  const filters = ["All", ...subjects];
  
  filters.forEach(filter => {
    const btn = document.createElement("button");
    const subClass = getSubjectClassName(filter);
    btn.className = `test-filter-pill ${subClass} ${filter === activeTestSubjectFilter ? 'active' : ''}`;
    
    let displayLabel = filter;
    if (filter === "Mathematics") displayLabel = "Maths";
    else if (filter === "All") displayLabel = "All Subjects";
    
    btn.innerHTML = `<span>${displayLabel}</span>`;
    
    btn.addEventListener("click", () => {
      activeTestSubjectFilter = filter;
      document.querySelectorAll(".test-filter-pill").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      renderTestsOverview();
    });
    filterContainer.appendChild(btn);
  });
}

function initTestsCenter() {
  renderSubjectFilterPills();
  
  document.getElementById("run-test-quit-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to quit this test? Your score will not save.")) {
      hideTestWizard();
    }
  });

  document.getElementById("run-test-submit-btn").addEventListener("click", () => {
    submitMCQAnswer();
  });

  document.getElementById("test-results-retake-btn").addEventListener("click", () => {
    if (activeMCQTest) {
      const overlay = document.getElementById("test-results-modal-overlay");
      if (overlay) {
        overlay.classList.remove("active");
        overlay.style.display = "none";
      }
      startMCQTest(activeMCQTest.topicName, activeMCQTest.subject);
    }
  });

  document.getElementById("test-results-close-btn").addEventListener("click", () => {
    hideTestWizard();
  });
}

function renderTestsOverview() {
  updateTestsStatsStrip();
  
  const availableContainer = document.getElementById("test-available-topic-tests-list");
  if (!availableContainer) return;
  availableContainer.innerHTML = "";
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  if (isPendingClass) {
    availableContainer.innerHTML = `
      <div style="text-align:center; padding: 24px; color: var(--graphite); font-size: 13px;">
        Topic tests will unlock when class content is uploaded.
      </div>
    `;
  } else {
    const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
    let topicsList = [];
    
    Object.keys(activeSyllabus).forEach(sub => {
      if (activeTestSubjectFilter !== "All" && sub !== activeTestSubjectFilter) {
        return;
      }
      (activeSyllabus[sub] || []).forEach(chap => {
        chap.topics.forEach(t => {
          topicsList.push({ name: t.name, subject: sub });
        });
      });
    });
    
    if (topicsList.length === 0) {
      availableContainer.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--graphite);">No tests available.</div>`;
    } else {
      topicsList.forEach(t => {
        const card = document.createElement("div");
        const subClass = getSubjectClassName(t.subject);
        card.className = `test-entry-card ${subClass}`;
        
        const attempted = AppState.testHistory.some(run => run.topic === t.name);
        const isDoubt = AppState.doubtTopics.includes(t.name);
        const doubtBadgeHtml = isDoubt ? `<span class="test-doubt-recommend-badge">Recommended</span>` : "";
        
        let displaySub = t.subject === "Mathematics" ? "Maths" : t.subject;
        const subText = `${displaySub} · 3 Questions · ~2 min`;
        
        card.innerHTML = `
          <div class="test-entry-info">
            <div style="display:flex; align-items:center; flex-wrap:wrap;">
              <span class="test-entry-title">${t.name}</span>
              ${doubtBadgeHtml}
            </div>
            <span class="test-entry-sub">${subText}</span>
          </div>
          <button class="test-entry-action-btn ${attempted ? 'attempted' : 'btn-primary'}" onclick="startMCQTest('${t.name.replace(/'/g, "\\'")}', '${t.subject}')">
            ${attempted ? 'Retake Test' : 'Start Test'}
          </button>
        `;
        availableContainer.appendChild(card);
      });
    }
  }
  
  const historyContainer = document.getElementById("test-completed-history-list");
  if (!historyContainer) return;
  historyContainer.innerHTML = "";
  
  if (AppState.testHistory.length === 0) {
    historyContainer.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--graphite);">No tests attempted yet</div>`;
    return;
  }
  
  AppState.testHistory.slice().reverse().forEach((run, revIdx) => {
    const chronologicalIndex = AppState.testHistory.length - 1 - revIdx;
    
    const card = document.createElement("div");
    const subClass = getSubjectClassName(run.subject);
    card.className = `test-entry-card ${subClass}`;
    const percent = Math.round((run.score / run.total) * 100);
    
    let scoreColorClass = "score-red";
    if (percent >= 40 && percent < 70) {
      scoreColorClass = "score-amber";
    } else if (percent >= 70) {
      scoreColorClass = "score-green";
    }
    
    const topicAttempts = AppState.testHistory.filter((r, idx) => r.topic === run.topic && idx <= chronologicalIndex);
    let trendHtml = "";
    if (topicAttempts.length > 1) {
      const currentAttempt = topicAttempts[topicAttempts.length - 1];
      const prevAttempt = topicAttempts[topicAttempts.length - 2];
      const currentPercent = Math.round((currentAttempt.score / currentAttempt.total) * 100);
      const prevPercent = Math.round((prevAttempt.score / prevAttempt.total) * 100);
      const diff = currentPercent - prevPercent;
      
      if (diff > 0) {
        trendHtml = `<span class="test-trend-up">↑ ${diff}%</span>`;
      } else if (diff < 0) {
        trendHtml = `<span class="test-trend-down">↓ ${Math.abs(diff)}%</span>`;
      } else {
        trendHtml = `<span class="test-trend-neutral">→ 0%</span>`;
      }
    }
    
    let displaySub = run.subject === "Mathematics" ? "Maths" : (run.subject || "");
    card.innerHTML = `
      <div class="test-entry-info">
        <div style="display:flex; align-items:center; flex-wrap:wrap;">
          <span class="test-entry-title">${run.topic}</span>
          ${trendHtml}
        </div>
        <span class="test-entry-sub">${run.date} · ${run.score}/${run.total} Correct ${displaySub ? '· ' + displaySub : ''}</span>
      </div>
      <span class="test-history-score-badge ${scoreColorClass}">${percent}%</span>
    `;
    historyContainer.appendChild(card);
  });
}

function startMCQTest(topicName, subject) {
  switchTab("tests");
  
  let questions = MCQ_TESTS_DB[topicName];
  if (!questions) questions = DEFAULT_MCQ_TEST;
  
  activeMCQTest = {
    topicName: topicName,
    subject: subject,
    questions: questions
  };
  
  currentMCQQuestionIndex = 0;
  mcqScoreCount = 0;
  userMCQAnswers = [];
  
  document.getElementById("test-landing-panel").style.display = "none";
  document.getElementById("test-results-modal-overlay").style.display = "none";
  document.getElementById("test-results-modal-overlay").classList.remove("active");
  document.getElementById("test-runner-panel").style.display = "flex";
  
  loadMCQQuestion();
}

function loadMCQQuestion() {
  const questions = activeMCQTest.questions;
  const q = questions[currentMCQQuestionIndex];
  
  document.getElementById("run-test-subject").textContent = activeMCQTest.subject.toUpperCase();
  document.getElementById("run-test-counter").textContent = `Question ${currentMCQQuestionIndex + 1} of ${questions.length}`;
  
  const progressPercent = ((currentMCQQuestionIndex + 1) / questions.length) * 100;
  const progressFill = document.getElementById("run-test-progress-fill");
  progressFill.style.width = `${progressPercent}%`;
  progressFill.style.backgroundColor = SUBJECT_COLORS[activeMCQTest.subject] || 'var(--green)';
  
  document.getElementById("run-test-question-text").textContent = q.q;
  
  const optionsGrid = document.getElementById("run-test-options-grid");
  optionsGrid.innerHTML = "";
  
  q.opts.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "mcq-option-card";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mcq-option-card").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      userMCQAnswers[currentMCQQuestionIndex] = index;
      document.getElementById("run-test-submit-btn").disabled = false;
    });
    optionsGrid.appendChild(btn);
  });
  
  document.getElementById("run-test-submit-btn").disabled = true;
}

function submitMCQAnswer() {
  const selectedOptIndex = userMCQAnswers[currentMCQQuestionIndex];
  const q = activeMCQTest.questions[currentMCQQuestionIndex];
  
  if (selectedOptIndex === q.ans) {
    mcqScoreCount++;
  }
  
  currentMCQQuestionIndex++;
  
  if (currentMCQQuestionIndex < activeMCQTest.questions.length) {
    loadMCQQuestion();
  } else {
    showTestResults();
  }
}

function showTestResults() {
  document.getElementById("test-runner-panel").style.display = "none";
  
  const overlay = document.getElementById("test-results-modal-overlay");
  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.classList.add("active");
  }, 10);
  
  const total = activeMCQTest.questions.length;
  const percent = Math.round((mcqScoreCount / total) * 100);
  
  document.getElementById("test-results-score").textContent = `You scored ${percent}% (${mcqScoreCount}/${total} correct)`;
  
  const feedback = document.getElementById("test-results-feedback");
  if (percent >= 75) {
    feedback.textContent = "Superb concept mastery! This topic is marked as Completed.";
    toggleTopicComplete(activeMCQTest.topicName, true);
  } else {
    feedback.textContent = "Good try. You can review the correct answers below and retake the test.";
  }
  
  // Progress Ring Animation
  const ring = document.getElementById("modal-score-ring");
  const text = document.getElementById("modal-score-text");
  if (ring && text) {
    ring.style.strokeDashoffset = "263.89";
    text.textContent = "0%";
    
    ring.className.baseVal = "";
    if (percent < 40) {
      ring.classList.add("score-red");
    } else if (percent >= 40 && percent < 70) {
      ring.classList.add("score-amber");
    } else {
      ring.classList.add("score-green");
    }
    
    setTimeout(() => {
      const offset = 263.89 - (263.89 * percent / 100);
      ring.style.strokeDashoffset = offset;
      
      let count = 0;
      const interval = setInterval(() => {
        if (count >= percent) {
          text.textContent = `${percent}%`;
          clearInterval(interval);
        } else {
          count += Math.ceil(percent / 15);
          if (count >= percent) count = percent;
          text.textContent = `${count}%`;
        }
      }, 40);
    }, 150);
  }
  
  if (percent >= 70) {
    triggerConfetti();
  }
  
  const aiHelpBtn = document.getElementById("test-results-ai-help-btn");
  if (aiHelpBtn) {
    if (percent < 70) {
      aiHelpBtn.style.display = "inline-flex";
      aiHelpBtn.onclick = () => {
        overlay.classList.remove("active");
        setTimeout(() => {
          overlay.style.display = "none";
        }, 350);
        
        startAIChatOnTopic(activeMCQTest.topicName);
        const textBox = document.getElementById("chat-user-textbox");
        const sendBtn = document.getElementById("chat-send-trigger-btn");
        if (textBox && sendBtn) {
          textBox.value = `I just took a practice test on "${activeMCQTest.topicName}" and scored ${mcqScoreCount}/${total} (${percent}%). I had some trouble. Can you explain where I made mistakes and tutor me on this?`;
          textBox.focus();
          sendBtn.disabled = false;
        }
      };
    } else {
      aiHelpBtn.style.display = "none";
    }
  }
  
  // Save into state history
  AppState.testHistory.push({
    topic: activeMCQTest.topicName,
    score: mcqScoreCount,
    total: total,
    date: "Just now",
    subject: activeMCQTest.subject
  });
  saveStateToLocalStorage();
  
  const reviewContainer = document.getElementById("test-review-qa-list");
  if (reviewContainer) {
    reviewContainer.innerHTML = "";
    activeMCQTest.questions.forEach((q, idx) => {
      const userChoiceIndex = userMCQAnswers[idx];
      const isCorrect = userChoiceIndex === q.ans;
      
      const card = document.createElement("div");
      card.className = "review-item-card";
      card.innerHTML = `
        <span class="review-q-num">Question ${idx + 1}</span>
        <p class="review-q-txt">${q.q}</p>
        <div class="review-ans-indicator ${isCorrect ? 'correct' : 'incorrect'}">
          ${isCorrect ? '✓ Correct Answer' : `✗ Incorrect (You selected: ${q.opts[userChoiceIndex]})`}
        </div>
        <div style="font-size:13px; font-weight:500; color:var(--blue); margin-top:2px;">
          Correct: ${q.opts[q.ans]}
        </div>
        <div class="review-explanation">
          <strong>Explanation:</strong> ${q.exp}
        </div>
      `;
      reviewContainer.appendChild(card);
    });
  }
}

function hideTestWizard() {
  document.getElementById("test-runner-panel").style.display = "none";
  const overlay = document.getElementById("test-results-modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 350);
  }
  document.getElementById("test-landing-panel").style.display = "block";
  renderTestsOverview();
}

function generateQuizFromTutor(topicKey) {
  let topicName = "Introduction to Quadratics";
  if (topicKey === "quadratic") topicName = "Introduction to Quadratics";
  else if (topicKey === "photosynthesis") topicName = "Photosynthesis Mechanics";
  else if (topicKey.includes("roots")) topicName = "Nature of Roots";
  
  startMCQTest(topicName, activeSyllabusSubject);
}

// Doubt center helper functions
function getOrCreateDoubtDetails(topicName) {
  if (!AppState.doubtDetails) {
    AppState.doubtDetails = {};
  }
  if (!AppState.doubtDetails[topicName]) {
    // Generate a default diagnosis based on test history
    const attempts = (AppState.testHistory || []).filter(run => run.topic === topicName);
    let diagnosis = "Conceptual clarification needed.";
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      const wrongCount = lastAttempt.total - lastAttempt.score;
      if (wrongCount > 0) {
        diagnosis = `You got ${wrongCount}/${lastAttempt.total} incorrect on this practice test.`;
      } else {
        diagnosis = `Concept reviewed after achieving full marks.`;
      }
    }
    AppState.doubtDetails[topicName] = {
      dateMarked: new Date().toISOString(),
      diagnosis: diagnosis,
      note: ""
    };
  }
  return AppState.doubtDetails[topicName];
}

function formatDoubtDate(dateStr) {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return `1 week ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function updateDoubtNote(topicName, value) {
  const details = getOrCreateDoubtDetails(topicName);
  details.note = value;
  saveStateToLocalStorage();
}

function resolveDoubtInAITutor(topicName) {
  startAIChatOnTopic(topicName);
  
  const details = getOrCreateDoubtDetails(topicName);
  
  let tutorMsg = `I have a doubt in "${topicName}".\n`;
  if (details.diagnosis) {
    tutorMsg += `Diagnostic Info: ${details.diagnosis}\n`;
  }
  if (details.note && details.note.trim() !== "") {
    tutorMsg += `My question/note: "${details.note}"\n`;
  }
  tutorMsg += `Can you explain this and help me resolve it?`;
  
  // Automate sending after transition
  setTimeout(() => {
    handleUserMessage(tutorMsg);
  }, 450);
}

function goToPracticeTestForSubject(subject) {
  activeTestSubjectFilter = subject;
  renderTestsOverview();
  switchTab("tests");
}

function updateDoubtCenterKPIs() {
  const resolvedCountEl = document.getElementById("kpi-resolved-doubts-count");
  const activeCountEl = document.getElementById("kpi-active-doubts-count");
  
  if (resolvedCountEl) {
    resolvedCountEl.textContent = AppState.resolvedDoubtsHistory ? AppState.resolvedDoubtsHistory.length : 0;
  }
  if (activeCountEl) {
    activeCountEl.textContent = AppState.doubtTopics ? AppState.doubtTopics.length : 0;
  }
}

// ── VIEW 5: DOUBTS SOLVER CENTER LOGIC ──
function initDoubtsView() {
  updateSidebarDoubtBadge();
}

function renderDoubtsList() {
  updateDoubtCenterKPIs();
  
  const cardsContainer = document.getElementById("doubt-subjects-cards-list");
  cardsContainer.innerHTML = "";
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  if (isPendingClass) {
    cardsContainer.innerHTML = `
      <div style="grid-column: span 2; text-align: center; padding: 40px; color: var(--graphite); font-size: 14px;">
        Doubt solving is disabled for pending syllabus classes.
      </div>
    `;
    document.getElementById("doubt-subject-detail-title").textContent = "No Doubts";
    document.getElementById("doubt-detail-count-badge").textContent = "0";
    document.getElementById("doubt-subject-topics-container").innerHTML = `
      <div style="text-align: center; padding: 32px; color: var(--graphite); font-size: 13px;">
        No active doubts. Class content is not uploaded yet.
      </div>
    `;
    return;
  }
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  let subjects = Object.keys(activeSyllabus);
  subjects = sortSubjects(subjects);
  
  // Count doubts in state
  let doubtCounts = {};
  subjects.forEach(s => doubtCounts[s] = 0);
  
  // Find subject of each doubt in database
  AppState.doubtTopics.forEach(topic => {
    let matchedSub = null;
    Object.keys(activeSyllabus).forEach(sub => {
      (activeSyllabus[sub] || []).forEach(chap => {
        if (chap.topics.find(t => t.name === topic)) matchedSub = sub;
      });
    });
    if (matchedSub && doubtCounts[matchedSub] !== undefined) {
      doubtCounts[matchedSub]++;
    }
  });

  if (subjects.length > 0 && !subjects.includes(activeSyllabusSubject)) {
    activeSyllabusSubject = subjects[0];
  } else if (subjects.length === 0) {
    activeSyllabusSubject = "";
  }

  subjects.forEach(subject => {
    const count = doubtCounts[subject] || 0;
    
    // Find all active doubt names for this subject
    let subjectActiveDoubts = [];
    AppState.doubtTopics.forEach(topic => {
      let matchedSub = null;
      Object.keys(activeSyllabus).forEach(sub => {
        (activeSyllabus[sub] || []).forEach(chap => {
          if (chap.topics.find(t => t.name === topic)) matchedSub = sub;
        });
      });
      if (matchedSub === subject) {
        subjectActiveDoubts.push(topic);
      }
    });

    // Compute highest urgency
    let highestUrgency = "fresh";
    subjectActiveDoubts.forEach(doubtName => {
      const details = getOrCreateDoubtDetails(doubtName);
      if (details && details.dateMarked) {
        const diffTime = Math.abs(new Date() - new Date(details.dateMarked));
        const ageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (ageDays >= 7) {
          highestUrgency = "severe";
        } else if (ageDays >= 3 && highestUrgency !== "severe") {
          highestUrgency = "warning";
        }
      }
    });

    // Compute resolved doubts trend count for this subject
    let resolvedCount = 0;
    if (AppState.resolvedDoubtsHistory) {
      AppState.resolvedDoubtsHistory.forEach(r => {
        let matchedSub = null;
        Object.keys(activeSyllabus).forEach(sub => {
          (activeSyllabus[sub] || []).forEach(chap => {
            if (chap.topics.find(t => t.name === r.topic)) matchedSub = sub;
          });
        });
        if (matchedSub === subject) {
          resolvedCount++;
        }
      });
    }

    let trendHtml = "";
    if (resolvedCount > 0) {
      trendHtml = `<span class="subj-trend-down">↓${resolvedCount} resolved</span>`;
    } else if (count > 0) {
      trendHtml = `<span class="subj-trend-neutral">→ stable</span>`;
    }

    const card = document.createElement("div");
    const subClass = getSubjectClassName(subject);
    card.className = `doubt-subj-card ${subClass} ${subject === activeSyllabusSubject ? 'active' : ''}`;
    
    let displaySub = subject === "Mathematics" ? "Maths" : subject;
    
    // Style badge and append dot
    let badgeClass = count === 0 ? "zero" : (highestUrgency === "severe" ? "severe" : (highestUrgency === "warning" ? "warning" : ""));
    let dotHtml = (badgeClass === "severe" || badgeClass === "warning") ? `<span class="aging-dot ${badgeClass}"></span>` : "";
    
    card.innerHTML = `
      <div class="doubt-subj-info">
        <span class="doubt-subj-name">${displaySub}</span>
        ${trendHtml}
      </div>
      <span class="doubt-subj-count ${badgeClass}">${count}${dotHtml}</span>
    `;
    
    card.addEventListener("click", () => {
      document.querySelectorAll(".doubt-subj-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      activeSyllabusSubject = subject;
      renderDoubtSubjectTopics(subject);
    });
    cardsContainer.appendChild(card);
  });
  
  if (activeSyllabusSubject) {
    renderDoubtSubjectTopics(activeSyllabusSubject);
  }
}

function renderDoubtSubjectTopics(subject) {
  let displaySub = subject === "Mathematics" ? "Maths" : subject;
  document.getElementById("doubt-subject-detail-title").textContent = `${displaySub} Doubts`;
  const container = document.getElementById("doubt-subject-topics-container");
  container.innerHTML = "";
  
  // Find doubt topics belonging to this subject
  let subjectDoubts = [];
  
  AppState.doubtTopics.forEach(topic => {
    let matchedSub = null;
    let chapTitle = "Foundations";
    const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
    
    Object.keys(activeSyllabus).forEach(sub => {
      (activeSyllabus[sub] || []).forEach(chap => {
        if (chap.topics.find(t => t.name === topic)) {
          matchedSub = sub;
          chapTitle = chap.chapter;
        }
      });
    });
    
    if (matchedSub === subject) {
      subjectDoubts.push({ name: topic, chapter: chapTitle });
    }
  });
  
  document.getElementById("doubt-detail-count-badge").textContent = subjectDoubts.length;
  
  if (subjectDoubts.length === 0) {
    container.innerHTML = `
      <div class="doubt-empty-state">
        <div class="doubt-empty-mascot">
          <svg class="celebrate-mascot-svg" viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="40" fill="rgba(16, 185, 129, 0.08)" stroke="var(--green)" stroke-width="2" stroke-dasharray="4,4" />
            <path d="M35 52 L45 62 L65 42" stroke="var(--green)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" class="checkmark-draw" />
            <circle cx="25" cy="30" r="2.5" fill="#FBBF24" style="animation: bounce 1.5s infinite 0.2s;" />
            <circle cx="75" cy="25" r="2" fill="#FBBF24" style="animation: bounce 1.5s infinite 0.6s;" />
            <circle cx="70" cy="70" r="3" fill="#FBBF24" style="animation: bounce 1.5s infinite;" />
          </svg>
        </div>
        <div class="doubt-empty-title">All Doubts Resolved!</div>
        <div class="doubt-empty-desc">No active doubts in ${displaySub}. Keep up the amazing work!</div>
        <button class="btn-primary doubt-empty-cta-btn" onclick="goToPracticeTestForSubject('${subject.replace(/'/g, "\\'")}')">
          Want to get ahead? Try a Sanskrit Test
        </button>
      </div>
    `;
    
    // Custom label text for specific subjects in CTA
    const ctaBtn = container.querySelector(".doubt-empty-cta-btn");
    if (ctaBtn) {
      ctaBtn.textContent = `Want to get ahead? Try a ${displaySub === "Mathematics" ? "Maths" : displaySub} Test`;
    }
    return;
  }
  
  subjectDoubts.forEach(doubt => {
    const details = getOrCreateDoubtDetails(doubt.name);
    const formattedDate = formatDoubtDate(details.dateMarked);
    
    // Clean topic ID for DOM element
    const cleanTopicId = doubt.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    
    const card = document.createElement("div");
    const subClass = getSubjectClassName(subject);
    card.className = `doubt-topic-card ${subClass}`;
    card.innerHTML = `
      <div class="doubt-card-header">
        <div class="doubt-card-header-main">
          <span class="doubt-topic-title-text">${doubt.name}</span>
          <span class="doubt-topic-chapter">${doubt.chapter}</span>
        </div>
        <span class="doubt-card-date">${formattedDate}</span>
      </div>
      
      <div class="doubt-card-diagnosis">
        <span class="diagnosis-label">AI Diagnosis:</span>
        <span class="diagnosis-text">${details.diagnosis}</span>
      </div>
      
      <div class="doubt-card-note-section">
        <label class="note-label" for="note-input-${cleanTopicId}">Your Doubt Note:</label>
        <div class="note-input-wrapper">
          <input type="text" class="doubt-note-input" id="note-input-${cleanTopicId}" 
                 placeholder="Add notes about what you don't understand..." 
                 value="${details.note || ''}" 
                 onchange="updateDoubtNote('${doubt.name.replace(/'/g, "\\'")}', this.value)" />
        </div>
      </div>
      
      <div class="doubt-card-actions">
        <button class="btn-outline btn-doubt-resolve" onclick="toggleTopicDoubt('${doubt.name.replace(/'/g, "\\'")}', false)">
          Mark Resolved
        </button>
        <button class="btn-primary btn-doubt-solve" onclick="resolveDoubtInAITutor('${doubt.name.replace(/'/g, "\\'")}')">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right: 6px;"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          Resolve in AI Tutor
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ── VIEW 6: PROGRESS ANALYTICS LOGIC ──
function initProgressCharts() {
  updateOverallCompletionPercent();
}

function updateWeeklyDigest() {
  const digestEl = document.getElementById("progress-weekly-digest");
  if (!digestEl) return;
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  if (isPendingClass) {
    digestEl.innerHTML = `
      <div class="weekly-digest-badge">Weekly Digest</div>
      <span class="weekly-digest-text">Weekly report pending upload of curriculum details for Grade ${AppState.studentGrade}.</span>
    `;
    return;
  }
  
  const activeDoubtsCount = AppState.doubtTopics.length;
  const resolvedCount = AppState.resolvedDoubtsHistory.length;
  
  let message = "";
  if (activeDoubtsCount > 0) {
    let subjectSample = "Mathematics";
    const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
    const firstDoubt = AppState.doubtTopics[0];
    Object.keys(activeSyllabus).forEach(sub => {
      (activeSyllabus[sub] || []).forEach(chap => {
        if (chap.topics.find(t => t.name === firstDoubt)) {
          subjectSample = sub;
        }
      });
    });
    
    let displaySampleSub = subjectSample === "Mathematics" ? "Maths" : subjectSample;
    message = `This week: You solved ${resolvedCount} doubts, but ${activeDoubtsCount} ${displaySampleSub} topic${activeDoubtsCount > 1 ? 's' : ''} need${activeDoubtsCount === 1 ? 's' : ''} urgent revision to secure mastery.`;
  } else if (resolvedCount > 0) {
    message = `Excellent streak! All doubts resolved this week, driving your overall syllabus confidence upward.`;
  } else {
    message = `Welcome active learner! Try a practice test to unlock your weekly learning speed digest.`;
  }
  
  digestEl.innerHTML = `
    <div class="weekly-digest-badge">Weekly Digest</div>
    <span class="weekly-digest-text">${message}</span>
  `;
}

function buildSparklineSvg(history) {
  if (!history || history.length < 2) return "";
  const lastTests = history.slice(-6); // Last 6 tests
  const width = 60;
  const height = 20;
  const padding = 2;
  
  const points = lastTests.map((run, idx) => {
    const pct = (run.score / run.total) * 100;
    const x = padding + (idx / (lastTests.length - 1)) * (width - 2 * padding);
    const y = height - padding - (pct / 100) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");
  
  return `
    <svg width="${width}" height="${height}" class="sparkline-svg" style="margin-left: 12px; vertical-align: middle;">
      <polyline fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      <circle cx="${points.split(" ").pop().split(",")[0]}" cy="${points.split(" ").pop().split(",")[1]}" r="2.5" fill="var(--blue)" />
    </svg>
  `;
}

function showDonutDetail(type, count, total) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  document.getElementById("progress-overall-donut-text").textContent = `${percent}%`;
  document.getElementById("progress-overall-donut-sublabel").textContent = type;
}

function bindLegendInteractions(masteredCount, totalTopics) {
  const completedLegend = document.getElementById("legend-completed");
  const doubtLegend = document.getElementById("legend-doubt");
  const pendingLegend = document.getElementById("legend-pending");
  
  if (completedLegend && doubtLegend && pendingLegend) {
    const compCircle = document.getElementById("donut-fill-completed");
    const doubtCircle = document.getElementById("donut-fill-doubt");
    const pendingCircle = document.getElementById("donut-fill-pending");
    
    const highlight = (activeCircle) => {
      [compCircle, doubtCircle, pendingCircle].forEach(c => {
        if (c) {
          if (c === activeCircle) {
            c.style.opacity = "1";
            c.style.strokeWidth = "17";
          } else {
            c.style.opacity = "0.25";
            c.style.strokeWidth = "14";
          }
        }
      });
    };
    
    const reset = () => {
      [compCircle, doubtCircle, pendingCircle].forEach(c => {
        if (c) {
          c.style.opacity = "1";
          c.style.strokeWidth = "14";
        }
      });
    };
    
    // Remove previous listeners via cloning to prevent double binds
    completedLegend.replaceWith(completedLegend.cloneNode(true));
    doubtLegend.replaceWith(doubtLegend.cloneNode(true));
    pendingLegend.replaceWith(pendingLegend.cloneNode(true));
    
    const newCompL = document.getElementById("legend-completed");
    const newDoubtL = document.getElementById("legend-doubt");
    const newPendL = document.getElementById("legend-pending");
    
    newCompL.addEventListener("mouseenter", () => highlight(compCircle));
    newCompL.addEventListener("mouseleave", reset);
    newDoubtL.addEventListener("mouseenter", () => highlight(doubtCircle));
    newDoubtL.addEventListener("mouseleave", reset);
    newPendL.addEventListener("mouseenter", () => highlight(pendingCircle));
    newPendL.addEventListener("mouseleave", reset);
    
    newCompL.addEventListener("click", () => showDonutDetail("Completed", masteredCount, totalTopics));
    newDoubtL.addEventListener("click", () => showDonutDetail("Doubts", AppState.doubtTopics.length, totalTopics));
    newPendL.addEventListener("click", () => showDonutDetail("Pending", totalTopics - masteredCount - AppState.doubtTopics.length, totalTopics));
  }
}

function updateOverallCompletionPercent() {
  let totalTopics = 0;
  let masteredCount = AppState.completedTopics.length;
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  Object.keys(activeSyllabus).forEach(subject => {
    (activeSyllabus[subject] || []).forEach(chap => {
      totalTopics += chap.topics.length;
    });
  });
  
  if (totalTopics === 0) totalTopics = 10;
  if (isPendingClass) {
    totalTopics = 0;
    masteredCount = 0;
  }
  
  const compPct = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;
  const doubtPct = totalTopics > 0 ? Math.round((AppState.doubtTopics.length / totalTopics) * 100) : 0;
  const pendingPct = totalTopics > 0 ? Math.max(0, 100 - compPct - doubtPct) : 100;
  
  const C = 439.82; // Circumference
  
  const completedCircle = document.getElementById("donut-fill-completed");
  const doubtCircle = document.getElementById("donut-fill-doubt");
  const pendingCircle = document.getElementById("donut-fill-pending");
  
  if (completedCircle && doubtCircle && pendingCircle) {
    const compVal = (compPct / 100) * C;
    completedCircle.style.strokeDasharray = `${compVal} ${C}`;
    completedCircle.style.strokeDashoffset = "0";
    
    const doubtVal = (doubtPct / 100) * C;
    doubtCircle.style.strokeDasharray = `${doubtVal} ${C}`;
    doubtCircle.style.strokeDashoffset = `-${compVal}`;
    
    const pendingVal = (pendingPct / 100) * C;
    pendingCircle.style.strokeDasharray = `${pendingVal} ${C}`;
    pendingCircle.style.strokeDashoffset = `-${compVal + doubtVal}`;
    
    // Sweeping Stripe/Linear-style loading animation
    [completedCircle, doubtCircle, pendingCircle].forEach(c => {
      c.style.transition = "none";
      const savedDasharray = c.style.strokeDasharray;
      c.style.strokeDasharray = `0 ${C}`;
      setTimeout(() => {
        c.style.transition = "all 1.2s cubic-bezier(0.25, 1, 0.5, 1)";
        c.style.strokeDasharray = savedDasharray;
      }, 50);
    });

    document.getElementById("progress-overall-donut-text").textContent = isPendingClass ? "N/A" : `${compPct}%`;
    document.getElementById("progress-overall-donut-sublabel").textContent = "Completed";
    
    document.getElementById("progress-legend-completed").textContent = isPendingClass ? "0 Completed" : `${masteredCount} Completed`;
    document.getElementById("progress-legend-doubt").textContent = isPendingClass ? "0 Doubts" : `${AppState.doubtTopics.length} Doubts`;
    document.getElementById("progress-legend-pending").textContent = isPendingClass ? "0 Pending" : `${totalTopics - masteredCount - AppState.doubtTopics.length} Pending`;
    
    bindLegendInteractions(masteredCount, totalTopics);
  }
}

function toggleSubjectChaptersExpand(cardElement, subjectName) {
  const expandContainer = cardElement.querySelector(".progress-subject-chapters-expand");
  if (!expandContainer) return;
  
  if (expandContainer.style.display === "block") {
    expandContainer.style.display = "none";
    cardElement.classList.remove("expanded");
    return;
  }
  
  document.querySelectorAll(".progress-subject-row-card").forEach(card => {
    if (card !== cardElement) {
      card.classList.remove("expanded");
      const exp = card.querySelector(".progress-subject-chapters-expand");
      if (exp) exp.style.display = "none";
    }
  });
  
  cardElement.classList.add("expanded");
  expandContainer.style.display = "block";
  expandContainer.innerHTML = `<div style="padding: 4px 0; font-size: 11px; color: var(--graphite);">Loading chapters...</div>`;
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  const chapters = activeSyllabus[subjectName] || [];
  
  if (chapters.length === 0) {
    expandContainer.innerHTML = `<div style="padding: 4px 0; font-size: 11px; color: var(--graphite);">No chapters found.</div>`;
    return;
  }
  
  let html = `<div class="mini-chapters-list" style="margin-top: 10px;">`;
  chapters.forEach(chap => {
    let chapTotal = chap.topics.length;
    let chapCompleted = 0;
    let chapDoubts = 0;
    
    chap.topics.forEach(t => {
      if (AppState.completedTopics.includes(t.name)) chapCompleted++;
      else if (AppState.doubtTopics.includes(t.name)) chapDoubts++;
    });
    
    const chapPct = Math.round((chapCompleted / chapTotal) * 100);
    
    let doubtBadgeHtml = "";
    if (chapDoubts > 0) {
      doubtBadgeHtml = `
        <span class="mini-chap-doubt-badge" style="display: inline-flex; align-items: center;">
          <span style="color: var(--doubt-red); margin-right: 3px; font-size: 8px;">●</span>
          ${chapDoubts} doubt${chapDoubts > 1 ? 's' : ''}
        </span>
      `;
    }
    
    html += `
      <div class="mini-chapter-item">
        <div class="mini-chapter-info">
          <span class="mini-chapter-name">${chap.chapter}</span>
          <span class="mini-chapter-stats">${chapCompleted}/${chapTotal} topics ${doubtBadgeHtml}</span>
        </div>
        <div class="mini-chapter-progress-bar">
          <div class="mini-chapter-progress-fill" style="width: ${chapPct}%;"></div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  expandContainer.innerHTML = html;
}

function renderProgressCharts() {
  updateWeeklyDigest();
  updateOverallCompletionPercent();
  
  const isPendingClass = (AppState.studentGrade === "8" || AppState.studentGrade === "11" || AppState.studentGrade === "12");
  
  const studyHoursEl = document.getElementById("progress-total-study-hours");
  if (studyHoursEl) {
    studyHoursEl.innerHTML = `${AppState.studyHours} hours <span class="sub-label-kpi">this week</span>`;
  }
  
  const trendContainer = document.getElementById("progress-test-performance-trend-container");
  trendContainer.innerHTML = "";
  
  if (AppState.testHistory.length === 0 || isPendingClass) {
    trendContainer.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--graphite);">No attempted tests to graph trends</div>`;
    return;
  }
  
  const history = AppState.testHistory || [];
  let avgPercent = 0;
  if (history.length > 0) {
    let sumPercent = 0;
    history.forEach(run => {
      sumPercent += Math.round((run.score / run.total) * 100);
    });
    avgPercent = Math.round(sumPercent / history.length);
  }
  
  const avgEl = document.getElementById("progress-overall-test-average");
  if (avgEl) {
    const sparklineHtml = buildSparklineSvg(history);
    avgEl.innerHTML = `
      <div style="display:flex; align-items:center;">
        <span>${avgPercent}% average</span>
        ${sparklineHtml}
      </div>
      <span class="sub-label-kpi">overall score</span>
    `;
  }
  
  const testCard = document.getElementById("progress-test-trends-card");
  if (testCard) {
    if (avgPercent >= 70) {
      testCard.setAttribute("data-glow-color", "green");
    } else {
      testCard.setAttribute("data-glow-color", "red");
    }
  }
  
  history.slice(-3).forEach(run => {
    const card = document.createElement("div");
    card.className = "trend-card-item";
    const percent = Math.round((run.score / run.total) * 100);
    
    let scoreColorClass = "score-red";
    if (percent >= 40 && percent < 70) {
      scoreColorClass = "score-amber";
    } else if (percent >= 70) {
      scoreColorClass = "score-green";
    }
    
    card.innerHTML = `
      <div class="trend-item-info">
        <span class="trend-item-title">${run.topic}</span>
        <span class="trend-item-date">${run.date}</span>
      </div>
      <span class="trend-item-score ${scoreColorClass}">${percent}%</span>
    `;
    trendContainer.appendChild(card);
  });
}

// ── VIEW 7: HISTORY LOGS LOGIC ──

// Convert human readable date strings into relative timestamps for chronological sorting
function getSortValue(dateStr) {
  if (!dateStr) return 0;
  const now = new Date();
  const lower = dateStr.toLowerCase().trim();
  if (lower === "just now" || lower === "today") {
    return now.getTime();
  }
  if (lower === "yesterday") {
    return now.getTime() - 24 * 60 * 60 * 1000;
  }
  if (lower.includes("day ago") || lower.includes("days ago")) {
    const match = lower.match(/(\d+)\s+day/);
    const days = match ? parseInt(match[1]) : 1;
    return now.getTime() - days * 24 * 60 * 60 * 1000;
  }
  if (lower.includes("week ago") || lower.includes("weeks ago")) {
    const match = lower.match(/(\d+)\s+week/);
    const weeks = match ? parseInt(match[1]) : 1;
    return now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000;
  }
  
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return 0;
}

function getTimelineMarkerIcon(type) {
  if (type === "chat") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  }
  if (type === "test") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>`;
}

function initHistoryView() {
  document.getElementById("new-history-chat-btn").addEventListener("click", () => {
    switchTab("ai-tutor");
    // Start empty new conversation
    const container = document.getElementById("chat-conversation-container");
    if (container) container.innerHTML = "";
    const onboarding = document.getElementById("chat-welcome-onboarding");
    if (onboarding) onboarding.style.display = "block";
    const body = document.getElementById("chat-scroller-body");
    if (body) body.classList.add("empty-chat-state");
  });
  
  // Expose global modal functions
  window.closeHistoryModals = closeHistoryModals;
  window.filterHistoryTimeline = filterHistoryTimeline;
  window.handleTimelineItemClick = handleTimelineItemClick;
}

function closeHistoryModals() {
  document.getElementById("history-transcript-modal-overlay").classList.remove("active");
  document.getElementById("history-doubt-modal-overlay").classList.remove("active");
}

function openTranscriptModal(title) {
  const session = AppState.chatHistory.find(c => c.title === title);
  if (!session) return;
  
  const titleEl = document.getElementById("history-transcript-modal-title");
  titleEl.textContent = `Transcript: ${session.title}`;
  
  const bodyEl = document.getElementById("history-transcript-dialog-body");
  bodyEl.innerHTML = "";
  
  const messages = session.messages || [
    { sender: "student", text: `I had questions on ${session.title}`, time: "12:00 PM" },
    { sender: "tutor", text: `I explained the concepts of ${session.title} and went through multiple examples.`, time: "12:01 PM" }
  ];
  
  messages.forEach(msg => {
    const bubbleRow = document.createElement("div");
    bubbleRow.className = `dialog-bubble-row ${msg.sender}`;
    
    const avatar = document.createElement("div");
    avatar.className = "dialog-avatar";
    avatar.textContent = msg.sender === "student" ? AppState.studentAvatar : "AI";
    
    const wrap = document.createElement("div");
    wrap.className = "dialog-bubble-content-wrap";
    
    const bubble = document.createElement("div");
    bubble.className = "dialog-bubble";
    bubble.textContent = msg.text;
    
    const time = document.createElement("span");
    time.className = "dialog-time";
    time.textContent = msg.time;
    
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    
    bubbleRow.appendChild(avatar);
    bubbleRow.appendChild(wrap);
    
    bodyEl.appendChild(bubbleRow);
  });
  
  const continueBtn = document.getElementById("history-continue-chat-btn");
  if (continueBtn) {
    const newContinueBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
    newContinueBtn.addEventListener("click", () => {
      closeHistoryModals();
      switchTab("ai-tutor");
      startAIChatOnTopic(session.title.replace(" Intro", ""));
    });
  }
  
  document.getElementById("history-transcript-modal-overlay").classList.add("active");
}

function openDoubtComparisonModal(topic) {
  const doubt = AppState.resolvedDoubtsHistory.find(d => d.topic === topic);
  if (!doubt) return;
  
  const beforeScore = doubt.beforeScore !== undefined ? doubt.beforeScore : 33;
  const afterScore = doubt.afterScore !== undefined ? doubt.afterScore : 100;
  const attempts = doubt.attempts || 1;
  const method = doubt.method || "AI Tutor";
  const details = doubt.details || "Resolved via study sessions.";

  const titleEl = document.getElementById("history-doubt-modal-title");
  titleEl.textContent = `Doubt Progression: ${doubt.topic}`;
  
  const bodyEl = document.getElementById("history-doubt-modal-body");
  bodyEl.innerHTML = `
    <div class="doubt-progression-panel">
      <p class="doubt-progression-summary">${details}</p>
      
      <div class="progression-stats-comparison">
        <div class="progression-stat-row">
          <div class="progression-stat-label-wrap">
            <span class="progression-stat-lbl">Initial Score</span>
            <span class="progression-stat-val before">${beforeScore}%</span>
          </div>
          <div class="progression-bar-track">
            <div class="progression-bar-fill before" style="width: ${beforeScore}%"></div>
          </div>
        </div>
        
        <div class="progression-stat-row" style="margin-top: 12px;">
          <div class="progression-stat-label-wrap">
            <span class="progression-stat-lbl">Mastered Score</span>
            <span class="progression-stat-val after">${afterScore}%</span>
          </div>
          <div class="progression-bar-track">
            <div class="progression-bar-fill after" style="width: ${afterScore}%"></div>
          </div>
        </div>

        <div class="progression-trend-indicator">
          <span>↑ +${afterScore - beforeScore}% Score Growth</span>
          <span style="font-size: 11px; font-weight: normal; color: var(--graphite);">Resolved in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} via ${method}</span>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("history-doubt-modal-overlay").classList.add("active");
}

function handleTimelineItemClick(type, title) {
  if (type === "chat") {
    // Find the session matching the title
    const session = AppState.chatHistory.find(c => title.startsWith(c.title));
    if (session) {
      openTranscriptModal(session.title);
    }
  } else if (type === "doubt") {
    const topic = title.replace(" Resolved", "");
    openDoubtComparisonModal(topic);
  } else if (type === "test") {
    switchTab("tests");
  }
}

function compileTimelineData() {
  const timelineItems = [];

  // Chats
  AppState.chatHistory.forEach(session => {
    timelineItems.push({
      type: "chat",
      title: session.title,
      date: session.date,
      body: session.preview || "AI Tutor session on this topic.",
      sortValue: getSortValue(session.date)
    });
  });

  // Tests
  AppState.testHistory.forEach(run => {
    const pct = Math.round((run.score / run.total) * 100);
    timelineItems.push({
      type: "test",
      title: `${run.topic} Test`,
      date: run.date,
      body: `Practice test completed: scored ${pct}% (${run.score}/${run.total} correct).`,
      sortValue: getSortValue(run.date)
    });
  });

  // Resolved Doubts
  AppState.resolvedDoubtsHistory.forEach(run => {
    timelineItems.push({
      type: "doubt",
      title: `${run.topic} Resolved`,
      date: run.date,
      body: run.details || "Doubt marked as resolved.",
      sortValue: getSortValue(run.date)
    });
  });

  // Sort descending by sortValue
  timelineItems.sort((a, b) => b.sortValue - a.sortValue);
  return timelineItems;
}

function filterHistoryTimeline() {
  const query = document.getElementById("history-search-input").value.toLowerCase();
  const typeFilter = document.getElementById("history-type-filter").value;
  
  const allItems = compileTimelineData();
  const filtered = allItems.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query) || item.body.toLowerCase().includes(query);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesQuery && matchesType;
  });
  
  const timelineContainer = document.getElementById("history-timeline-feed-container");
  timelineContainer.innerHTML = "";
  
  if (filtered.length === 0) {
    timelineContainer.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--graphite);">No activities match search criteria</div>`;
    return;
  }
  
  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "timeline-item";
    div.innerHTML = `
      <div class="timeline-marker ${item.type}">
        ${getTimelineMarkerIcon(item.type)}
      </div>
      <div class="timeline-content" onclick="handleTimelineItemClick('${item.type}', '${item.title.replace(/'/g, "\\'")}')">
        <div class="timeline-header">
          <span class="timeline-title">${item.title}</span>
          <span class="timeline-date">${item.date}</span>
        </div>
        <div class="timeline-body">${item.body}</div>
        <span class="timeline-badge ${item.type}">${item.type === 'chat' ? 'AI Chat' : item.type === 'test' ? 'Practice Test' : 'Resolved Doubt'}</span>
      </div>
    `;
    timelineContainer.appendChild(div);
  });
}

function renderHistoryView() {
  // Compute and render dynamic top weekly engagement comparison KPI stat
  const totalSessionsThisWeek = AppState.chatHistory.length + AppState.testHistory.length + AppState.resolvedDoubtsHistory.length;
  const diffVal = Math.max(1, Math.round(totalSessionsThisWeek / 2));
  const statText = `${totalSessionsThisWeek} learning sessions logged this week (+${diffVal} from last week)`;
  const statEl = document.getElementById("history-engagement-stat");
  if (statEl) {
    statEl.textContent = statText;
  }

  // Chat history sessions
  const chatContainer = document.getElementById("history-chat-conversations-list");
  chatContainer.innerHTML = "";
  
  AppState.chatHistory.forEach(session => {
    const card = document.createElement("div");
    card.className = "history-session-entry-card";
    card.innerHTML = `
      <div class="test-entry-info">
        <span class="history-session-title">${session.title}</span>
        <span class="history-session-meta">${session.date}</span>
        <div class="chat-preview-text">${session.preview || "AI Tutor conversation"}</div>
      </div>
      <span class="tag-badge">AI Chat</span>
    `;
    card.addEventListener("click", () => {
      openTranscriptModal(session.title);
    });
    chatContainer.appendChild(card);
  });
  
  // Resolved doubts logs
  const doubtsContainer = document.getElementById("history-resolved-doubts-container");
  doubtsContainer.innerHTML = "";
  
  if (AppState.resolvedDoubtsHistory.length === 0) {
    doubtsContainer.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--graphite);">No doubts resolved yet</div>`;
  } else {
    AppState.resolvedDoubtsHistory.forEach(run => {
      const card = document.createElement("div");
      card.className = "history-session-entry-card";
      card.innerHTML = `
        <div class="test-entry-info">
          <span class="history-session-title">${run.topic}</span>
          <span class="history-session-meta">${run.date}</span>
          <div class="resolved-doubt-method-note">Resolved in ${run.attempts || 1} ${run.attempts === 1 ? 'try' : 'tries'} via ${run.method || 'AI Tutor'}</div>
        </div>
        <span class="tag-badge" style="background-color: var(--green-light); color: var(--green);">SOLVED</span>
      `;
      card.addEventListener("click", () => {
        openDoubtComparisonModal(run.topic);
      });
      doubtsContainer.appendChild(card);
    });
  }

  // Render search and timeline feed
  filterHistoryTimeline();
}

// Sync mouse coordinates for spotlight cards
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest("[data-glow]");
  if (card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--x", x.toFixed(2));
    card.style.setProperty("--y", y.toFixed(2));
  }
});

// ── CUSTOM UX INTERACTIVE HELPERS ──

// Count-up value animation
function animateNumberValue(id, start, end, duration, formatFn = null) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const val = start + progress * (end - start);
    
    if (formatFn) {
      obj.innerHTML = formatFn(val);
    } else {
      obj.textContent = Math.floor(val);
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Weekly schedule day click preview
const WEEKLY_SCHEDULE_DATA = {
  "M": { title: "Algebra Basics", description: "Review variables and coefficients", type: "revision", time: "4:00 PM" },
  "T": { title: "Grammar Quiz", description: "Practice passive voice sets", type: "quiz", time: "5:30 PM" },
  "W": { title: "Physics Lab Note", description: "Submit optics lab observations", type: "assignment", time: "11:00 AM" },
  "Th": { title: "Quadratic Equations", description: "Attend live class with AI Tutor", type: "class", time: "3:00 PM" },
  "F": { title: "Science Assignment", description: "Complete digestion system diagram", type: "assignment", time: "4:30 PM" },
  "Sa": { title: "Weekly Mock Test", description: "Complete Full Maths Syllabus mock", type: "test", time: "10:00 AM" },
  "Su": { title: "Self Study & Doubts", description: "Clear doubts with AI Tutor", type: "revision", time: "2:00 PM" }
};

let tooltipHideTimeout = null;

function showDayScheduleTooltip(element, dayKey) {
  const schedule = WEEKLY_SCHEDULE_DATA[dayKey];
  if (!schedule) return;
  
  // Cancel any pending hide
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout);
    tooltipHideTimeout = null;
  }
  
  let tooltip = document.getElementById("schedule-day-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "schedule-day-tooltip";
    tooltip.className = "schedule-tooltip-card";
    document.body.appendChild(tooltip);
  }
  
  tooltip.innerHTML = `
    <div class="tooltip-arrow"></div>
    <div class="tooltip-header">
      <span class="tooltip-tag ${schedule.type}">${schedule.type.toUpperCase()}</span>
      <span class="tooltip-time">${schedule.time}</span>
    </div>
    <h4 class="tooltip-title">${schedule.title}</h4>
    <p class="tooltip-desc">${schedule.description}</p>
  `;
  
  tooltip.style.display = "block";
  const height = tooltip.offsetHeight;
  
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  tooltip.style.left = `${rect.left + scrollLeft + (rect.width / 2) - 100}px`;
  tooltip.style.top = `${rect.top + scrollTop - height - 8}px`;
  
  tooltip.classList.add("visible");
}

function hideDayScheduleTooltip() {
  const tooltip = document.getElementById("schedule-day-tooltip");
  if (tooltip) {
    tooltip.classList.remove("visible");
    
    // Clear any existing timeout first
    if (tooltipHideTimeout) {
      clearTimeout(tooltipHideTimeout);
    }
    
    tooltipHideTimeout = setTimeout(() => {
      if (!tooltip.classList.contains("visible")) {
        tooltip.style.display = "none";
      }
    }, 200);
  }
}

// Topics Mastered Checklist Modal content loader
function loadMasteredTopicsList() {
  const listContainer = document.getElementById("mastery-modal-list");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";
  
  const activeSyllabus = SYLLABUS_DB[AppState.studentGrade] || {};
  const subjects = sortSubjects(Object.keys(activeSyllabus));
  
  let totalCompleted = 0;
  
  subjects.forEach(sub => {
    const chapters = activeSyllabus[sub] || [];
    let completedInSubject = [];
    
    chapters.forEach(chap => {
      chap.topics.forEach(t => {
        if (AppState.completedTopics.includes(t.name)) {
          completedInSubject.push(t.name);
        }
      });
    });
    
    if (completedInSubject.length > 0) {
      totalCompleted += completedInSubject.length;
      
      const groupDiv = document.createElement("div");
      groupDiv.className = "modal-subject-group";
      
      const displaySub = sub === "Mathematics" ? "Maths" : sub;
      
      let topicsHtml = "";
      completedInSubject.forEach(topicName => {
        topicsHtml += `
          <div class="modal-topic-item">
            <span class="modal-topic-check-icon">✓</span>
            <span class="modal-topic-name">${topicName}</span>
          </div>
        `;
      });
      
      groupDiv.innerHTML = `
        <div class="modal-subject-title">${displaySub}</div>
        <div class="modal-topics-list">
          ${topicsHtml}
        </div>
      `;
      listContainer.appendChild(groupDiv);
    }
  });
  
  if (totalCompleted === 0) {
    listContainer.innerHTML = `<div class="modal-no-topics">No topics mastered yet. Complete quizzes to master topics!</div>`;
  }
}


// Confetti burst for milestone celebration
function launchConfettiExplosion() {
  const container = document.getElementById("confetti-canvas-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  const colors = ["#2C5688", "#FD4463", "#FFD700", "#2ECC71", "#6C5CE7", "#E84393"];
  const particleCount = 60;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti-particle";
    
    const size = Math.floor(Math.random() * 6) + 6;
    const isCircle = Math.random() > 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const xStart = window.innerWidth / 2;
    const yStart = window.innerHeight * 0.7;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.floor(Math.random() * 300) + 120;
    const xEnd = xStart + Math.cos(angle) * distance;
    const yEnd = yStart + Math.sin(angle) * distance + 250;
    const rotEnd = Math.floor(Math.random() * 720) - 360;
    
    particle.style.setProperty("--x-start", `${xStart}px`);
    particle.style.setProperty("--y-start", `${yStart}px`);
    particle.style.setProperty("--x-end", `${xEnd}px`);
    particle.style.setProperty("--y-end", `${yEnd}px`);
    particle.style.setProperty("--rot-end", `${rotEnd}deg`);
    particle.style.setProperty("--color", color);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--radius", isCircle ? "50%" : "0px");
    particle.style.setProperty("--duration", `${Math.random() * 1.5 + 1.5}s`);
    
    container.appendChild(particle);
  }
}

// Milestone celebration trigger
function triggerMilestoneCelebration() {
  if (AppState.streak >= 14) {
    const celebrationOverlay = document.getElementById("milestone-toast-celebration");
    if (celebrationOverlay) {
      celebrationOverlay.style.display = "flex";
      celebrationOverlay.offsetHeight;
      celebrationOverlay.classList.add("active");
      
      launchConfettiExplosion();
    }
  }
}

// Global click handler for floating attachment menu options
function handleAttachOption(type) {
  const textBox = document.getElementById("chat-user-textbox");
  const sendBtn = document.getElementById("chat-send-trigger-btn");
  if (!textBox) return;
  
  if (type === 'media') {
    textBox.value = "[📎 Attached Photo: cell_structure.png] " + textBox.value;
  } else if (type === 'document') {
    textBox.value = "[📎 Attached Document: circular_motion.pdf] " + textBox.value;
  }
  
  // Enable the send button
  if (sendBtn) sendBtn.disabled = false;
  
  // Close menu
  const menu = document.getElementById("chat-attach-menu");
  const btn = document.getElementById("chat-attach-btn");
  if (menu && btn) {
    menu.style.display = "none";
    btn.classList.remove("active");
  }
  
  // Refocus textbox
  textBox.focus();
}

// Dynamic cursor deflection physics for background bokeh circles
function initBackgroundCirclesPhysics() {
  const circles = document.querySelectorAll('.decor-circle');
  if (circles.length === 0) return;
  
  let mouseX = -1000;
  let mouseY = -1000;
  let prevMouseX = -1000;
  let prevMouseY = -1000;
  let mouseVx = 0;
  let mouseVy = 0;
  let lastTime = Date.now();
  
  // Track mouse coordinates and calculate velocity vector
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastTime);
    lastTime = now;
    
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (prevMouseX === -1000) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }
    
    // velocity in px/ms
    mouseVx = (mouseX - prevMouseX) / dt;
    mouseVy = (mouseY - prevMouseY) / dt;
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  });
  
  // Initialize states for each circle
  const circleStates = [];
  circles.forEach((circle) => {
    circleStates.push({
      element: circle,
      x: 0,   // current displacement x
      y: 0,   // current displacement y
      vx: 0,  // displacement velocity x
      vy: 0,  // displacement velocity y
    });
  });
  
  const interactionRadius = 150; // pixels (reduced from 240)
  const springK = 0.06;          // spring constant pulling back (increased from 0.035 for faster return)
  const damping = 0.85;          // friction decay (reduced from 0.91 for more dampening)
  const forceScale = 80;         // sweep momentum boost (reduced from 250)
  const maxDisplacement = 200;   // clamp maximum boundary (reduced from 400)
  
  function updatePhysics() {
    circleStates.forEach((state) => {
      const rect = state.element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const dx = cx - mouseX;
      const dy = cy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < interactionRadius && dist > 0) {
        // Calculate force based on proximity (1 at center, 0 at boundary)
        const proximity = (interactionRadius - dist) / interactionRadius;
        const force = proximity * proximity; 
        
        // 1. Deflect circle in the direction of the cursor's velocity (inertial throw)
        const pushX = mouseVx * force * forceScale;
        const pushY = mouseVy * force * forceScale;
        
        // 2. Radial push away from the cursor (so it feels solid)
        const radialForce = force * 12; // reduced from 35
        const pushRadX = (dx / dist) * radialForce;
        const pushRadY = (dy / dist) * radialForce;
        
        state.vx += pushX + pushRadX;
        state.vy += pushY + pushRadY;
      }
      
      // Spring force pulling back to origin (0, 0)
      const ax = -state.x * springK;
      const ay = -state.y * springK;
      
      state.vx += ax;
      state.vy += ay;
      
      // Apply friction damping
      state.vx *= damping;
      state.vy *= damping;
      
      // Update coordinates
      state.x += state.vx;
      state.y += state.vy;
      
      // Clamp coordinates to max displacement
      const disp = Math.sqrt(state.x * state.x + state.y * state.y);
      if (disp > maxDisplacement) {
        state.x = (state.x / disp) * maxDisplacement;
        state.y = (state.y / disp) * maxDisplacement;
      }
      
      // Write custom property values to CSS variables
      state.element.style.setProperty('--disturb-x', `${state.x}px`);
      state.element.style.setProperty('--disturb-y', `${state.y}px`);
    });
    
    // Decelerate mouse velocity slightly when mouse is not moving
    const decay = 0.9;
    mouseVx *= decay;
    mouseVy *= decay;
    
    requestAnimationFrame(updatePhysics);
  }
  
  // Start the physics loop
  requestAnimationFrame(updatePhysics);
}

