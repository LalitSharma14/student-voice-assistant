import os
import time
import google.generativeai as genai
from groq import Groq

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a friendly and encouraging AI tutor for Indian school students from Class 5 to Class 10.

Your rules:

1. Reply in the same language and script style as the student's current question.
   - If the current question is entirely in English, reply entirely in English only. Do not use Hindi or Devanagari words.
   - If the current question is in Hindi using Devanagari script, reply in Hindi using Devanagari script.
   - If the current question is in Hinglish written in Roman letters, reply in Hinglish using Roman letters only. Do not switch to Devanagari.
   - If the current question is in another Indian language, reply in that language.
   - The current question's language has priority over previous chat history.

2. Keep explanations simple, clear, and age-appropriate (10–16 years old).

3. RESPONSE LENGTH RULES — this is the most important rule:
   - For a first question on any topic: give a SHORT answer only.
     - 2 to 3 sentences maximum.
     - One simple real-life example if it helps.
   - For a follow-up question where the student asks for more detail, explanation, or says things like "explain more", "aur batao", "details do", "why", "how": give a DETAILED answer.
     - A clear explanation in 4 to 6 sentences.
     - One real-life example.
     - One encouraging closing line.
   - Never give a long answer when a short one is enough.
   - Never give a short answer when the student has clearly asked for detail.

4. No bullet points — write in natural flowing sentences.

5. Remember the conversation history and use it to answer follow-up questions correctly.

6. If the question is off-topic or inappropriate, politely redirect to study topics in 1 sentence."""


def ask_llm(question: str, language: str, history: list[dict]) -> str:
    """
    history = list of {role, content} dicts representing past conversation.
    Automatically gives short answers first, detailed on follow-up.
    """

    detail_keywords = [
        "more", "detail", "explain", "why", "how", "elaborate",
        "aur batao", "aur", "kyun", "kaise", "samjhao", "bataiye",
        "विस्तार", "समझाओ", "क्यों", "कैसे", "और बताओ"
    ]
    is_followup_detail = any(kw in question.lower() for kw in detail_keywords)

    messages = [
        {
            "role": "user" if m["role"] == "user" else "model",
            "parts": [m["content"]]
        }
        for m in history
    ]

        # Give the model an explicit output-language rule based on backend detection.
    # This is stricter than asking the model to infer language again.
    if language == "en":
        language_instruction = (
            "Answer entirely in English only. "
            "Do not use Hindi, Hinglish, or Devanagari words."
        )
    elif language == "hi":
        language_instruction = (
            "Answer entirely in simple Hindi using Devanagari script only. "
            "Do not write Hindi words in English letters."
        )
    elif language == "hinglish":
        language_instruction = (
            "Answer in natural Hinglish using Roman English letters only. "
            "Do not use Devanagari script."
        )
    else:
        language_instruction = (
            "Answer in the same language and script style as the student's question."
        )

        # Give the model an explicit output-language rule based on backend detection.
    # This is stricter than asking the model to infer language again.
    if language == "en":
        language_instruction = (
            "Answer entirely in English only. "
            "Do not use Hindi, Hinglish, or Devanagari words."
        )
    elif language == "hi":
        language_instruction = (
            "Answer entirely in simple Hindi using Devanagari script only. "
            "Do not write Hindi words in English letters."
        )
    elif language == "hinglish":
        language_instruction = (
            "Answer in natural Hinglish using Roman English letters only. "
            "Do not use Devanagari script."
        )
    else:
        language_instruction = (
            "Answer in the same language and script style as the student's question."
        )

        # Give the model an explicit output-language rule based on backend detection.
    # This is stricter than asking the model to infer language again.
    if language == "en":
        language_instruction = (
            "Answer entirely in English only. "
            "Do not use Hindi, Hinglish, or Devanagari words."
        )
    elif language == "hi":
        language_instruction = (
            "Answer entirely in simple Hindi using Devanagari script only. "
            "Do not write Hindi words in English letters."
        )
    elif language == "hinglish":
        language_instruction = (
            "Answer in natural Hinglish using Roman English letters only. "
            "Do not use Devanagari script."
        )
    else:
        language_instruction = (
            "Answer in the same language and script style as the student's question."
        )

    # Give the model an explicit output-language rule based on backend detection.
    # This is stricter than asking the model to infer language again.
    if language == "en":
        language_instruction = (
            "Answer entirely in English only. "
            "Do not use Hindi, Hinglish, or Devanagari words."
        )
    elif language == "hi":
        language_instruction = (
            "Answer entirely in simple Hindi using Devanagari script only. "
            "Do not write Hindi words in English letters."
        )
    elif language == "hinglish":
        language_instruction = (
            "Answer in natural Hinglish using Roman English letters only. "
            "Do not use Devanagari script."
        )
    else:
        language_instruction = (
            "Answer in the same language and script style as the student's question."
        )

    if is_followup_detail:
        user_message = f"""The student is asking for more detail or explanation on the previous topic.
Give a detailed answer of 4 to 6 sentences with one simple example.
{language_instruction}

Student question: {question}"""
    else:
        user_message = f"""Give a SHORT answer only: 2 to 3 sentences maximum, with one simple example only if needed.
{language_instruction}

Student question: {question}"""

    # ── 1. Gemini with history ─────────────────────────
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
            chat = gemini_model.start_chat(history=messages)
            response = chat.send_message(user_message)
            answer = response.text.strip()
            print(f"[LLM] Used: {model_name} | followup_detail={is_followup_detail} | tokens ~{len(answer.split())}")
            return answer

        except Exception as e:
            err = str(e)
            if "429" in err or "quota" in err.lower():
                print(f"[{model_name}] Rate limited — trying next")
                time.sleep(1)
                continue
            else:
                print(f"[{model_name}] Error: {e}")
                break

    # ── 2. Groq fallback ──────────────────────────────
    try:
        print("[LLM] Using Groq fallback")
        groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history:
            groq_messages.append({"role": m["role"], "content": m["content"]})
        groq_messages.append({"role": "user", "content": user_message})

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.4,
            max_tokens=600,
        )
        answer = completion.choices[0].message.content.strip()
        print(f"[LLM] Groq answered | tokens ~{len(answer.split())}")
        return answer

    except Exception as e:
        print(f"[Groq] Error: {e}")
        return "माफ़ करें, अभी जवाब नहीं मिल सका। / Sorry, I could not answer right now. Please try again."