from faster_whisper import WhisperModel

# ── Model loaded once at startup (not on every request) ────
# "small" is a good balance of speed vs accuracy for Indian languages.
# Upgrade to "medium" if Hindi accuracy is poor on your hardware.
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
)

# Languages your students are likely to use.
# Whisper uses these to skip language-detection and transcribe faster.
SUPPORTED_LANGUAGES = {"hi", "en", "pa", "bn", "te", "mr", "ta", "gu", "kn", "ur"}


def speech_to_text(audio_path: str) -> tuple[str, str]:
    """
    Transcribe audio and return (text, language_code).

    Optimisations applied:
    - beam_size=3  → faster than 5 with minimal accuracy loss for short student questions
    - vad_filter   → skips silent parts, cuts processing time significantly
    - No language hint so Whisper auto-detects; works well for Hindi/English/Hinglish
    """
    segments, info = model.transcribe(
        audio_path,
        beam_size=3,          # was 5 — faster, still accurate for short questions
        vad_filter=True,      # Voice Activity Detection: skip silence automatically
        vad_parameters={
            "min_silence_duration_ms": 300,   # trim trailing silence quickly
        },
        without_timestamps=True,  # slightly faster; we don't need word-level timing
    )

    # Join all segments; strip leading/trailing whitespace
    text = " ".join(segment.text.strip() for segment in segments).strip()

    language = info.language  # e.g. "hi", "en", "hinglish" detected as "hi"

    # Normalise: if Whisper returns a language not in our set, fall back to English
    if language not in SUPPORTED_LANGUAGES:
        language = "en"

    return text, language
