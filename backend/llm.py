import os
import time
import google.generativeai as genai
from groq import Groq

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a friendly and encouraging AI tutor for Indian school students from Class 5 to Class 10.

Your rules:
1. ALWAYS reply in the EXACT same language the student used.
   - Hindi (Devanagari script) → reply in Hindi.
   - English → reply in English.
   - Hinglish (mixed Hindi + English) → reply in Hinglish.
   - Any other Indian language → reply in that language.

2. Keep explanations simple, clear, and age-appropriate (10–16 years old).

3. Give a COMPLETE answer — never stop mid-sentence.

4. Structure:
   - A clear explanation (3–5 sentences).
   - One real-life example if helpful.
   - One encouraging closing line.

5. No bullet points — write in natural flowing sentences.

6. Remember the conversation history and use it to answer follow-up questions.

7. If the question is off-topic or inappropriate, politely redirect to study topics."""


def ask_llm(question: str, language: str, history: list[dict]) -> str:
    """
    history = list of {role, content} dicts representing past conversation.
    Supports follow-up questions using full conversation memory.
    """

    # Build messages with full history for context
    messages = [{"role": "user" if m["role"] == "user" else "model",
                 "parts": [m["content"]]} for m in history]

    user_message = f"Student's question: {question}"

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
            # Start chat with previous history
            chat = gemini_model.start_chat(history=messages)
            response = chat.send_message(user_message)
            answer = response.text.strip()
            print(f"[LLM] Used: {model_name} | tokens ~{len(answer.split())}")
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

    # ── 2. Groq fallback with history ─────────────────
    try:
        print("[LLM] Using Groq fallback")
        groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history:
            groq_messages.append({
                "role": m["role"],
                "content": m["content"]
            })
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