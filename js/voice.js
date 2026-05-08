console.log("voice.js loaded");

let recognition = null;
let isListening = false;

// =========================
// INIT RECOGNITION
// =========================
function initVoiceRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    document.getElementById("voiceFeedback").innerHTML =
      "❌ Voice recognition not supported.";
    document.getElementById("voiceBtn").disabled = true;
    return null;
  }

  const recog = new SpeechRecognition();

  // 🔥 FIXED SETTINGS (IMPORTANT)
  recog.continuous = false;
  recog.interimResults = false;
  recog.lang = "en-US";

  // =========================
  // START
  // =========================
  recog.onstart = () => {

    isListening = true;

    const btn = document.getElementById("voiceBtn");
    btn.classList.add("listening");
    btn.innerHTML = "🎙️ Listening...";

    document.getElementById("voiceStatus").innerHTML = "🔴 Listening";
    document.getElementById("permissionHint").style.display = "none";
  };

  // =========================
  // RESULT
  // =========================
  recog.onresult = (event) => {

    const result = event.results[0][0];
    const command = normalizeText(result.transcript);

    document.getElementById("voiceCommandResult").style.display = "block";
    document.getElementById("voiceCommandResult").innerHTML =
      `🗣️ You said: "${command}"`;

    document.getElementById("voiceFeedback").innerHTML =
      `✅ Recognized: "${command}"`;

    console.log("Command:", command);

    processCommand(command);
  };

  // =========================
  // ERROR
  // =========================
  recog.onerror = (event) => {

    console.log("Speech error:", event.error);

    let msg = "⚠️ Voice error";

    if (event.error === "not-allowed") {
      msg = "❌ Microphone permission denied";
    } else if (event.error === "no-speech") {
      msg = "🎤 No speech detected";
    }

    document.getElementById("voiceFeedback").innerHTML = msg;

    stopListening();
  };

  // =========================
  // END
  // =========================
  recog.onend = () => {
    stopListening();
  };

  return recog;
}

// =========================
// START VOICE (BUTTON)
// =========================
async function startVoiceRecognition() {

  try {

    await navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(() => {
        document.getElementById("voiceFeedback").innerHTML =
          "❌ Microphone blocked";
      });

    recognition = initVoiceRecognition();

    if (!recognition) return;

    recognition.start();

  } catch (e) {
    console.error(e);
    document.getElementById("voiceFeedback").innerHTML =
      "❌ Failed to start voice recognition";
  }
}

// =========================
// STOP
// =========================
function stopListening() {

  isListening = false;

  const btn = document.getElementById("voiceBtn");

  btn.classList.remove("listening");
  btn.innerHTML = "🎤 Activate Voice Command";

  document.getElementById("voiceStatus").innerHTML = "🔵 Idle";

  if (recognition) {
    try {
      recognition.onend = null;
      recognition.stop();
    } catch (e) {
      console.log(e);
    }
  }
}

// =========================
// TEXT NORMALIZATION
// =========================
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =========================
// COMMAND PROCESSOR (FULL RESTORED FEATURES)
// =========================
function processCommand(command) {

  console.log("Detected command:", command);

  if (!mode) {
    speakText("Please select safety mode first.");
    return;
  }

  const cmd = command.toLowerCase();

  // =========================
  // SOS
  // =========================
  if (
    cmd.includes("sos") ||
    cmd.includes("emergency") ||
    cmd.includes("help")
  ) {
    callSOS();
    speakText("SOS activated");
    return;
  }

  // =========================
  // CALL POLICE
  // =========================
  if (cmd.includes("call police") || cmd.includes("police station call")) {
    speakText("Calling police station");
    setTimeout(() => window.location.href = "tel:100", 500);
    return;
  }

  // =========================
  // FIND POLICE
  // =========================
  if (cmd.includes("police")) {
    findPolice();
    speakText("Searching police stations");
    return;
  }

  // =========================
  // SHARE LOCATION
  // =========================
  if (
    cmd.includes("share location") ||
    cmd.includes("send location") ||
    cmd.includes("location")
  ) {
    shareLocation();
    speakText("Sharing location");
    return;
  }

  // =========================
  // UNIVERSAL SOS LINK
  // =========================
  if (cmd.includes("universal") || cmd.includes("url")) {
    shareUniversalSOS();
    speakText("Sharing universal SOS");
    return;
  }

  // =========================
  // HELPLINES
  // =========================
  if (
    cmd.includes("helpline") ||
    cmd.includes("ambulance") ||
    cmd.includes("women") ||
    cmd.includes("child")
  ) {

    let number = "112";
    let label = "Emergency";

    if (mode === "child" || cmd.includes("child")) {
      number = "1098";
      label = "Child Helpline";
    } else if (mode === "women" || cmd.includes("women")) {
      number = "1091";
      label = "Women Helpline";
    } else if (mode === "accident" || cmd.includes("ambulance")) {
      number = "108";
      label = "Ambulance";
    }

    speakText(`Calling ${label}`);

    setTimeout(() => {
      window.location.href = `tel:${number}`;
    }, 500);

    return;
  }

  // =========================
  // SMART CONTACT CALLING
  // =========================
  if (cmd.includes("call")) {

    let bestMatch = null;
    let bestScore = 0;

    for (let contact of emergencyContacts) {

      const name = normalizeText(contact.name);
      const score = similarity(cmd, name);

      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = contact;
      }
    }

    if (bestMatch) {
      speakText(`Calling ${bestMatch.name}`);

      setTimeout(() => {
        callContact(bestMatch.id);
      }, 500);

      return;
    }
  }

  speakText("Command not recognized. Please repeat.");
}

// =========================
// SPEAK
// =========================
function speakText(message) {

  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}