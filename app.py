from dotenv import load_dotenv
load_dotenv()
 
import os
import uuid
import asyncio
import traceback
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
async def ask_question(file: UploadFile = File(...)):
 
    file_ext   = os.path.splitext(file.filename)[-1] or ".webm"
    unique_id  = uuid.uuid4().hex
    audio_path = os.path.join(UPLOAD_DIR, f"{unique_id}{file_ext}")
 
    try:
        # ── Step 1: Save uploaded audio ───────────────────
        print(f"\n[STEP 1] Saving uploaded file: {file.filename}")
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        with open(audio_path, "wb") as f:
            f.write(content)
        print(f"[STEP 1] ✅ Saved to {audio_path} ({len(content)} bytes)")
 
        # ── Step 2: Speech to Text ────────────────────────
        print(f"[STEP 2] Running STT...")
        question, language = speech_to_text(audio_path)
        print(f"[STEP 2] ✅ question='{question}' language='{language}'")
 
        if not question.strip():
            raise HTTPException(status_code=422, detail="Could not detect speech. Please speak clearly.")
 
        # ── Step 3: LLM ───────────────────────────────────
        print(f"[STEP 3] Calling LLM...")
        answer = await asyncio.to_thread(ask_llm, question, language)
        print(f"[STEP 3] ✅ answer='{answer[:80]}...'")
 
        # ── Step 4: Text to Speech ────────────────────────
        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")
        print(f"[STEP 4] Running TTS → {audio_out_path}")
        await text_to_speech(answer, language, audio_out_path)
        print(f"[STEP 4] ✅ Audio saved")
 
        # ── Step 5: Return response ───────────────────────
        mtime     = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"
        print(f"[STEP 5] ✅ Returning response")
 
        return {
            "question":  question,
            "language":  language,
            "answer":    answer,
            "audio_url": audio_url,
        }
 
    except HTTPException:
        raise
 
    except Exception as e:
        # Print the FULL traceback to your terminal so we can see exactly which line failed
        print("\n[ERROR] ❌ Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"[{type(e).__name__}] {str(e)}")
 
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


from fastapi import Form  # add this to your existing fastapi import line

@app.post("/ask-text/")
async def ask_question_text(question: str = Form(...)):

    unique_id = uuid.uuid4().hex

    try:
        # ── Step 1: Detect language ───────────────────────
        # Simple heuristic: if any Devanagari character exists → Hindi
        import unicodedata
        has_devanagari = any(
            unicodedata.name(c, "").startswith("DEVANAGARI")
            for c in question
        )
        language = "hi" if has_devanagari else "en"
        print(f"[TEXT] question='{question}' language='{language}'")

        if not question.strip():
            raise HTTPException(status_code=422, detail="Question cannot be empty.")

        # ── Step 2: LLM ───────────────────────────────────
        print(f"[TEXT] Calling LLM...")
        answer = await asyncio.to_thread(ask_llm, question, language)
        print(f"[TEXT] ✅ answer='{answer[:80]}...'")

        # ── Step 3: TTS ───────────────────────────────────
        audio_out_path = os.path.join(AUDIO_DIR, f"{unique_id}.mp3")
        print(f"[TEXT] Running TTS → {audio_out_path}")
        await text_to_speech(answer, language, audio_out_path)
        print(f"[TEXT] ✅ Audio saved")

        # ── Step 4: Return ────────────────────────────────
        mtime     = os.path.getmtime(audio_out_path)
        audio_url = f"audio/{unique_id}.mp3?t={mtime:.0f}"

        return {
            "question":  question,
            "language":  language,
            "answer":    answer,
            "audio_url": audio_url,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n[TEXT ERROR] ❌ Pipeline crashed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"[{type(e).__name__}] {str(e)}")