import os
import time
import google.generativeai as genai
from groq import Groq
 
# ── Clients ────────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
 
# ── System prompt ──────────────────────────────────────────
SYSTEM_PROMPT = """You are a friendly and encouraging AI tutor for Indian school students from Class 5 to Class 10.
 
Your rules:
1. ALWAYS reply in the EXACT same language the student used.
   - Hindi (Devanagari script) → reply in Hindi.
   - English → reply in English.
   - Hinglish (mixed Hindi + English) → reply in Hinglish.
   - Any other Indian language → reply in that language.
 
2. Keep explanations simple, clear, and age-appropriate (10–16 years old).
 
3. Give a COMPLETE answer — never stop mid-sentence. Always finish your thought.
 
4. Structure:
   - A clear explanation (3–5 sentences).
   - One real-life example if helpful.
   - One encouraging closing line.
 
5. No bullet points — write in natural flowing sentences.
 
6. If the question is off-topic or inappropriate, politely redirect to study topics."""
 
 
def ask_llm(question: str, language: str) -> str:
    """
    LLM priority chain:
      1. Gemini 2.5 Flash      — best free model (250 req/day)
      2. Gemini 2.0 Flash-Lite — backup Gemini  (1000 req/day)
      3. Groq llama-3.3-70b   — fastest fallback
    """
    user_message = f"Student's question: {question}"
 
    # ── 1. Gemini models ───────────────────────────────────
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash-lite"]:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.4,
                    max_output_tokens=600,   # increased from 200 → fits a full answer
                ),
            )
            response = gemini_model.generate_content(user_message)
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
 
    # ── 2. Groq fallback ───────────────────────────────────
    try:
        print("[LLM] Using Groq fallback")
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.4,
            max_tokens=600,   # increased from 200 → full answers
        )
        answer = completion.choices[0].message.content.strip()
        print(f"[LLM] Groq answered | tokens ~{len(answer.split())}")
        return answer
 
    except Exception as e:
        print(f"[Groq] Error: {e}")
        return "माफ़ करें, अभी जवाब नहीं मिल सका। कृपया दोबारा कोशिश करें। / Sorry, I could not answer right now. Please try again."