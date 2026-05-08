
console.log("voice.js loaded");

function safeGet(id) {
  return document.getElementById(id);
}

function initVoiceRecognition() {

  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {

    const fb = safeGet("voiceFeedback");
    if (fb) fb.innerHTML = "❌ Voice recognition not supported.";

    const btn = safeGet("voiceBtn");
    if (btn) btn.disabled = true;

    return null;
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  const recog = new SpeechRecognition();

  recog.continuous = false;
  recog.interimResults = false;
  recog.lang = "en-US";

  recog.onstart = () => {

    isListening = true;

    const btn = safeGet("voiceBtn");
    if (btn) {
      btn.classList.add("listening");
      btn.innerHTML = "🎙️ Listening...";
    }

    const vs = safeGet("voiceStatus");
    if (vs) vs.innerHTML = "🔴 Listening";

    const hint = safeGet("permissionHint");
    if (hint) hint.style.display = "none";
  };

  recog.onerror = (event) => {

    let errorMessage = "⚠️ Could not recognize speech.";

    if (event.error === "not-allowed") {
      errorMessage = "❌ Microphone access denied.";
    } else if (event.error === "no-speech") {
      errorMessage = "🎤 No speech detected.";
    }

    const fb = safeGet("voiceFeedback");
    if (fb) fb.innerHTML = errorMessage;

    stopListening();
  };

  recog.onresult = (event) => {

    if (!event.results || event.results.length === 0) return;

    const command =
      event.results[0][0].transcript.toLowerCase().trim();

    const resultDiv = safeGet("voiceCommandResult");

    if (resultDiv) {
      resultDiv.style.display = "block";
      resultDiv.innerHTML = `🗣️ You said: "${command}"`;
    }

    const fb = safeGet("voiceFeedback");
    if (fb) fb.innerHTML = `✅ Recognized: "${command}"`;

    processCommand(command);

    stopListening();
  };

  recog.onend = () => {
    if (isListening) stopListening();
  };

  return recog;
}

function startVoiceRecognition() {

  if (!recognition) {
    recognition = initVoiceRecognition();
    if (!recognition) return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      stream.getTracks().forEach(t => t.stop());
      recognition.start();
    })
    .catch(() => {
      const fb = safeGet("voiceFeedback");
      if (fb) fb.innerHTML = "❌ Cannot access microphone.";
    });
}

function stopListening() {

  isListening = false;

  const btn = safeGet("voiceBtn");
  if (btn) {
    btn.classList.remove("listening");
    btn.innerHTML = "🎙️ Activate Voice Command";
  }

  const vs = safeGet("voiceStatus");
  if (vs) vs.innerHTML = "🔵 Idle";

  if (recognition) {
    try { recognition.abort(); } catch (e) {}
  }
}

function processCommand(command) {

  console.log("Detected:", command);

  if (!mode) {
    speakText("Please select safety mode first.");
    return;
  }

  const cmd = command.toLowerCase().trim();

  // SOS trigger
  if (
    cmd.includes("sos") ||
    cmd.includes("emergency") ||
    cmd === "help me"
  ) {
    callSOS();
    speakText("SOS activated.");
    return;
  }

  // Police
  if (cmd.includes("police") && !cmd.includes("call")) {
    findPolice();
    speakText("Searching for police stations.");
    return;
  }

  // Location sharing
  if (
    cmd.includes("share location") ||
    cmd.includes("send location")
  ) {
    shareLocation();
    speakText("Sharing your location.");
    return;
  }

  // Universal SOS
  if (cmd.includes("universal")) {
    shareUniversalSOS();
    speakText("Sharing universal SOS.");
    return;
  }

  /* ✅ NEW: Emergency contacts support */
  if (cmd.includes("emergency contact") || cmd.includes("contacts")) {
    openEmergencyContacts();   // <-- must exist in your UI JS
    speakText("Opening emergency contacts.");
    return;
  }

  /* ✅ NEW: Call specific contact */
  if (cmd.includes("call")) {

    const name = cmd.replace("call", "").trim();

    if (name.length === 0) {
      speakText("Please say a contact name.");
      return;
    }

    const contact = emergencyContacts.find(c =>
      c.name.toLowerCase().includes(name)
    );

    if (contact) {
      window.location.href = `tel:${contact.number}`;
      speakText(`Calling ${contact.name}`);
    } else {
      speakText("Contact not found.");
    }

    return;
  }

  speakText("Command not recognized.");
}

function speakText(message) {

  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}