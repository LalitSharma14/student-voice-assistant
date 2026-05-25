from faster_whisper import WhisperModel

model = WhisperModel(
    "medium",        # upgraded from "small" → better Hindi/Hinglish accuracy
    device="cpu",
    compute_type="int8",
)

SUPPORTED_LANGUAGES = {"hi", "en", "pa", "bn", "te", "mr", "ta", "gu", "kn", "ur"}

def speech_to_text(audio_path: str) -> tuple[str, str]:
    segments, info = model.transcribe(
        audio_path,
        beam_size=1,                # fastest setting (was 3)
        vad_filter=True,
        vad_parameters={
            "min_silence_duration_ms": 200,   # faster silence trimming (was 300)
            "threshold": 0.5,                  # more sensitive voice detection
        },
        without_timestamps=True,
        condition_on_previous_text=False,      # faster, no context carry-over in STT
        language=None,                         # auto-detect language
        task="transcribe",
    )

    text = " ".join(segment.text.strip() for segment in segments).strip()
    language = info.language

    if language not in SUPPORTED_LANGUAGES:
        language = "en"

    return text, language