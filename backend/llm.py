import os
import time
import json
import re
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

6. Follow-up answer rules:
   - If the question contains FOLLOW_UP_SIMPLIFY_MODE, explain the previous answer again in very easy words with full detail, step-by-step teaching, and relatable real-life examples.
   - If the question contains FOLLOW_UP_EXAMPLE_MODE, teach the same topic through clear real-life examples and explain each connection.
   - If the question contains FOLLOW_UP_QUIZ_MODE, ask exactly three short questions and do not reveal their answers yet.
   - Follow the detailed requirements included in the current follow-up request.

7. Use the conversation history to answer follow-up questions correctly.

8. If the question is inappropriate or unrelated to learning, politely redirect the student to study-related topics in one sentence.
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
            "Devanagari script only. Do not write the answer in Roman Hinglish. "
            "Translate technical terms into commonly understood Hindi. Do not include "
            "English spellings or English terms in parentheses anywhere in the answer."
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


def is_follow_up_prompt(question: str) -> bool:
    """
    Detect follow-up actions selected below the chatbot answer.
    """

    normalized_question = (question or "").lower()
    return "follow_up_" in normalized_question and "_mode" in normalized_question


def is_doubt_title_prompt(question: str) -> bool:
    """
    Detect requests that create a concise title for a saved student doubt.
    """

    return "doubt_title_mode" in (question or "").lower()


def get_follow_up_mode(question: str) -> str:
    normalized_question = (question or "").lower()
    if "follow_up_simplify_mode" in normalized_question:
        return "simplify"
    if "follow_up_example_mode" in normalized_question:
        return "example"
    if "follow_up_quiz_mode" in normalized_question:
        return "quiz"
    return ""


