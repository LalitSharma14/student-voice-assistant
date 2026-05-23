# 🎓 Student Voice Assistant

An AI-powered voice assistant designed for Indian school students from **Class 5 to Class 10**. Students can ask questions in **Hindi, English, or Hinglish** using their voice or text, and get clear, age-appropriate answers spoken back to them.

---

## ✨ Features

- 🎤 **Voice Input** — Record your question directly from the browser
- ⌨️ **Text Input** — Type your question if you prefer
- 🧠 **AI-Powered Answers** — Powered by Google Gemini and Groq LLaMA
- 🔊 **Voice Output** — Answers are spoken back using natural Indian voices
- 🇮🇳 **Multi-language** — Supports Hindi, English, Hinglish, and other Indian languages
- 📱 **Responsive UI** — Works on desktop and mobile browsers

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| Next.js 16 | React framework |
| Tailwind CSS 4 | Styling |
| MediaRecorder API | Browser audio recording |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | REST API server |
| Faster-Whisper | Speech to Text (STT) |
| Google Gemini 2.5 Flash | Primary LLM |
| Groq LLaMA 3.3 70B | Fallback LLM |
| Edge-TTS | Text to Speech (TTS) |
