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

  if (!mode) {

    speakText(
      "Please select safety mode first."
    );

    return;
  }

  const cmd =
    command.toLowerCase();

  // CALL CONTACT
  for (let contact of emergencyContacts) {

    const contactNameLower =
      contact.name.toLowerCase();

    if (
      cmd.includes("call") &&
      cmd.includes(contactNameLower)
    ) {

      speakText(
        `Calling ${contact.name}`
      );

      setTimeout(() => {

        let cleanNumber =
          contact.number.replace(
            /[\s\-\(\)]/g,
            ""
          );

        if (
          cleanNumber.length === 10
        ) {

          cleanNumber =
            "+91" + cleanNumber;
        }

        window.location.href =
          `tel:${cleanNumber}`;

      }, 300);

      return;
    }
  }

  // SOS
  if (
    cmd.includes("sos") ||
    cmd.includes("emergency") ||
    cmd === "help"
  ) {

    callSOS();

    speakText(
      "SOS activated."
    );
  }

  // HELPLINE
  else if (
    cmd.includes("helpline")
  ) {

    let number = "112";

    if (mode === "child")
      number = "1098";

    else if (mode === "women")
      number = "1091";

    else if (mode === "accident")
      number = "108";

    speakText(
      `Calling helpline ${number}`
    );

    setTimeout(() => {

      window.location.href =
        `tel:${number}`;

    }, 500);
  }

  // POLICE
  else if (
    cmd.includes("police")
  ) {

    findPolice();

    speakText(
      "Searching for police stations."
    );
  }

  // SHARE LOCATION
  else if (
    cmd.includes("location")
  ) {

    shareLocation();

    speakText(
      "Sharing your location."
    );
  }

  // UNIVERSAL SOS
  else if (
    cmd.includes("universal")
  ) {

    shareUniversalSOS();

    speakText(
      "Sharing universal SOS."
    );
  }

  else {

    speakText(
      "Command not recognized."
    );
  }
  console.log("Detected command:", command);
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