def is_complete_follow_up_answer(answer: str, mode: str) -> bool:
    """
    Reject friendly introductions or otherwise incomplete follow-up answers.
    """

    text = str(answer or "").strip()
    word_count = len(text.split())

    if mode == "simplify":
        section_signals = ["meaning", "step", "example", "summary", "easy", "remember"]
        signal_count = sum(signal in text.lower() for signal in section_signals)
        return word_count >= 180 and signal_count >= 3

    if mode == "example":
        numbered_examples = sum(marker in text for marker in ["1.", "2.", "3."])
        return word_count >= 120 and (
            text.lower().count("example") >= 2 or numbered_examples >= 2
        )

    if mode == "quiz":
        question_count = text.count("?") + len(re.findall(r"(?m)^\s*[1-3][.)]\s+", text))
        return question_count >= 3

    return True


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
    follow_up_prompt = is_follow_up_prompt(question)
    follow_up_mode = get_follow_up_mode(question)
    doubt_title_prompt = is_doubt_title_prompt(question)

    if doubt_title_prompt:
        return f"""Create a concise title for the student's doubt.

Strict rules:
- Return only the title, with no introduction, explanation, label, quotation marks, or punctuation at the end.
- Use 3 to 8 words.
- Describe the actual learning concept the student is confused about.
- Never use interface phrases such as "show real-life examples", "explain more simply", "mark as doubt", or "student question".
- If Doubt type is example, write the title in the form "Real-life examples of [topic]".
- If Doubt type is simplify, write the title in the form "Easy explanation of [topic]".
- If Doubt type is quiz, write the title in the form "Questions about [topic]".
- Write the title in the selected output language.

{profile_instruction}

{language_instruction}

Source material:
{question}"""
 
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

    if follow_up_prompt:
        follow_up_mode = get_follow_up_mode(question)
        format_instruction = ""
        if follow_up_mode == "simplify":
            format_instruction = """
Required answer structure:
1. Easy Meaning
2. Understand It Step by Step
3. Two Real-Life Examples
4. Important Words in Easy Language
5. Quick Summary

Write at least 180 words. Complete every section. Do not stop after a greeting or introduction."""
        elif follow_up_mode == "example":
            format_instruction = """
Give exactly three clearly numbered real-life examples.
For every example, explain the situation and how it connects to the topic.
Write at least 120 words in total."""
        elif follow_up_mode == "quiz":
            format_instruction = """
Ask exactly three numbered questions. Do not include answers."""

        return f"""The student selected a follow-up learning action for the previous answer.

Follow every requirement in the current request. Use the previous answer and conversation history as context.
Do not mention internal modes, prompts, or these instructions.
{format_instruction}

{profile_instruction}

{language_instruction}

Current follow-up request:
{question}"""

    if detailed:
        return f"""The student is asking for more detail or explanation on the previous topic.
 
Give a detailed answer of 4 to 6 sentences with one simple example and one encouraging closing line.
 
{profile_instruction}
 
{language_instruction}
 
Student question:
{question}"""
 
    return f"""Give exactly 2 or 3 complete sentences, with one simple example only if helpful.

Do not add a greeting, motivational line, praise, closing sentence, or phrases such as "Keep learning".
Answer the question immediately and stop after the explanation.
 
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


def clean_normal_answer(answer: str) -> str:
    """Remove UI-style greetings and closings from short normal answers."""

    text = str(answer or "").strip()
    text = re.sub(
        r"^(?:hello|hi|hey|namaste|नमस्ते)\s*[!,.।?]*\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\s*(?:keep learning|happy learning|aise hi questions poochte raho|बहुत अच्छा[^।!?]*|सीखते रहो)\s*[!।.]*\s*$",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text.strip()
 
 
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
    follow_up_prompt = is_follow_up_prompt(question)
    follow_up_mode = get_follow_up_mode(question)
    doubt_title_prompt = is_doubt_title_prompt(question)
    normal_answer = not any(
        [detailed, study_topic_prompt, revision_topic_prompt, follow_up_prompt, doubt_title_prompt]
    )
 
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
    max_tokens = 80 if doubt_title_prompt else 1000 if revision_topic_prompt else 2200 if study_topic_prompt or follow_up_prompt else 300
 
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
            if follow_up_prompt and not is_complete_follow_up_answer(answer, follow_up_mode):
                raise ValueError(
                    f"Incomplete follow-up answer from {model_name}: "
                    f"mode={follow_up_mode}, words={len(answer.split())}"
                )
            if normal_answer:
                answer = clean_normal_answer(answer)
 
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
 
            if "Incomplete follow-up answer" in error_text:
                print(f"[{model_name}] Follow-up too short - trying next model")
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
 
        answer = ""
        for attempt in range(2):
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=groq_messages,
                temperature=0.4,
                max_tokens=max_tokens,
            )

            answer = completion.choices[0].message.content.strip()

            if not answer:
                raise ValueError("Groq returned an empty answer")
            if not follow_up_prompt or is_complete_follow_up_answer(answer, follow_up_mode):
                break

            print(
                f"[Groq] Follow-up too short on attempt {attempt + 1} "
                f"| mode={follow_up_mode} | words={len(answer.split())}"
            )
            groq_messages.append({"role": "assistant", "content": answer})
            groq_messages.append({
                "role": "user",
                "content": (
                    "Your previous response was incomplete. Start again and provide the full "
                    "required answer now. Complete every required section and meet the minimum detail."
                ),
            })

        if follow_up_prompt and not is_complete_follow_up_answer(answer, follow_up_mode):
            raise ValueError(
                f"Groq returned an incomplete follow-up after retry: "
                f"mode={follow_up_mode}, words={len(answer.split())}"
            )
        if normal_answer:
            answer = clean_normal_answer(answer)
 
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
 
 
def _extract_json_object(text: str) -> dict:
    """
    Extract a JSON object from model output safely.
    """
 
    text = (text or "").strip()
 
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"```$", "", text).strip()
 
    try:
        return json.loads(text)
    except Exception:
        pass
 
    start = text.find("{")
    end = text.rfind("}")
 
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start : end + 1])
 
    raise ValueError("Could not parse JSON from model output")
 
 
def _normalize_mcq_payload(payload: dict, question_count: int) -> list[dict]:
    """
    Normalize and validate MCQ JSON so frontend always gets the same shape.
    """
 
    questions = payload.get("questions", [])
 
    if not isinstance(questions, list):
        raise ValueError("MCQ payload does not contain a questions list")
 
    normalized = []
 
    for item in questions:
        if not isinstance(item, dict):
            continue
 
        question = str(item.get("question") or "").strip()
        options = item.get("options", [])
        answer_index = item.get("answerIndex", item.get("answer_index", 0))
        explanation = str(item.get("explanation") or "").strip()
 
        if not question or not isinstance(options, list) or len(options) != 4:
            continue
 
        try:
            answer_index = int(answer_index)
        except Exception:
            answer_index = 0
 
        if answer_index < 0 or answer_index > 3:
            answer_index = 0
 
        normalized.append(
            {
                "question": question,
                "options": [str(option).strip() for option in options[:4]],
                "answerIndex": answer_index,
                "explanation": explanation,
            }
        )
 
    if len(normalized) < question_count:
        raise ValueError(
            f"Only {len(normalized)} valid MCQs generated, expected {question_count}"
        )
 
    return normalized[:question_count]


def _normalize_mixed_test_payload(payload: dict) -> list[dict]:
    """
    Normalize topic-test JSON with MCQ, short-answer, and long-answer questions.
    Topic tests use 4 MCQ, 4 short answer, and 2 long answer questions.
    """

    questions = payload.get("questions", [])

    if not isinstance(questions, list):
        raise ValueError("Mixed test payload does not contain a questions list")

    normalized = []
    type_counts = {"mcq": 0, "short": 0, "long": 0}

    for item in questions:
        if not isinstance(item, dict):
            continue

        qtype = str(item.get("type") or "").strip().lower()
        question = str(item.get("question") or "").strip()
        explanation = str(item.get("explanation") or "").strip()
        sample_answer = str(item.get("sampleAnswer") or item.get("sample_answer") or "").strip()

        if qtype not in {"mcq", "short", "long"} or not question:
            continue

        if qtype == "mcq":
            if type_counts["mcq"] >= 4:
                continue
            options = item.get("options", [])
            answer_index = item.get("answerIndex", item.get("answer_index", 0))
            if not isinstance(options, list) or len(options) != 4:
                continue
            try:
                answer_index = int(answer_index)
            except Exception:
                answer_index = 0
            if answer_index < 0 or answer_index > 3:
                answer_index = 0
            normalized.append({
                "type": "mcq",
                "marks": 0.5,
                "wordLimit": 0,
                "question": question,
                "options": [str(option).strip() for option in options[:4]],
                "answerIndex": answer_index,
                "explanation": explanation,
                "sampleAnswer": sample_answer or explanation,
            })
            type_counts["mcq"] += 1
            continue

        if qtype == "short":
            if type_counts["short"] >= 4:
                continue
            normalized.append({
                "type": "short",
                "marks": 2,
                "wordLimit": 40,
                "question": question,
                "sampleAnswer": sample_answer,
                "rubric": str(item.get("rubric") or "Give credit for correct concept, important keyword, and clear explanation.").strip(),
            })
            type_counts["short"] += 1
            continue

        if qtype == "long":
            if type_counts["long"] >= 2:
                continue
            normalized.append({
                "type": "long",
                "marks": 5,
                "wordLimit": 120,
                "question": question,
                "sampleAnswer": sample_answer,
                "rubric": str(item.get("rubric") or "Give credit for accuracy, step-by-step explanation, keywords, and relevant example.").strip(),
            })
            type_counts["long"] += 1

    if type_counts != {"mcq": 4, "short": 4, "long": 2}:
        raise ValueError(f"Invalid mixed test counts: {type_counts}")

    return normalized
 
 
def generate_test_mcqs(
    test_type: str,
    subject: str,
    chapter_title: str,
    topic_title: str,
    topics: list[str],
    question_count: int,
    language: str,
    class_level: Optional[str] = None,
    board: Optional[str] = None,
) -> list[dict]:
    """
    Generate MCQs as JSON for interactive tests.
 
    Returns:
    [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answerIndex": 0,
        "explanation": "..."
      }
    ]
    """
 
    language_instruction = build_language_instruction(language)
    profile_instruction = build_student_profile_instruction(class_level, board)
 
    if test_type == "topic":
        scope_instruction = f"""Test type: Topic Test
