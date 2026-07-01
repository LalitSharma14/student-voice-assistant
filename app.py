from dotenv import load_dotenv
load_dotenv()
 
import os
import sys
import json
import uuid
import asyncio
import time
import re
import unicodedata
import traceback
import urllib.parse
import urllib.request
from typing import Optional

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
 
from backend.stt import speech_to_text
from backend.llm import ask_llm, generate_test_mcqs, grade_test_answers
from backend.tts import text_to_speech, clean_text_for_tts  # single clean import
 
# ── Directories ────────────────────────────────────────────
UPLOAD_DIR = "uploads"
AUDIO_DIR  = "audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR,  exist_ok=True)
 
# ── Language style detection ───────────────────────────────
HINGLISH_WORDS = {
    "kya", "kaise", "kyu", "kyun", "kab", "kahan",
    "hai", "hain", "hota", "hoti", "hote",
    "mujhe", "mera", "meri", "mere",
    "samjhao", "batao", "bata", "matlab",
    "mein", "main", "aur", "nahi", "kyunki",
    "karna", "karo", "samajh", "chahiye"
}
 
# ── Voice answer style detection ───────────────────────────
HINGLISH_DEVANAGARI_MARKERS = {
    "प्रोसेस",
    "फोटोसिंथेसिस",
    "फोटो",
    "सिंथेसिस",
    "सिंठेसिस",
    "प्लांट",
    "प्लांट्स",
    "सनलाइट",
    "वॉटर",
    "साइंस",
    "मैथ्स",
    "एक्जाम",
    "क्लास",
}
 
 
def detect_voice_answer_style(question: str, whisper_language: str) -> tuple[str, str]:
    """
    Decide how the answer should be written and spoken for voice questions.
 
    Returns:
    - answer_language: en, hi, or hinglish
    - tts_language: en or hi
    """
 
    # Whisper may convert spoken Hinglish into Devanagari.
    # Example: "Photosynthesis process kya hoti hai?"
    # becomes "फोटो सिंथेसिस प्रोसेस क्या होती है"
    if whisper_language == "hi":
        if any(marker in question for marker in HINGLISH_DEVANAGARI_MARKERS):
            return "hinglish", "hi"
 
        return "hi", "hi"
 
    return whisper_language, whisper_language
 
 
def detect_language_style(text: str) -> str:
    has_devanagari = any(
        unicodedata.name(char, "").startswith("DEVANAGARI")
        for char in text
    )
 
    if has_devanagari:
        return "hi"
 
    words = set(re.findall(r"[a-zA-Z]+", text.lower()))
 
    if words.intersection(HINGLISH_WORDS):
        return "hinglish"
 
    return "en"
 
# ── App ────────────────────────────────────────────────────
app = FastAPI(title="Student Voice Assistant API")

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://teachifyy.com",
    "https://www.teachifyy.com",
]
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        ",".join(DEFAULT_ALLOWED_ORIGINS),
    ).split(",")
    if origin.strip()
]
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")


def _strip_html(value: str) -> str:
    return re.sub(r"<[^>]+>", "", str(value or "")).strip()


def _commons_meta_value(extmetadata: dict, key: str) -> str:
    item = extmetadata.get(key, {}) if isinstance(extmetadata, dict) else {}
    return _strip_html(item.get("value", ""))


def search_commons_diagram(
    query_text: str,
    class_level: Optional[str] = None,
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    topic: Optional[str] = None,
) -> Optional[dict]:
    clean_query = " ".join(
        part for part in [
            f"class {class_level}" if class_level else "",
            subject or "",
            chapter or "",
            topic or query_text,
            "diagram educational",
        ]
        if part
    )

    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": clean_query,
        "gsrlimit": "8",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": "900",
        "origin": "*",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": "TeachifyyStudentAssistant/1.0"})

    with urllib.request.urlopen(request, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))

    pages = (payload.get("query") or {}).get("pages") or {}
    for page in pages.values():
        image_info = (page.get("imageinfo") or [None])[0]
        if not image_info:
            continue

        image_url = image_info.get("thumburl") or image_info.get("url")
        if not image_url:
            continue

        extmetadata = image_info.get("extmetadata") or {}
        page_title = str(page.get("title") or "")
        file_title = page_title.replace("File:", "").strip()
        license_name = (
            _commons_meta_value(extmetadata, "LicenseShortName")
            or _commons_meta_value(extmetadata, "UsageTerms")
            or "See source"
        )
        author = _commons_meta_value(extmetadata, "Artist") or "Wikimedia Commons contributor"

        return {
            "title": topic or file_title or "Diagram",
            "image": image_url,
            "source": "Wikimedia Commons",
            "sourceUrl": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(page_title)}",
            "attribution": author,
            "license": license_name,
            "flowchart": [],
            "online": True,
        }

    return None
 
 
