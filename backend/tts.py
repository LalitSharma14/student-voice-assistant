import re
import asyncio
import edge_tts

# ── Voice map ──────────────────────────────────────────────
VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",
    "bn": "bn-IN-TanishaaNeural",
    "te": "te-IN-ShrutiNeural",
    "mr": "mr-IN-AarohiNeural",
    "ta": "ta-IN-PallaviNeural",
    "gu": "gu-IN-DhwaniNeural",
    "kn": "kn-IN-SapnaNeural",
    "ml": "ml-IN-SobhanaNeural",
    "pa": "pa-IN-OjasveeNeural",
    "ur": "ur-PK-AsadNeural",
    "en": "en-IN-NeerjaNeural",
    "fr": "fr-FR-DeniseNeural",
    "es": "es-ES-ElviraNeural",
    "de": "de-DE-KatjaNeural",
    "ja": "ja-JP-NanamiNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ar": "ar-SA-ZariyahNeural",
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"
MAX_RETRIES   = 3


def clean_text_for_tts(text: str) -> str:
    """
    Remove or replace symbols that TTS reads out loud incorrectly.
    """
    # Remove markdown formatting
    text = re.sub(r'\*\*?(.*?)\*\*?', r'\1', text)   # bold/italic **text** or *text*
    text = re.sub(r'__(.*?)__', r'\1', text)           # __text__
    text = re.sub(r'#{1,6}\s*', '', text)              # headings # ## ###
    text = re.sub(r'`{1,3}.*?`{1,3}', '', text, flags=re.DOTALL)  # code blocks

    # Replace symbols with spoken equivalents
    text = text.replace('→', ' to ')
    text = text.replace('←', ' from ')
    text = text.replace('↑', ' up ')
    text = text.replace('↓', ' down ')
    text = text.replace('&', ' and ')
    text = text.replace('%', ' percent ')
    text = text.replace('+', ' plus ')
    text = text.replace('=', ' equals ')
    text = text.replace('>', ' greater than ')
    text = text.replace('<', ' less than ')
    text = text.replace('/', ' ')
    text = text.replace('\\', ' ')
    text = text.replace('|', ' ')
    text = text.replace('~', ' ')
    text = text.replace('^', ' ')
    text = text.replace('@', ' at ')
    text = text.replace('#', ' ')
    text = text.replace('$', ' dollars ')
    text = text.replace('_', ' ')

    # Remove bullet points and list markers
    text = re.sub(r'^\s*[-•*]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)

    # Remove URLs
    text = re.sub(r'http\S+', '', text)

    # Remove extra whitespace and blank lines
    text = re.sub(r'\n{2,}', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)

    return text.strip()


def split_into_sentences(text: str) -> list[str]:
    """
    Split text into sentences properly.
    Handles Hindi (।) and English (. ! ?) punctuation.
    Keeps sentences long enough to avoid choppy audio.
    """
    # Split on sentence endings
    parts = re.split(r'(?<=[।.!?])\s+', text.strip())

    # Further split on Hindi purna viram without space
    result = []
    for part in parts:
        sub = re.split(r'।', part)
        result.extend(sub)

    # Clean, filter empty, and merge very short chunks (less than 4 words)
    # to avoid choppy audio gaps between tiny pieces
    cleaned = [s.strip() for s in result if s.strip()]
    merged = []
    buffer = ""
    for chunk in cleaned:
        if buffer:
            buffer += " " + chunk
        else:
            buffer = chunk
        # Only flush if chunk is long enough
        if len(buffer.split()) >= 6:
            merged.append(buffer)
            buffer = ""
    if buffer:
        merged.append(buffer)

    return merged if merged else [text]


async def synthesize_chunk(text: str, voice: str, output_path: str) -> bool:
    """Synthesize a single chunk. Returns True on success."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            communicate = edge_tts.Communicate(text=text, voice=voice, rate="+5%")
            await communicate.save(output_path)
            return True
        except Exception as e:
            print(f"[TTS] ⚠️ Attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(1.5 * attempt)
    return False


async def text_to_speech(text: str, language: str, output_path: str) -> None:
    """
    Convert text to speech.
    - Cleans symbols before sending to TTS.
    - Splits into sentences for Hindi/Indian languages.
    - Merges audio chunks into one file.
    """
    import os

    # Always clean text first
    text = clean_text_for_tts(text)
    print(f"[TTS] Cleaned text: {text[:100]}...")

    voice = VOICE_MAP.get(language, DEFAULT_VOICE)
    print(f"[TTS] Voice: {voice} | Language: {language}")

    # Indian languages — split into sentences and merge audio
    if language in ("hi", "mr", "bn", "te", "ta", "gu", "kn", "ml", "pa", "ur"):
        sentences = split_into_sentences(text)
        print(f"[TTS] Split into {len(sentences)} chunk(s)")

        all_audio = bytearray()

        for i, sentence in enumerate(sentences):
            chunk_path = output_path + f".chunk{i}.mp3"
            success = await synthesize_chunk(sentence, voice, chunk_path)

            if not success:
                print(f"[TTS] 🔄 Chunk {i} failed, trying fallback voice")
                success = await synthesize_chunk(sentence, DEFAULT_VOICE, chunk_path)

            if success:
                with open(chunk_path, "rb") as f:
                    all_audio.extend(f.read())
                os.remove(chunk_path)
            else:
                print(f"[TTS] ❌ Chunk {i} skipped")

        if not all_audio:
            raise RuntimeError("TTS failed: no audio generated.")

        with open(output_path, "wb") as f:
            f.write(all_audio)

        print(f"[TTS] ✅ Saved combined audio to {output_path}")
        return

    # English and other Latin-script languages — send full text at once
    success = await synthesize_chunk(text, voice, output_path)

    if not success:
        print(f"[TTS] 🔄 Retrying with fallback voice")
        success = await synthesize_chunk(text, DEFAULT_VOICE, output_path)

    if not success:
        raise RuntimeError(f"TTS failed after {MAX_RETRIES} retries.")

    print(f"[TTS] ✅ Saved to {output_path}")