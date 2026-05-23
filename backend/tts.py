import asyncio
import edge_tts
import re

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


def split_into_sentences(text: str) -> list[str]:
    """
    Split text into sentences for more reliable TTS rendering.
    Handles Hindi (।), English (. ! ?), and mixed Hinglish text.
    Filters out empty chunks.
    """
    # Split on Hindi purna viram (।), or . ! ? followed by space or end
    parts = re.split(r'(?<=[।.!?])\s+', text.strip())
    # Also split on । without trailing space
    result = []
    for part in parts:
        sub = re.split(r'।', part)
        result.extend(sub)
    # Clean and filter
    return [s.strip() for s in result if s.strip()]


async def synthesize_chunk(text: str, voice: str, output_path: str) -> bool:
    """Synthesize a single chunk of text. Returns True on success."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            communicate = edge_tts.Communicate(text=text, voice=voice, rate="+5%")
            await communicate.save(output_path)
            return True
        except Exception as e:
            print(f"[TTS] ⚠️ Attempt {attempt} failed for chunk: {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(1.5 * attempt)
    return False


async def text_to_speech(text: str, language: str, output_path: str) -> None:
    """
    Convert text to speech.
    - Splits Hindi/Hinglish into sentences first for reliable rendering.
    - Falls back to English voice if the chosen voice fails entirely.
    """
    voice = VOICE_MAP.get(language, DEFAULT_VOICE)
    print(f"[TTS] Voice: {voice} | Language: {language}")

    # For Hindi/Hinglish — split into sentences and synthesize each,
    # then concatenate the raw audio bytes into one file
    if language in ("hi", "mr", "bn", "te", "ta", "gu", "kn", "ml", "pa", "ur"):
        sentences = split_into_sentences(text)
        print(f"[TTS] Split into {len(sentences)} sentence(s): {sentences}")

        all_audio = bytearray()

        for i, sentence in enumerate(sentences):
            chunk_path = output_path + f".chunk{i}.mp3"
            success = await synthesize_chunk(sentence, voice, chunk_path)

            if not success:
                # Try fallback voice for this chunk
                print(f"[TTS] 🔄 Chunk {i} failed, trying fallback voice")
                success = await synthesize_chunk(sentence, DEFAULT_VOICE, chunk_path)

            if success:
                with open(chunk_path, "rb") as f:
                    all_audio.extend(f.read())
                import os
                os.remove(chunk_path)
            else:
                print(f"[TTS] ❌ Chunk {i} failed completely, skipping")

        if not all_audio:
            raise RuntimeError("TTS failed: no audio was generated for any sentence chunk.")

        with open(output_path, "wb") as f:
            f.write(all_audio)

        print(f"[TTS] ✅ Saved combined audio to {output_path}")
        return

    # For English and other Latin-script languages — send full text at once
    success = await synthesize_chunk(text, voice, output_path)

    if not success:
        print(f"[TTS] 🔄 Retrying with fallback voice: {DEFAULT_VOICE}")
        success = await synthesize_chunk(text, DEFAULT_VOICE, output_path)

    if not success:
        raise RuntimeError(f"TTS failed after {MAX_RETRIES} retries for language: {language}")

    print(f"[TTS] ✅ Saved to {output_path}")