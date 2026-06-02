import os
import time
from typing import Optional
 
import google.generativeai as genai
from groq import Groq
 
 
# ── API Clients ────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
 
 
# ── Tutor Instructions ─────────────────────────────────────
SYSTEM_PROMPT = """You are a friendly and encouraging AI tutor for Indian school students from Class 5 to Class 10.
 
Your rules:
 
1. Follow the output-language instruction provided with the student's current question.
   - If instructed to answer in English, reply entirely in English only.
   - If instructed to answer in Hindi, reply in simple Hindi using Devanagari script only.
   - If instructed to answer in Hinglish, reply in natural Hinglish using Roman English letters only, even if the transcribed question appears in Devanagari script.
   - Never mix Devanagari script into a Roman Hinglish answer.
   - The current question's output-language instruction has priority over previous chat history.
 
2. Keep explanations simple, clear, and age-appropriate for students aged 10 to 16 years.
 
3. Normal chatbot answer rules:
   - For a normal first question, give a short answer of 2 to 3 sentences maximum.
   - Include one simple real-life example only if useful.
   - Never make a simple answer unnecessarily long.
 
4. Study-topic answer rules:
   - If the question contains STUDY_TOPIC_MODE, treat it as a syllabus-topic explanation request.
   - For STUDY_TOPIC_MODE, give a detailed answer in headings and bullet points.
   - Do not give a short 4-5 line answer.
   - Do not write one long paragraph.
   - Explain step by step in easy language.
   - Include important keywords and a short summary.
   - Keep the answer suitable for the student's selected class level.
   - Start definitions with Definition:.
   - Start very important lines with Important:.
   - Start memory-based lines with Remember:.
 
5. Revision-topic answer rules:
   - If the question contains REVISION_TOPIC_MODE, treat it as a short revision request.
   - Keep revision answers short, crisp, exam-focused, and mostly in bullet points.
   - Use clean section titles such as Quick Meaning, Key Points, Important Terms, Must Remember, Quick Flowchart, and Exam Points.
   - Do not write the word Heading before section titles.
   - Use text-based flowcharts or simple diagrams where useful.
   - Definitions and most important facts may be bold, but do not over-format every line.
 
6. Use the conversation history to answer follow-up questions correctly.
 
6. If the question is inappropriate or unrelated to learning, politely redirect the student to study-related topics in one sentence.
"""
 
 
def build_language_instruction(language: str) -> str:
    """
    Build a strict language instruction using the language style
    already detected by app.py.
    """
 
    if language == "en":
        return (
            "Output language instruction: Answer entirely in English only. "
            "Do not use Hindi, Hinglish, Urdu, or Devanagari words."
        )
 
    if language == "hi":
        return (
            "Output language instruction: Answer entirely in simple Hindi using "
            "Devanagari script only. Do not write the answer in Roman Hinglish."
        )
 
    if language == "hinglish":
        return (
            "Output language instruction: Answer in natural Hinglish using Roman "
            "English letters only. Do not use Devanagari script anywhere in the answer, "
            "even if the student's transcribed question is written in Devanagari. "
            "For example, write: 'Photosynthesis ek process hai jisme paudhe apna food "
            "banate hain.' Do not write: 'प्रकाश संश्लेषण एक प्रक्रिया है जिसमें पौधे "
            "अपना भोजन बनाते हैं।'"
        )
 
    return (
        "Output language instruction: Answer in the same language and script style "
        "requested for the student's current question."
    )
 
 
def build_student_profile_instruction(
    class_level: Optional[str],
    board: Optional[str],
) -> str:
    """
    Build instructions so the response matches the student's class level.
    """
 
    if not class_level and not board:
        return ""
 
    profile_lines = ["Student learning profile:"]
 
    if class_level:
        profile_lines.append(f"- Class: {class_level}")
 
    if board:
        profile_lines.append(f"- Education board: {board}")
 
    if class_level in {"5", "6"}:
        level_instruction = (
            "Explain at a beginner school level. Use very simple words and familiar "
            "examples. Avoid advanced terms unless you immediately explain them "
            "in easy words."
        )
    elif class_level in {"7", "8"}:
        level_instruction = (
            "Explain at a middle-school level. Use simple textbook terms with a "
            "clear explanation and one helpful example when needed."
        )
    elif class_level in {"9", "10"}:
        level_instruction = (
            "Explain at a secondary-school level. Use accurate textbook terminology "
            "and include important concepts, formulas, or keywords when relevant."
        )
    else:
        level_instruction = (
            "Explain clearly at an age-appropriate Indian school level."
        )
 
    board_instruction = (
        "Keep the explanation appropriate for the selected Indian education board, "
        "but do not claim exact textbook wording unless textbook content is provided."
    )
 
    return "\n".join(profile_lines) + "\n" + level_instruction + "\n" + board_instruction
 
 