@app.get("/")
def home():
    return {"message": "Student Voice Assistant Backend Running ✅"}


@app.get("/health")
def health():
    llm_configured = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY"))
    return {
        "status": "ok" if llm_configured else "degraded",
        "service": "student-voice-assistant-backend",
        "llmConfigured": llm_configured,
        "ttsConfigured": True,
    }
 
 
@app.post("/diagram-search/")
async def diagram_search(
    query: str = Form(...),
    class_level: Optional[str] = Form(default=None),
    board: Optional[str] = Form(default=None),
    subject: Optional[str] = Form(default=None),
    chapter: Optional[str] = Form(default=None),
    topic: Optional[str] = Form(default=None),
):
    if not query.strip():
        raise HTTPException(status_code=422, detail="Diagram search query cannot be empty.")

    try:
        diagram = await asyncio.to_thread(
            search_commons_diagram,
            query.strip(),
            class_level,
            subject,
            chapter,
            topic,
        )
        return {
            "diagram": diagram,
            "profile": {
                "class_level": class_level,
                "board": board,
                "subject": subject,
                "chapter": chapter,
                "topic": topic,
            },
        }
    except Exception as error:
        print(f"[DIAGRAM SEARCH] Error: {error}")
        return {"diagram": None, "error": "Could not find a safe online diagram right now."}


