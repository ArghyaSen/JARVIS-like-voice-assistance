import pyttsx3
import asyncio
import threading

# --- Voice config ---
def _setup_engine():
    eng = pyttsx3.init()
    voices = eng.getProperty('voices')
    for voice in voices:
        if any(name in voice.name.lower() for name in ['male', 'david', 'mark', 'george']):
            eng.setProperty('voice', voice.id)
            break
    eng.setProperty('rate', 165)
    eng.setProperty('volume', 1.0)
    return eng


def _speak_in_thread(text: str) -> None:
    """
    pyttsx3 must run in its own thread with its own engine instance.
    Sharing an engine across threads causes CancelledError and crashes.
    """
    try:
        eng = _setup_engine()
        eng.say(text)
        eng.runAndWait()
        eng.stop()
    except Exception as e:
        print(f"[TTS] Thread error: {e}")


async def speak(text: str) -> None:
    """
    Spawn a dedicated thread for pyttsx3 and wait for it to finish.
    This avoids asyncio CancelledError from run_in_executor timeouts.
    """
    if not text or not text.strip():
        return
    try:
        done = threading.Event()

        def run():
            _speak_in_thread(text)
            done.set()

        t = threading.Thread(target=run, daemon=True)
        t.start()

        # Wait for speech to finish without blocking the event loop
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, done.wait)

    except Exception as e:
        print(f"[TTS] Error: {e}")