def is_detail_question(question: str) -> bool:
    """
    Detect whether the student is asking for a more detailed explanation.
    """
 
    detail_keywords = [
        "explain more",
        "more detail",
        "in detail",
        "why",
        "how",
        "elaborate",
        "aur batao",
        "detail mein",
        "kyun",
        "kaise",
        "samjhao",
        "bataiye",
        "विस्तार",
        "समझाओ",
        "क्यों",
        "कैसे",
        "और बताओ",
    ]
 
    normalized_question = (question or "").lower()
 
    return any(keyword in normalized_question for keyword in detail_keywords)
 
 
def is_study_topic_prompt(question: str) -> bool:
    """
    Detect syllabus-topic study prompts coming from the Syllabus Tracker.
    """
 
    normalized_question = (question or "").lower()
 
    return (
        "study_topic_mode" in normalized_question
        or (
            "topic:" in normalized_question
            and "chapter:" in normalized_question
            and "answer format:" in normalized_question
        )
    )
 
 
def is_revision_topic_prompt(question: str) -> bool:
    """
    Detect short revision prompts coming from the Syllabus Tracker.
    """
 
    normalized_question = (question or "").lower()
    return "revision_topic_mode" in normalized_question
 
 
def build_user_message(
    question: str,
    language: str,
    detailed: bool,
    class_level: Optional[str] = None,
    board: Optional[str] = None,
) -> str:
    """
    Build the current user prompt with language and student-level control.
    """
 
    question = str(question or "").strip()
    language_instruction = build_language_instruction(language)
    profile_instruction = build_student_profile_instruction(class_level, board)
    study_topic_prompt = is_study_topic_prompt(question)
    revision_topic_prompt = is_revision_topic_prompt(question)
 
    if study_topic_prompt:
        return f"""The student is studying a syllabus topic from the Syllabus Tracker.
 
This is STUDY_TOPIC_MODE.
 
You must give a detailed, structured, point-wise explanation.
Do not give the answer in one long paragraph.
Do not give a short 4-5 line answer.
 
Output formatting rules:
- Use Markdown-style formatting.
- Use bold-looking headings by writing section titles clearly.
- Use bullet points under every heading.
- Highlight important definitions by starting the line with Definition:.
- Highlight important lines by starting the line with Important:.
- Highlight memory-based lines by starting the line with Remember:.
- Keep paragraphs very short.
- Put every major idea on a new line.
- Use blank lines between sections.
 
Required answer format:
 
Topic Explanation
 
1. Meaning
- Definition: Explain the topic in simple words.
- Give 1 or 2 easy points about what it means.
 
2. Why It Is Important
- Important: Explain why this topic matters.
- Connect it with daily life or school learning.
 
3. Step-by-Step Explanation
- Explain the concept step by step.
- Use separate bullet points.
- Do not combine all steps into one paragraph.
 
4. Important Keywords
- Keyword 1: Simple meaning.
- Keyword 2: Simple meaning.
- Keyword 3: Simple meaning.
 
5. Simple Real-Life Example
- Give one easy example that a school student can understand.
 
6. Quick Revision Summary
- Remember: Give 4 to 6 short revision points.
- Each point should be on a new line.
 
Strict rules:
- The answer must be in points, not paragraph form.
- Every section must have a clear heading.
- Definitions must start with Definition:.
- Important points must start with Important:.
- Memory/revision points must start with Remember:.
- Keep the explanation suitable for Class {class_level}.
- If the topic is mathematical, write formulas clearly on separate lines.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
    if revision_topic_prompt:
        return f"""The student is revising a syllabus topic from the Syllabus Tracker.
 
This is REVISION_TOPIC_MODE.
 
Give short, crisp, exam-focused revision notes.
 
Output format:
 
Quick Revision
 
1. Quick Meaning
- **Definition:** Explain the topic in 1-2 simple lines.
 
2. Key Points
- Give only the most important points.
- Use short bullet points.
 
3. Important Terms
- **Term 1:** Simple meaning.
- **Term 2:** Simple meaning.
- **Term 3:** Simple meaning.
 
4. Must Remember
- **Remember:** Write must-remember facts in short bullets.
 
5. Quick Flowchart
- Give a simple text-based flowchart or diagram if useful.
- Keep it easy to understand.
 
6. Exam Points
- Give 4 to 6 quick points useful for revision.
 
Strict rules:
- Keep the answer shorter than a full study explanation.
- Do not write one long paragraph.
- Mostly use bullet points.
- Do not write the word "Heading" anywhere.
- Use clean section titles only.
- Definitions and very important facts can be bold.
- Do not make every line bold.
- Use a simple text diagram or flowchart if it helps.
- Keep it suitable for Class {class_level}.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
    if detailed:
        return f"""The student is asking for more detail or explanation on the previous topic.
 
Give a detailed answer of 4 to 6 sentences with one simple example and one encouraging closing line.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
    return f"""Give a short answer only: 2 to 3 sentences maximum, with one simple example only if helpful.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
 
