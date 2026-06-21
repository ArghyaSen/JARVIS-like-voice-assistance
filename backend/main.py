import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from brain import ask_jarvis
from stt import listen_once
from tts import speak

app = FastAPI(title="J.A.R.V.I.S. Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_history = []


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    heard: str = ""
    speak_duration: int = 0


@app.get("/")
def root():
    return {"status": "J.A.R.V.I.S. is online"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    global conversation_history
    try:
        reply, conversation_history = await ask_jarvis(req.message, conversation_history)
        asyncio.create_task(speak(reply))
        duration = max(2000, len(reply) * 55)
        return ChatResponse(reply=reply, speak_duration=duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/listen", response_model=ChatResponse)
async def listen():
    global conversation_history
    try:
        user_text = await listen_once()
        if not user_text:
            raise HTTPException(status_code=400, detail="Could not understand audio")
        print(f"[JARVIS] Heard: {user_text}")
        reply, conversation_history = await ask_jarvis(user_text, conversation_history)
        asyncio.create_task(speak(reply))
        duration = max(2000, len(reply) * 55)
        return ChatResponse(reply=reply, heard=user_text, speak_duration=duration)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/history")
def clear_history():
    global conversation_history
    conversation_history = []
    return {"status": "Conversation history cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)