const orb         = document.getElementById("orb-container");
const orbCore     = document.getElementById("orb-core");
const waveBars    = document.getElementById("wave-bars");
const transcript  = document.getElementById("transcript");
const statusText  = document.getElementById("status-text");
const textInput   = document.getElementById("text-input");
const micBtn      = document.getElementById("mic-btn");
const sendBtn     = document.getElementById("send-btn");
const clearBtn    = document.getElementById("clear-btn");
const clock       = document.getElementById("clock");
const btnMinimize = document.getElementById("btn-minimize");
const btnClose    = document.getElementById("btn-close");

let isListening = false;
let isBusy      = false;


// ── Clock ──────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}
updateClock();
setInterval(updateClock, 1000);

// ── Orb state ──────────────────────────────────────────────────────────────
const ORB_ICONS = {
  idle:      "🧠",
  listening: "🎙️",
  thinking:  "⚙️",
  speaking:  "🔊",
};

function setOrbState(state) {
  orb.className = state === "idle" ? "orb-container" : `orb-container ${state}`;
  orbCore.textContent = ORB_ICONS[state] || ORB_ICONS.idle;

  const showWave = ["listening", "thinking", "speaking"].includes(state);
  waveBars.classList.toggle("active", showWave);

  const labels = {
    idle:      "ONLINE",
    listening: "LISTENING",
    thinking:  "PROCESSING",
    speaking:  "SPEAKING",
  };
  statusText.textContent = labels[state] || "ONLINE";
}


// ── Transcript ─────────────────────────────────────────────────────────────
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  transcript.appendChild(div);
  transcript.scrollTop = transcript.scrollHeight;
}


// ── Chat (text) ────────────────────────────────────────────────────────────
async function sendMessage() {
  const message = textInput.value.trim();
  if (!message || isBusy) return;

  textInput.value = "";
  isBusy = true;
  addMessage("user", message);
  setOrbState("thinking");

  try {
    const res = await window.jarvis.chat(message);
    if (res?.reply) {
      addMessage("assistant", res.reply);
      setOrbState("speaking");
      setTimeout(() => {
        setOrbState("idle");
        isBusy = false;
      }, res.speak_duration || 3000);
    } else {
      addMessage("error", "No response received.");
      setOrbState("idle");
      isBusy = false;
    }
  } catch (err) {
    addMessage("error", `Error: ${err.message}`);
    setOrbState("idle");
    isBusy = false;
  }
}


// ── Listen (voice) ─────────────────────────────────────────────────────────
async function startListening() {
  if (isBusy) return;
  isBusy = true;
  isListening = true;

  micBtn.classList.add("recording");
  setOrbState("listening");

  try {
    const res = await window.jarvis.listen();

    micBtn.classList.remove("recording");
    isListening = false;

    if (res?.reply) {
      addMessage("user", res.heard || "( voice input )");
      addMessage("assistant", res.reply);
      setOrbState("speaking");
      setTimeout(() => {
        setOrbState("idle");
        isBusy = false;
      }, res.speak_duration || 3000);
    } else if (res?.detail) {
      addMessage("error", `Could not understand: ${res.detail}`);
      setOrbState("idle");
      isBusy = false;
    } else {
      addMessage("error", "No response received. Try again.");
      setOrbState("idle");
      isBusy = false;
    }
  } catch (err) {
    addMessage("error", `Listen error: ${err.message}`);
    setOrbState("idle");
    isBusy = false;
    isListening = false;
    micBtn.classList.remove("recording");
  }
}


// ── Clear history ──────────────────────────────────────────────────────────
async function clearHistory() {
  if (isBusy) return;
  try {
    await window.jarvis.clearHistory();
    transcript.innerHTML = "";
    addMessage("system", "Conversation history cleared. Starting fresh.");
  } catch (err) {
    addMessage("error", `Clear error: ${err.message}`);
  }
}


// ── Event listeners ────────────────────────────────────────────────────────
sendBtn.addEventListener("click", sendMessage);
micBtn.addEventListener("click", startListening);
orb.addEventListener("click", startListening);
clearBtn.addEventListener("click", clearHistory);

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Global hotkey from main.js (Ctrl+Shift+J)
window.jarvis.onTriggerListen(() => {
  startListening();
});

// Window controls
btnMinimize.addEventListener("click", () => window.jarvis.minimize());
btnClose.addEventListener("click",    () => window.jarvis.close());