Topic: {topic_title}
Chapter: {chapter_title}
Subject: {subject}
Create exactly 10 questions from this topic only:
- 4 MCQ questions, 0.5 marks each
- 4 short-answer questions, 2 marks each, word limit 40 words
- 2 long-answer questions, 5 marks each, word limit 120 words"""
    else:
        topic_list = ", ".join(topics or [])
        scope_instruction = f"""Test type: Chapter Test
Chapter: {chapter_title}
Subject: {subject}
Topics in chapter: {topic_list}
Create exactly {question_count} MCQs covering the full chapter."""
 
    if test_type == "topic":
        prompt = f"""You are generating an interactive topic test for a school student.
 
{scope_instruction}
 
{profile_instruction}
 
{language_instruction}
 
Return ONLY valid JSON.
Do not use markdown.
Do not add explanation outside JSON.
 
Required JSON format:
{{
  "questions": [
    {{
      "type": "mcq",
      "marks": 0.5,
      "wordLimit": 0,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "One short explanation of the correct answer",
      "sampleAnswer": "Correct answer in one line"
    }},
    {{
      "type": "short",
      "marks": 2,
      "wordLimit": 40,
      "question": "Short answer question",
      "sampleAnswer": "Ideal answer in 2-4 lines",
      "rubric": "Award marks for key concept, keyword, and clarity"
    }},
    {{
      "type": "long",
      "marks": 5,
      "wordLimit": 120,
      "question": "Long answer question",
      "sampleAnswer": "Ideal answer with important points",
      "rubric": "Award marks for accuracy, steps, keywords, and example"
    }}
  ]
}}
 