def get_fallback_message(language: str) -> str:
    """
    Return an error message in the expected answer language style.
    """
 
    if language == "hi":
        return "माफ़ कीजिए, अभी उत्तर नहीं मिल सका। कृपया दोबारा प्रयास करें।"
 
    if language == "hinglish":
        return "Sorry, abhi answer nahi mil saka. Please dobara try karo."
 
    return "Sorry, I could not answer right now. Please try again."
 
 
def clean_chat_history(history: list[dict]) -> list[dict]:
    """
    Keep useful previous history and remove empty/bad messages.
    """
 
    clean_history = []
 
    if not isinstance(history, list):
        return clean_history
 
    for message in history[-8:]:
        if not isinstance(message, dict):
            continue
 
        role = message.get("role")
        content = str(message.get("content") or "").strip()
 
        if role not in {"user", "assistant"}:
            continue
 
        if not content:
            continue
 
        clean_history.append(
            {
                "role": role,
                "content": content,
            }
        )
 
    return clean_history
 
 
def ask_llm(
    question: str,
    language: str,
    history: list[dict],
    class_level: Optional[str] = None,
    board: Optional[str] = None,
) -> str:
    """
    Generate an answer for the student.
    """
 
    question = str(question or "").strip()
 
    if not question:
        return get_fallback_message(language)
 
    detailed = is_detail_question(question)
    study_topic_prompt = is_study_topic_prompt(question)
    revision_topic_prompt = is_revision_topic_prompt(question)
 
    user_message = build_user_message(
        question,
        language,
        detailed,
        class_level,
        board,
    )
 
    # Safety fallback: never send empty content to Gemini/Groq
    if not user_message or not str(user_message).strip():
        print("[LLM] WARNING: build_user_message returned empty. Using fallback prompt.")
 
        language_instruction = build_language_instruction(language)
        profile_instruction = build_student_profile_instruction(class_level, board)
 
        user_message = f"""Answer the student's question clearly.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
    user_message = str(user_message).strip()
 
    print(f"[LLM] User message length: {len(user_message)}")
 
    # Normal answers stay short.
    # Syllabus topic explanations get more output space.
    max_tokens = 1000 if revision_topic_prompt else 2200 if study_topic_prompt else 600
 
    clean_history = clean_chat_history(history)
 
    print(f"[LLM] Clean history messages: {len(clean_history)} / raw: {len(history) if isinstance(history, list) else 0}")
 
    # Gemini history format
    gemini_history = [
        {
            "role": "user" if message["role"] == "user" else "model",
            "parts": [message["content"]],
        }
        for message in clean_history
    ]
 
    # ── 1. Gemini Primary Models ──────────────────────────
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash-lite"]:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.4,
                    max_output_tokens=max_tokens,
                ),
            )
 
            chat = gemini_model.start_chat(history=gemini_history)
            response = chat.send_message(user_message)
 
            answer = (response.text or "").strip()
 
            if not answer:
                raise ValueError("Gemini returned an empty answer")
 
            print(
                f"[LLM] Used: {model_name} "
                f"| language='{language}' "
                f"| followup_detail={detailed} "
                f"| study_topic={study_topic_prompt} "
                f"| revision_topic={revision_topic_prompt} "
                f"| max_tokens={max_tokens} "
                f"| tokens ~{len(answer.split())}"
            )
 
            return answer
 
        except Exception as error:
            error_text = str(error)
 
            if "429" in error_text or "quota" in error_text.lower():
                print(f"[{model_name}] Rate limited — trying next model")
                time.sleep(1)
                continue
 
            print(f"[{model_name}] Error: {error}")
            break
 
    # ── 2. Groq Fallback ──────────────────────────────────
    try:
        print(
            f"[LLM] Using Groq fallback "
            f"| language='{language}' "
            f"| study_topic={study_topic_prompt} "
            f"| revision_topic={revision_topic_prompt}"
        )
 
        groq_messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]
 
        for message in clean_history:
            groq_messages.append(
                {
                    "role": message["role"],
                    "content": message["content"],
                }
            )
 
        groq_messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )
 
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.4,
            max_tokens=max_tokens,
        )
 
        answer = completion.choices[0].message.content.strip()
 
        if not answer:
            raise ValueError("Groq returned an empty answer")
 
        print(
            f"[LLM] Groq answered "
            f"| language='{language}' "
            f"| study_topic={study_topic_prompt} "
            f"| revision_topic={revision_topic_prompt} "
            f"| max_tokens={max_tokens} "
            f"| tokens ~{len(answer.split())}"
        )
 
        return answer
 
    except Exception as error:
        print(f"[Groq] Error: {error}")
        return get_fallback_message(language)
