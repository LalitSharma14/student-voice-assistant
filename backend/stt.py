import os
import tempfile
from faster_whisper import WhisperModel

# =========================================================
# BEST CONFIG FOR STUDENT MULTILINGUAL VOICE ASSISTANT
# =========================================================
# Optimized for:
# - Hindi
# - Hinglish
# - Indian regional languages
# - Low RAM systems
# - Faster response
# - CPU friendly
# =========================================================

MODEL_SIZE = "small"   # BEST balance for speed + accuracy

model = WhisperModel(
    MODEL_SIZE,
    device="cpu",
    compute_type="int8",
    cpu_threads=4,
)

SUPPORTED_LANGUAGES = {
    "hi",  # Hindi
    "en",  # English
    "pa",  # Punjabi
    "bn",  # Bengali
    "te",  # Telugu
    "mr",  # Marathi
    "ta",  # Tamil
    "gu",  # Gujarati
    "kn",  # Kannada
    "ur",  # Urdu
    "ml",  # Malayalam
}

# =========================================================
# MAIN SPEECH TO TEXT FUNCTION
# =========================================================

def speech_to_text(audio_path: str) -> tuple[str, str]:

    try:

        segments, info = model.transcribe(

            audio_path,

            # =========================================
            # SPEED OPTIMIZATIONS
            # =========================================

            beam_size=3,

            best_of=3,

            temperature=0,

            patience=1,

            length_penalty=1,

            compression_ratio_threshold=2.4,

            log_prob_threshold=-1.0,

            no_speech_threshold=0.6,

            # =========================================
            # AUDIO OPTIMIZATIONS
            # =========================================

            vad_filter=True,

            vad_parameters={
                "min_silence_duration_ms": 250,
                "speech_pad_ms": 400,
                "threshold": 0.5,
            },

            # =========================================
            # PERFORMANCE SETTINGS
            # =========================================

            without_timestamps=True,

            word_timestamps=False,

            condition_on_previous_text=False,

            multilingual=True,

            # KEEP AUTO-DETECTION
            # IMPORTANT FOR HINGLISH + MIXED LANGUAGES
            language=None,

            task="transcribe",
        )

        # =========================================
        # CONVERT SEGMENTS TO TEXT
        # =========================================

        text_parts = []

        for segment in segments:

            segment_text = segment.text.strip()

            if segment_text:
                text_parts.append(segment_text)

        text = " ".join(text_parts).strip()

        # =========================================
        # LANGUAGE DETECTION
        # =========================================

        language = info.language

        if language not in SUPPORTED_LANGUAGES:
            language = "en"

        # =========================================
        # EMPTY SPEECH HANDLING
        # =========================================

        if not text:
            return "", language

        return text, language

    except Exception as e:

        print(f"STT Error: {e}")

        return "", "en"
