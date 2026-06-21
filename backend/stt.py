import asyncio
import speech_recognition as sr

# Initialize the recognizer once
recognizer = sr.Recognizer()

# --- Tuning knobs ---
ENERGY_THRESHOLD = 300     
PAUSE_THRESHOLD = 0.8      
PHRASE_LIMIT = 5           


def _listen_blocking() -> str | None:
    """
    Blocking function that captures mic input and transcribes it offline
    using CMU Sphinx. Runs in a thread so it doesn't block the event loop.
    """
    with sr.Microphone() as source:
        print("[STT] Calibrating for ambient noise...")
        recognizer.adjust_for_ambient_noise(source, duration=0.3)
        recognizer.energy_threshold = ENERGY_THRESHOLD
        recognizer.pause_threshold = PAUSE_THRESHOLD

        print("[STT] Listening...")
        try:
            audio = recognizer.listen(source, phrase_time_limit=PHRASE_LIMIT)
        except sr.WaitTimeoutError:
            print("[STT] Listening timed out, no speech detected.")
            return None

    print("[STT] Transcribing...")
    try:
        
        text = recognizer.recognize_sphinx(audio)
        print(f"[STT] Heard: {text}")
        return text.strip()

    except sr.UnknownValueError:
        print("[STT] Could not understand audio.")
        return None
    except sr.RequestError as e:
        print(f"[STT] Sphinx error: {e}")
        return None


async def listen_once() -> str | None:
    """
    Async wrapper — runs the blocking mic capture in a thread pool
    so FastAPI stays responsive while waiting for speech.
    """
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _listen_blocking)
    return result