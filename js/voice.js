console.log("voice.js loaded");

let recognition = null;
let isListening = false;

// =========================
// INIT VOICE RECOGNITION
// =========================
function initVoiceRecognition() {

  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    document.getElementById("voiceFeedback").innerHTML =
      "❌ Voice recognition not supported.";

    document.getElementById("voiceBtn").disabled = true;
    return null;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recog = new SpeechRecognition();

  recog.continuous = true;
  recog.interimResults = false;
  recog.maxAlternatives = 5;
  recog.lang = "en-US";

  // =========================
  // START
  // =========================
  recog.onstart = () => {

    isListening = true;

    document.getElementById("voiceBtn").classList.add("listening");
    document.getElementById("voiceBtn").innerHTML = "🎙️ Listening...";
    document.getElementById("voiceStatus").innerHTML = "🔴 Listening";
    document.getElementById("permissionHint").style.display = "none";
  };

  // =========================
  // ERROR
  // =========================
  recog.onerror = (event) => {

    let errorMessage = "";

    switch (event.error) {
      case "not-allowed":
        errorMessage = "❌ Microphone access denied.";
        break;
      case "no-speech":
        errorMessage = "🎤 No speech detected.";
        break;
      default:
        errorMessage = "⚠️ Speech recognition error.";
    }

    document.getElementById("voiceFeedback").innerHTML = errorMessage;
    stopListening();
  };

  recog.onend = () => {
    if (isListening) stopListening();
  };

  // =========================
  // RESULT
  // =========================
  recog.onresult = (event) => {

    const result =
      event.results[event.results.length - 1][0];

    const command = normalizeText(result.transcript);
    const confidence = result.confidence || 0;

    document.getElementById("voiceCommandResult").style.display = "block";
    document.getElementById("voiceCommandResult").innerHTML =
      `🗣️ You said: "${command}"`;

    document.getElementById("voiceFeedback").innerHTML =
      `✅ Recognized: "${command}"`;

    console.log("Command:", command, "Confidence:", confidence);

    processCommand(command);

    stopListening();
  };

  return recog;
}

// =========================
// START LISTENING
// =========================
async function startVoiceRecognition() {

  // =========================
  // CHECK MIC PERMISSION FIRST
  // =========================
  try {

    const permission = await navigator.permissions?.query({
      name: "microphone"
    });

    console.log("Mic permission:", permission?.state);

    if (permission?.state === "denied") {

      document.getElementById("voiceFeedback").innerHTML =
        "❌ Microphone blocked. Please enable it in browser settings.";

      return;
    }

  } catch (e) {
    console.log("Permission API not supported");
  }

  // =========================
  // CONTINUE NORMAL FLOW
  // =========================

  if (!recognition) {
    recognition = initVoiceRecognition();
    if (!recognition) return;
  }

  try {

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {

        stream.getTracks().forEach(t => t.stop());
        recognition.start();

      })
      .catch(() => {

        document.getElementById("voiceFeedback").innerHTML =
          "❌ Cannot access microphone.";

      });

  } catch (e) {

    document.getElementById("voiceFeedback").innerHTML =
      "Error starting voice recognition.";
  }
}

// =========================
// STOP
// =========================
function stopListening() {

  isListening = false;

  const btn = document.getElementById("voiceBtn");

  btn.classList.remove("listening");
  btn.innerHTML = "🎙️ Activate Voice Command";

  document.getElementById("voiceStatus").innerHTML = "🔵 Idle";

  if (recognition) {
    try {
      recognition.abort();
    } catch (e) {}
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
// FUZZY MATCH
// =========================
function similarity(a, b) {
  let longer = a.length > b.length ? a : b;
  let shorter = a.length > b.length ? b : a;

  let costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer[i - 1] !== shorter[j - 1]) {
            newValue = Math.min(
              Math.min(newValue, lastValue),
              costs[j]
            ) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longer.length - costs[shorter.length]) / longer.length;
}

// =========================
// COMMAND PROCESSOR
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
  // CALL POLICE (FIXED PRIORITY)
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
  // UNIVERSAL SOS
  // =========================
  if (cmd.includes("universal") ||
     cmd.includes("url") ) {
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

  // =========================
  // UNKNOWN
  // =========================
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