@app.post("/ask/")
async def ask_question(
    file: UploadFile = File(...),
    history: Optional[str] = Form(default="[]"),
    class_level: Optional[str] = Form(default=None),
    board: Optional[str] = Form(default=None),
    answer_language: Optional[str] = Form(default=None),
):
    file_ext   = os.path.splitext(file.filename)[-1] or ".webm"
    unique_id  = uuid.uuid4().hex
    audio_path = os.path.join(UPLOAD_DIR, f"{unique_id}{file_ext}")
 
    total_start = time.perf_counter()
 
    try:
        save_start = time.perf_counter()
 
        print(f"\n[STEP 1] Saving uploaded file: {file.filename}")
        content = await file.read()
 
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
 
        with open(audio_path, "wb") as f:
            f.write(content)
 
        save_time = time.perf_counter() - save_start
        print(f"[STEP 1] Saved to {audio_path} ({len(content)} bytes) | Time: {save_time:.2f}s")
 
        # ── Speech to Text ───────────────────────────────
        stt_start = time.perf_counter()
 
        print("[STEP 2] Running STT...")
        question, whisper_language = speech_to_text(audio_path)
 
        stt_time = time.perf_counter() - stt_start
        print(
            f"[STEP 2] question='{question}' "
            f"whisper_language='{whisper_language}' | Time: {stt_time:.2f}s"
        )
 
        if not question.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not detect speech. Please speak clearly."
            )
 
        allowed_classes = {"5", "6", "7", "8", "9", "10"}
        allowed_boards = {"CBSE", "RBSE", "ICSE", "Other"}
        allowed_languages = {"en", "hi", "hinglish"}

        validated_class_level = class_level if class_level in allowed_classes else None
        validated_board = board if board in allowed_boards else None

        # Whisper may write spoken Hinglish in Hindi script.
        # Decide how the AI answer should be displayed, unless the student selected it.
        detected_answer_language, detected_tts_language = detect_voice_answer_style(
            question,
            whisper_language
        )

        if answer_language in allowed_languages:
            selected_answer_language = answer_language
            tts_language = "hi" if selected_answer_language == "hi" else "en"
        else:
            selected_answer_language = detected_answer_language
            tts_language = detected_tts_language
 
        print(
            f"[STEP 2.1] Answer style='{selected_answer_language}' "
            f"tts_language='{tts_language}' class='{validated_class_level}' board='{validated_board}'"
        )
 
        # ── LLM Answer ───────────────────────────────────
        llm_start = time.perf_counter()
 
        print("[STEP 3] Calling LLM...")
        chat_history = json.loads(history)
        answer = await asyncio.to_thread(
            ask_llm,
            question,
            selected_answer_language,
            chat_history,
            validated_class_level,
            validated_board
        )
 
        answer = clean_text_for_tts(answer)
 
        llm_time = time.perf_counter() - llm_start
        print(f"[STEP 3] Answer generated ({len(answer)} characters) | Time: {llm_time:.2f}s")
 
        # ── Text to Speech ───────────────────────────────
        tts_start = time.perf_counter()
 
        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")
        print(f"[STEP 4] Running TTS -> {audio_out_path}")
 
        await text_to_speech(answer, tts_language, audio_out_path)
 
        tts_time = time.perf_counter() - tts_start
        print(f"[STEP 4] Audio saved | Time: {tts_time:.2f}s")
 
        mtime     = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"
 
        total_time = time.perf_counter() - total_start
        print(f"[STEP 5] Returning response | TOTAL VOICE TIME: {total_time:.2f}s")
 
        return {
            "question": question,
            "language": selected_answer_language,
            "tts_language": tts_language,
            "answer": answer,
            "audio_url": audio_url,
        }
 
    except HTTPException:
        raise
 
    except Exception as e:
        print("\n[ERROR] Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"[{type(e).__name__}] {str(e)}")
 
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
 
@app.post("/ask-text/")
async def ask_question_text(
    question: str = Form(...),
    history: Optional[str] = Form(default="[]"),
    class_level: Optional[str] = Form(default=None),
    board: Optional[str] = Form(default=None),
    answer_language: Optional[str] = Form(default=None),
):
    total_start = time.perf_counter()
 
    try:
        if not question.strip():
            raise HTTPException(status_code=422, detail="Question cannot be empty.")
 
        # ── Validate student profile received from frontend ──
        allowed_classes = {"5", "6", "7", "8", "9", "10"}
        allowed_boards = {"CBSE", "RBSE", "ICSE", "Other"}
        allowed_languages = {"en", "hi", "hinglish"}
 
        validated_class_level = (
            class_level if class_level in allowed_classes else None
        )
 
        validated_board = (
            board if board in allowed_boards else None
        )
 
        # Student-selected language gets priority.
        # Automatic detection is kept only as a fallback.
        if answer_language in allowed_languages:
            language = answer_language
        else:
            language = detect_language_style(question)
 
        print(
            f"[TEXT] question='{question}' "
            f"class_level='{validated_class_level}' "
            f"board='{validated_board}' "
            f"language='{language}'"
        )
 
        # ── LLM Answer ───────────────────────────────────
        llm_start = time.perf_counter()
        print("[TEXT] Calling LLM...")
 
        chat_history = json.loads(history)
 
        answer = await asyncio.to_thread(
            ask_llm,
            question,
            language,
            chat_history,
            validated_class_level,
            validated_board,
        )
 
        llm_time = time.perf_counter() - llm_start
        print(f"[TEXT] Answer generated ({len(answer)} characters) | LLM Time: {llm_time:.2f}s")
 
        total_time = time.perf_counter() - total_start
        print(f"[TEXT] Returning text response | TOTAL TEXT TIME: {total_time:.2f}s")
 
        return {
            "question": question,
            "language": language,
            "answer": answer,
            "profile": {
                "class_level": validated_class_level,
                "board": validated_board,
                "answer_language": language,
            },
        }
 
    except HTTPException:
        raise
 
    except Exception as e:
        print("\n[TEXT ERROR] Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"[{type(e).__name__}] {str(e)}"
        )
 
 
@app.post("/generate-test/")
async def generate_test(
    test_type: str = Form(...),
    subject: str = Form(...),
    chapter_title: str = Form(...),
    topic_title: Optional[str] = Form(default=""),
    topics: Optional[str] = Form(default="[]"),
    question_count: int = Form(...),
    class_level: Optional[str] = Form(default=None),
    board: Optional[str] = Form(default=None),
    answer_language: Optional[str] = Form(default="en"),
):
    """
    Generate interactive MCQ tests for the frontend.
 
    test_type:
    - topic   => 10 MCQs from one topic
    - chapter => 20 MCQs from all topics of a chapter
    """
 
    total_start = time.perf_counter()
 
    try:
        allowed_types = {"topic", "chapter"}
        allowed_classes = {"5", "6", "7", "8", "9", "10"}
        allowed_boards = {"CBSE", "RBSE", "ICSE", "Other"}
        allowed_languages = {"en", "hi", "hinglish"}
 
        if test_type not in allowed_types:
            raise HTTPException(status_code=422, detail="Invalid test type.")
 
        validated_class_level = (
            class_level if class_level in allowed_classes else None
        )
 
        validated_board = (
            board if board in allowed_boards else None
        )
 
        language = (
            answer_language if answer_language in allowed_languages else "en"
        )
 
        if test_type == "topic":
            question_count = 10
        else:
            question_count = 20
 
        try:
            parsed_topics = json.loads(topics or "[]")
        except Exception:
            parsed_topics = []
 
        if not isinstance(parsed_topics, list):
            parsed_topics = []
 
        print(
            f"[TEST] type='{test_type}' subject='{subject}' "
            f"chapter='{chapter_title}' topic='{topic_title}' "
            f"count={question_count} class='{validated_class_level}' "
            f"board='{validated_board}' language='{language}'"
        )
 
        questions = await asyncio.to_thread(
            generate_test_mcqs,
            test_type,
            subject,
            chapter_title,
            topic_title or "",
            parsed_topics,
            question_count,
            language,
            validated_class_level,
            validated_board,
        )
 
        total_time = time.perf_counter() - total_start
        print(
            f"[TEST] Generated {len(questions)} MCQs "
            f"| TOTAL TEST TIME: {total_time:.2f}s"
        )
 
        return {
            "test_type": test_type,
            "subject": subject,
            "chapter_title": chapter_title,
            "topic_title": topic_title,
            "question_count": len(questions),
            "questions": questions,
        }
 
    except HTTPException:
        raise
 
    except Exception as e:
        print("\n[TEST ERROR] Test generation crashed:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"[{type(e).__name__}] {str(e)}"
        )
 
 
@app.post("/grade-test/")
async def grade_test(
    questions: str = Form(...),
    answers: str = Form(...),
    class_level: Optional[str] = Form(default=None),
    board: Optional[str] = Form(default=None),
    answer_language: Optional[str] = Form(default="en"),
):
    try:
        allowed_classes = {"5", "6", "7", "8", "9", "10"}
        allowed_boards = {"CBSE", "RBSE", "ICSE", "Other"}
        allowed_languages = {"en", "hi", "hinglish"}

        validated_class_level = class_level if class_level in allowed_classes else None
        validated_board = board if board in allowed_boards else None
        language = answer_language if answer_language in allowed_languages else "en"

        parsed_questions = json.loads(questions or "[]")
        parsed_answers = json.loads(answers or "{}")

        if not isinstance(parsed_questions, list):
            raise HTTPException(status_code=422, detail="Questions must be a list.")
        if not isinstance(parsed_answers, dict):
            raise HTTPException(status_code=422, detail="Answers must be an object.")

        grades = await asyncio.to_thread(
            grade_test_answers,
            parsed_questions,
            parsed_answers,
            language,
            validated_class_level,
            validated_board,
        )

        score = sum(float(item.get("score", 0)) for item in grades)
        total = sum(float(item.get("maxMarks", 0)) for item in grades)

        return {
            "grades": grades,
            "score": score,
            "total": total,
            "percentage": round((score / total) * 100) if total else 0,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n[GRADE ERROR] Test grading crashed:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"[{type(e).__name__}] {str(e)}"
        )


@app.post("/tts/")
async def generate_tts(
    text: str = Form(...),
    language: str = Form(default="en"),
):
    unique_id = uuid.uuid4().hex
    total_start = time.perf_counter()
 
    try:
        if not text.strip():
            raise HTTPException(status_code=422, detail="Text cannot be empty.")
 
        # Clean the text here too — the /tts/ endpoint receives
        # already-cleaned text from ask-text, but clean again
        # just to be safe so nothing slips through
        text = clean_text_for_tts(text)
 
        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")
        print(f"[TTS ROUTE] Generating audio for language='{language}'")
        await text_to_speech(text, language, audio_out_path)
 
        mtime     = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"
 
        total_time = time.perf_counter() - total_start
        print(f"[TTS ROUTE] Returning audio URL | TOTAL TTS TIME: {total_time:.2f}s")
 
        return {
            "audio_url": audio_url,
        }
 
    except HTTPException:
        raise
 
    except Exception as e:
        print("\n[TTS ROUTE ERROR] TTS generation crashed:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"[{type(e).__name__}] {str(e)}"
        )