Strict rules:
- Generate exactly 10 questions.
- The first 4 questions must be type "mcq".
- The next 4 questions must be type "short".
- The last 2 questions must be type "long".
- MCQ questions must have exactly 4 options and answerIndex must be 0, 1, 2, or 3.
- Short-answer questions must be answerable within 40 words.
- Long-answer questions must be answerable within 120 words.
- Keep questions suitable for Class {class_level}.
- Avoid repeated questions.
- Avoid trick questions.
- Keep options and questions clear.
"""
    else:
        prompt = f"""You are generating an interactive MCQ test for a school student.

{scope_instruction}

{profile_instruction}

{language_instruction}

Return ONLY valid JSON.
Do not use markdown.
Do not add explanation outside JSON.

Required JSON format:
{{
  "questions": [
    {{
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "One short explanation of the correct answer"
    }}
  ]
}}

Strict rules:
- Generate exactly {question_count} questions.
- Each question must have exactly 4 options.
- answerIndex must be 0, 1, 2, or 3.
- Keep questions suitable for Class {class_level}.
- Avoid repeated questions.
- Avoid trick questions.
- Keep options short and clear.
"""
 
    max_tokens = 3500 if question_count >= 20 else 2200
 
    # Gemini primary
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash-lite"]:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=max_tokens,
                ),
            )
 
            response = gemini_model.generate_content(prompt)
            text = (response.text or "").strip()
 
            payload = _extract_json_object(text)
            questions = _normalize_mixed_test_payload(payload) if test_type == "topic" else _normalize_mcq_payload(payload, question_count)
 
            print(
                f"[TEST] Used {model_name} | type={test_type} "
                f"| questions={len(questions)}"
            )
 
            return questions
 
        except Exception as error:
            error_text = str(error)
 
            if "429" in error_text or "quota" in error_text.lower():
                print(f"[TEST {model_name}] Rate limited — trying next model")
                time.sleep(1)
                continue
 
            print(f"[TEST {model_name}] Error: {error}")
            break
 
    # Groq fallback
    try:
        print(f"[TEST] Using Groq fallback | type={test_type}")
 
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.3,
            max_tokens=max_tokens,
        )
 
        text = completion.choices[0].message.content.strip()
        payload = _extract_json_object(text)
        questions = _normalize_mixed_test_payload(payload) if test_type == "topic" else _normalize_mcq_payload(payload, question_count)
 
        print(f"[TEST] Groq answered | type={test_type} | questions={len(questions)}")
 
        return questions
 
    except Exception as error:
        print(f"[TEST Groq] Error: {error}")
        raise


def _normalize_grading_payload(payload: dict, questions: list[dict]) -> list[dict]:
    grades = payload.get("grades", [])
    if not isinstance(grades, list):
        raise ValueError("Grading payload does not contain a grades list")

    by_index = {}
    for item in grades:
        if not isinstance(item, dict):
            continue
        try:
            index = int(item.get("index"))
        except Exception:
            continue
        by_index[index] = item

    normalized = []
    for index, question in enumerate(questions):
        qtype = question.get("type", "mcq")
        max_marks = float(question.get("marks", 1))
        item = by_index.get(index, {})

        if qtype == "mcq":
            score = float(item.get("score", 0))
        else:
            try:
                score = float(item.get("score", 0))
            except Exception:
                score = 0

        score = max(0, min(max_marks, score))
        normalized.append({
            "index": index,
            "score": score,
            "maxMarks": max_marks,
            "feedback": str(item.get("feedback") or ("Correct." if score == max_marks else "Review this answer.")).strip(),
            "idealAnswer": str(item.get("idealAnswer") or question.get("sampleAnswer") or "").strip(),
        })

    return normalized


def grade_test_answers(
    questions: list[dict],
    answers: dict,
    language: str,
    class_level: Optional[str] = None,
    board: Optional[str] = None,
) -> list[dict]:
    """
    Grade a mixed test like a teacher. MCQs are marked exactly; short and long answers
    are marked by the model against the sample answer and rubric.
    """

    objective_grades = []
    subjective_items = []

    for index, question in enumerate(questions or []):
        qtype = question.get("type", "mcq")
        max_marks = float(question.get("marks", 1))
        answer = answers.get(str(index), answers.get(index, ""))

        if qtype == "mcq":
            try:
                selected = int(answer)
            except Exception:
                selected = -1
            score = max_marks if selected == int(question.get("answerIndex", -2)) else 0
            objective_grades.append({
                "index": index,
                "score": score,
                "maxMarks": max_marks,
                "feedback": question.get("explanation") or ("Correct." if score else "Incorrect. Check the correct option."),
                "idealAnswer": question.get("sampleAnswer") or question.get("explanation") or "",
            })
        else:
            subjective_items.append({
                "index": index,
                "type": qtype,
                "maxMarks": max_marks,
                "question": question.get("question", ""),
                "studentAnswer": str(answer or "").strip(),
                "sampleAnswer": question.get("sampleAnswer", ""),
                "rubric": question.get("rubric", ""),
                "wordLimit": question.get("wordLimit", 0),
            })

    if not subjective_items:
        return sorted(objective_grades, key=lambda item: item["index"])

    language_instruction = build_language_instruction(language)
    profile_instruction = build_student_profile_instruction(class_level, board)

    prompt = f"""You are a fair school teacher grading student answers.

