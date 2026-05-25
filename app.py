from dotenv import load_dotenv
load_dotenv()

import os
import json
import uuid
import asyncio
import time
import unicodedata
import traceback
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.stt import speech_to_text
from backend.llm import ask_llm
from backend.tts import text_to_speech

# ── Directories ────────────────────────────────────────────
UPLOAD_DIR = "uploads"
AUDIO_DIR  = "audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR,  exist_ok=True)

# ── App ────────────────────────────────────────────────────
app = FastAPI(title="Student Voice Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")


@app.get("/")
def home():
    return {"message": "Student Voice Assistant Backend Running ✅"}


@app.post("/ask/")
async def ask_question(
    file: UploadFile = File(...),
    history: Optional[str] = Form(default="[]"),
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
        print(f"[STEP 1] ✅ Saved to {audio_path} ({len(content)} bytes) | Time: {save_time:.2f}s")

        stt_start = time.perf_counter()
        print(f"[STEP 2] Running STT...")
        question, language = speech_to_text(audio_path)
        stt_time = time.perf_counter() - stt_start
        print(f"[STEP 2] ✅ question='{question}' language='{language}' | Time: {stt_time:.2f}s")

        if not question.strip():
            raise HTTPException(status_code=422, detail="Could not detect speech. Please speak clearly.")

        llm_start = time.perf_counter()
        print(f"[STEP 3] Calling LLM...")
        chat_history = json.loads(history)
        answer = await asyncio.to_thread(ask_llm, question, language, chat_history)
        llm_time = time.perf_counter() - llm_start
        print(f"[STEP 3] ✅ answer='{answer[:80]}...'| Time: {save_time:.2f}s")

        tts_start = time.perf_counter()
        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")
        print(f"[STEP 4] Running TTS → {audio_out_path}")
        await text_to_speech(answer, language, audio_out_path)
        print(f"[STEP 4] ✅ Audio saved | Time: {save_time:.2f}s")

        mtime     = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"

        total_time = time.perf_counter() - total_start
        print(f"[STEP 5] ✅ Returning response | TOTAL VOICE TIME: {total_time:.2f}s")

        return {
            "question":  question,
            "language":  language,
            "answer":    answer,
            "audio_url": audio_url,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n[ERROR] ❌ Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"[{type(e).__name__}] {str(e)}")

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


@app.post("/ask-text/")
async def ask_question_text(
    question: str = Form(...),
    history: Optional[str] = Form(default="[]"),
):
    unique_id = uuid.uuid4().hex
    total_start = time.perf_counter()

    try:
        has_devanagari = any(
            unicodedata.name(c, "").startswith("DEVANAGARI")
            for c in question
        )
        language = "hi" if has_devanagari else "en"
        print(f"[TEXT] question='{question}' language='{language}'")

        if not question.strip():
            raise HTTPException(status_code=422, detail="Question cannot be empty.")

        llm_start = time.perf_counter()

        print(f"[TEXT] Calling LLM...")
        chat_history = json.loads(history)
        answer = await asyncio.to_thread(ask_llm, question, language, chat_history)

        llm_time = time.perf_counter() - llm_start
        print(f"[TEXT] ✅ answer='{answer[:80]}...' | LLM Time: {llm_time:.2f}s")

        total_time = time.perf_counter() - total_start
        print(f"[TEXT] ✅ Returning text response without TTS | TOTAL TEXT TIME: {total_time:.2f}s")

        return {
            "question": question,
            "language": language,
            "answer": answer,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n[TEXT ERROR] ❌ Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"[{type(e).__name__}] {str(e)}")
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

        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")

        print(f"[TTS ROUTE] Generating audio for language='{language}'")
        await text_to_speech(text, language, audio_out_path)

        mtime = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"

        total_time = time.perf_counter() - total_start
        print(f"[TTS ROUTE] ✅ Returning audio URL | TOTAL TTS TIME: {total_time:.2f}s")

        return {
            "audio_url": audio_url,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n[TTS ROUTE ERROR] ❌ TTS generation crashed:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"[{type(e).__name__}] {str(e)}"
        )    