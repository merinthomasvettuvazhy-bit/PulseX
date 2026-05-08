console.log("voice.js loaded");
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
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  const recog = new SpeechRecognition();

  recog.continuous = false;
  recog.interimResults = false;
  recog.lang = "en-US";

  recog.onstart = () => {

    isListening = true;

    document
      .getElementById("voiceBtn")
      .classList.add("listening");

    document.getElementById("voiceBtn").innerHTML =
      "🎙️ Listening...";

    document.getElementById("voiceStatus").innerHTML =
      "🔴 Listening";

    document.getElementById("permissionHint").style.display =
      "none";
  };

  recog.onerror = (event) => {

    let errorMessage = "";

    switch (event.error) {

      case "not-allowed":
        errorMessage =
          "❌ Microphone access denied.";
        break;

      case "no-speech":
        errorMessage =
          "🎤 No speech detected.";
        break;

      default:
        errorMessage =
          "⚠️ Could not recognize speech.";
    }

    document.getElementById("voiceFeedback").innerHTML =
      errorMessage;

    stopListening();
  };

  recog.onend = () => {

    if (isListening) stopListening();

  };

  recog.onresult = (event) => {

    if (
      !event.results ||
      event.results.length === 0
    ) return;

    const command =
      event.results[0][0].transcript
        .toLowerCase()
        .trim();

    const resultDiv =
      document.getElementById(
        "voiceCommandResult"
      );

    resultDiv.style.display = "block";

    resultDiv.innerHTML =
      `🗣️ You said: "${command}"`;

    document.getElementById(
      "voiceFeedback"
    ).innerHTML =
      `✅ Recognized: "${command}"`;

    processCommand(command);

    stopListening();
  };

  return recog;
}

function startVoiceRecognition() {

  if (!recognition) {

    recognition = initVoiceRecognition();

    if (!recognition) return;
  }

  try {

    navigator.mediaDevices
      .getUserMedia({ audio: true })

      .then(function(stream) {

        stream.getTracks().forEach(track =>
          track.stop()
        );

        recognition.start();

      })

      .catch(function() {

        document.getElementById(
          "voiceFeedback"
        ).innerHTML =
          "❌ Cannot access microphone.";

      });

  } catch (e) {

    document.getElementById(
      "voiceFeedback"
    ).innerHTML =
      "Error starting voice recognition.";
  }
}

function stopListening() {

  isListening = false;

  const btn =
    document.getElementById("voiceBtn");

  btn.classList.remove("listening");

  btn.innerHTML =
    "🎙️ Activate Voice Command";

  document.getElementById(
    "voiceStatus"
  ).innerHTML =
    "🔵 Idle";

  if (recognition) {

    try {

      recognition.abort();

    } catch (e) {}
  }
}

function processCommand(command) {

  console.log("Detected command:", command);

  if (!mode) {

    speakText(
      "Please select safety mode first."
    );

    return;
  }

  const cmd =
    command.toLowerCase().trim();

  // =========================
  // SOS
  // =========================
  if (
    cmd.includes("sos") ||
    cmd.includes("emergency") ||
    cmd.includes("help")
  ) {

    callSOS();

    speakText("SOS activated.");

    return;
  }

  // =========================
  // FIND POLICE
  // =========================
  if (
    cmd.includes("police") &&
    !cmd.includes("call")
  ) {

    findPolice();

    speakText(
      "Searching for police stations."
    );

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

    speakText(
      "Sharing your location."
    );

    return;
  }

  // =========================
  // UNIVERSAL SOS
  // =========================
  if (
    cmd.includes("universal")
  ) {

    shareUniversalSOS();

    speakText(
      "Sharing universal SOS."
    );

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

    if (
      mode === "child" ||
      cmd.includes("child")
    ) {

      number = "1098";
      label = "Child Helpline";
    }

    else if (
      mode === "women" ||
      cmd.includes("women")
    ) {

      number = "1091";
      label = "Women Helpline";
    }

    else if (
      mode === "accident" ||
      cmd.includes("ambulance")
    ) {

      number = "108";
      label = "Ambulance";
    }

    speakText(`Calling ${label}`);

    setTimeout(() => {

      window.location.href =
        `tel:${number}`;

    }, 500);

    return;
  }

  // =========================
  // CUSTOM CONTACTS
  // =========================
  // =========================
// CUSTOM CONTACTS
// =========================
if (cmd.includes("call")) {

  for (let contact of emergencyContacts) {

    const contactName =
      contact.name.toLowerCase().trim();

    // FULL NAME MATCH
    if (cmd.includes(contactName)) {

      speakText(
        `Calling ${contact.name}`
      );

      setTimeout(() => {

        callContact(contact.id);

      }, 500);

      return;
    }

    // SINGLE WORD MATCH
    const words =
      contactName.split(" ");

    for (let word of words) {

      if (
        word.length > 2 &&
        cmd.includes(word)
      ) {

        speakText(
          `Calling ${contact.name}`
        );

        setTimeout(() => {

          callContact(contact.id);

        }, 500);

        return;
      }
    }
  }
}

  // =========================
  // UNKNOWN
  // =========================
  speakText(
    "Command not recognized."
  );
}

function speakText(message) {

  if (!window.speechSynthesis)
    return;

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      message
    );

  utterance.lang = "en-US";

  utterance.rate = 0.9;

  window.speechSynthesis.speak(
    utterance
  );
}