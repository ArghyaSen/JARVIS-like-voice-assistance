import httpx

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3"  

SYSTEM_PROMPT = """You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), 
a sophisticated AI assistant inspired by Tony Stark's AI. You are calm, precise, 
witty, and highly capable. Keep responses concise and conversational — 2-4 sentences 
unless a longer answer is truly needed. Occasionally add dry British wit. 
Respond in plain spoken sentences, no markdown, no bullet points."""


async def ask_jarvis(user_message: str, history: list) -> tuple[str, list]:
    """
    Send a message to the local Ollama model and return the reply + updated history.
    """

    # Append new user message to history
    history.append({
        "role": "user",
        "content": user_message
    })

    # Build the full messages payload with system prompt
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "messages": messages,
                    "stream": False,        
                    "options": {
                        "temperature": 0.7, 
                        "num_predict": 300, 
                    }
                }
            )
            response.raise_for_status()
            data = response.json()

        reply = data["message"]["content"].strip()

        # Append Jarvis reply to history so context is maintained
        history.append({
            "role": "assistant",
            "content": reply
        })

        return reply, history

    except httpx.ConnectError:
        raise RuntimeError(
            "Cannot connect to Ollama. Make sure it's running: `ollama serve`"
        )
    except Exception as e:
        raise RuntimeError(f"Brain error: {e}")


def clear_history() -> list:
    """Return a fresh empty history."""
    return []