{profile_instruction}

{language_instruction}

Grade only the short-answer and long-answer questions below.
Return ONLY valid JSON. Do not use markdown.

Questions to grade:
{json.dumps(subjective_items, ensure_ascii=False)}

Required JSON format:
{{
  "grades": [
    {{
      "index": 4,
      "score": 1.5,
      "feedback": "Short teacher feedback in one sentence",
      "idealAnswer": "A better answer in simple words"
    }}
  ]
}}

Strict marking rules:
- Never give more than maxMarks.
- Give partial marks when the answer is partly correct.
- If answer is blank, give 0.
- Short answers are out of 2 marks.
- Long answers are out of 5 marks.
- Feedback should be kind, specific, and useful.
"""

    max_tokens = 1800

    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash-lite"]:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=max_tokens,
                ),
            )
            response = gemini_model.generate_content(prompt)
            payload = _extract_json_object((response.text or "").strip())
            subjective_grades = _normalize_grading_payload(payload, subjective_items)
            grades = objective_grades + subjective_grades
            return sorted(grades, key=lambda item: item["index"])
        except Exception as error:
            error_text = str(error)
            if "429" in error_text or "quota" in error_text.lower():
                print(f"[GRADE {model_name}] Rate limited - trying next model")
                time.sleep(1)
                continue
            print(f"[GRADE {model_name}] Error: {error}")
            break

    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=max_tokens,
    )
    payload = _extract_json_object(completion.choices[0].message.content.strip())
    subjective_grades = _normalize_grading_payload(payload, subjective_items)
    grades = objective_grades + subjective_grades
    return sorted(grades, key=lambda item: item["index"])
