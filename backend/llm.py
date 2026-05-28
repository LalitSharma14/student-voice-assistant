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

3. Response length rules:
   - For a first question on a topic, give a short answer of 2 to 3 sentences maximum.
   - Include one simple real-life example only if it is useful.
   - For a follow-up question asking for more explanation or detail, give a detailed answer of 4 to 6 sentences, with one example and one encouraging closing line.
   - Never make a simple answer unnecessarily long.

4. Do not use bullet points unless the student explicitly asks for a list.

5. Use the conversation history to answer follow-up questions correctly.

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

    normalized_question = question.lower()

    return any(keyword in normalized_question for keyword in detail_keywords)


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

    language_instruction = build_language_instruction(language)
    profile_instruction = build_student_profile_instruction(class_level, board)

    if detailed:
        return f"""The student is asking for more detail or explanation on the previous topic.
Give a detailed answer of 4 to 6 sentences with one simple example and one encouraging closing line.

{profile_instruction}

{language_instruction}

Student question: {question}"""

    return f"""Give a short answer only: 2 to 3 sentences maximum, with one simple example only if helpful.

{profile_instruction}

{language_instruction}

Student question: {question}"""

def get_fallback_message(language: str) -> str:
    """
    Return an error message in the expected answer language style.
    """

    if language == "hi":
        return "माफ़ कीजिए, अभी उत्तर नहीं मिल सका। कृपया दोबारा प्रयास करें।"

    if language == "hinglish":
        return "Sorry, abhi answer nahi mil saka. Please dobara try karo."

    return "Sorry, I could not answer right now. Please try again."


def ask_llm(
    question: str,
    language: str,
    history: list[dict],
    class_level: Optional[str] = None,
    board: Optional[str] = None,
) -> str:
    """
    Generate an answer for the student.

    Args:
        question: Current student question.
        language: Output style decided by app.py: "en", "hi", or "hinglish".
        history: Previous conversation messages as dictionaries containing
                 role and content.

    Returns:
        Generated answer string.
    """

    detailed = is_detail_question(question)
    user_message = build_user_message(
        question,
        language,
        detailed,
        class_level,
        board,
    )

    # Gemini history format
    gemini_history = [
        {
            "role": "user" if message["role"] == "user" else "model",
            "parts": [message["content"]],
        }
        for message in history
    ]

    # ── 1. Gemini Primary Models ──────────────────────────
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash-lite"]:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.4,
                    max_output_tokens=600,
                ),
            )

            chat = gemini_model.start_chat(history=gemini_history)
            response = chat.send_message(user_message)

            answer = response.text.strip()

            print(
                f"[LLM] Used: {model_name} "
                f"| language='{language}' "
                f"| followup_detail={detailed} "
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
        print(f"[LLM] Using Groq fallback | language='{language}'")

        groq_messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        for message in history:
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
            max_tokens=600,
        )

        answer = completion.choices[0].message.content.strip()

        print(
            f"[LLM] Groq answered "
            f"| language='{language}' "
            f"| tokens ~{len(answer.split())}"
        )

        return answer

    except Exception as error:
        print(f"[Groq] Error: {error}")
        return get_fallback_message(language)