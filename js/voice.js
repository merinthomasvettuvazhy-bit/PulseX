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

  // FIXED: prevent accidental trigger
  if (
    cmd.includes("sos") ||
    cmd.includes("emergency") ||
    cmd.includes("help me") ||
    cmd.includes("help")
  ) {
    callSOS();
    speakText("SOS activated.");
    return;
  }

  // =========================
  // FIND POLICE
  // =========================
  if (cmd.includes("police") ||
      cmd.includes("station") ||
      cmd.includes("police station") ||
      cmd.includes("find station") ||
      cmd.includes("find nearby station") ||
      cmd.includes("find nearby police station") ||
      cmd.includes("find police station")
        && !cmd.includes("call")) {
    findPolice();
    speakText("Searching police stations");
    return;
  }


  if (
    cmd.includes("location") ||
    cmd.includes("live location") ||
    cmd.includes("share location") ||
    cmd.includes("share live location") ||
    cmd.includes("send live location") ||
    cmd.includes("send location")
  ) {
    shareLocation();
    speakText("Sharing your location.");
    return;
  }

  if (
    cmd.includes("universal")  ||
    cmd.includes("send universal") ||
    cmd.includes("share universal") ||
    cmd.includes("universal sos") ||
    cmd.includes("link") ||
    cmd.includes("send link") ||
    cmd.includes("share link") ||
    cmd.includes("send universal sos") ||
    cmd.includes("share universal sos") ||
    cmd.includes("send url") ||
    cmd.includes("share url") ||
     cmd.includes("url")
    ) {
    shareUniversalSOS();
    speakText("Sharing universal SOS.");
    return;
  }

  speakText("Command not recognized.");
}
}

function speakText(message) {

  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}       
