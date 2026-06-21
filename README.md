# J.A.R.V.I.S. 🤖
### Offline Intelligent System

A fully offline Jarvis-like voice assistant built with Python and Electron. Talk to it using your microphone or type messages — it responds with text and speech.

---

## Features
- 🎙️ Voice input using CMU Sphinx (offline)
- 🔊 Voice output using pyttsx3 (offline)
- 🧠 AI responses powered by Ollama + Llama3 (fully local)
- 💬 Conversation memory across the session
- 🖥️ Sleek desktop UI built with Electron
- ⌨️ Type or speak your queries

---

## Technology Used

| Layer | Technology |
|-------|-----------|
| AI Model | Ollama + Llama3 (local) |
| Backend | Python + FastAPI |
| Speech to Text | CMU Sphinx via SpeechRecognition |
| Text to Speech | pyttsx3 |
| Desktop UI | Electron |
| Communication | HTTP via localhost |

---

## Project Structure

    JARVIS/
    ├── backend/
    │   ├── main.py          # FastAPI server
    │   ├── brain.py         # Ollama AI integration
    │   ├── stt.py           # Speech to text
    │   ├── tts.py           # Text to speech
    │   └── requirements.txt
    └── frontend/
        ├── main.js          # Electron main process
        ├── preload.js       # Secure IPC bridge
        ├── index.html       # UI
        ├── renderer.js      # UI logic
        └── package.json

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com/download)

---

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/ArghyaSen/JARVIS-like-voice-assistance.git
cd JARVIS-like-voice-assistance
```

### 2. Install Python dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Electron
```bash
cd ../frontend
npm install
```

### 4. Pull the AI model
```bash
ollama pull llama3
```

---

## Running

### Option A — Manual
```bash
# Terminal 1
ollama serve

# Terminal 2
cd frontend
npm start
```

### Option B — Double click
Run `start_jarvis.bat` from the root folder.

---

## Usage

| Action | How |
|--------|-----|
| Voice input | Click the orb or mic button |
| Text input | Type in the bottom bar and hit Enter |
| Clear memory | Click the 🗑 button |
| Global hotkey | `Ctrl+Shift+J` from anywhere |

---

## Works 100% Offline
Once set up, J.A.R.V.I.S. runs entirely on your local machine — no internet, no API keys, no subscriptions.
