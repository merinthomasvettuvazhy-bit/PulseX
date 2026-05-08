function callNumber(num) {
  window.location.href = `tel:${num}`;
}

async function callSOS() {

  if (sosActive) return;

  sosActive = true;

  let emergencyNumber = "112";

  if (mode === "child") emergencyNumber = "1098";
  if (mode === "women") emergencyNumber = "1091";
  if (mode === "accident") emergencyNumber = "108";

  // Phone vibration
  if (navigator.vibrate) {
    navigator.vibrate([600, 300, 600, 300, 600]);
  }

  // Show SOS screen
  document.getElementById("sosScreen").style.display = "flex";

  // Alarm sound
  sosAudio = new Audio("./assets/alarm.mp3");

  sosAudio.loop = true;

  sosAudio.play().catch(() => {});

  // Send SOS to backend
  if (userLat && userLng) {

    try {

      const payload = {
        mode: mode || "unknown",
        latitude: userLat,
        longitude: userLng,
        timestamp: new Date().toISOString()
      };

      await fetch("http://127.0.0.1:5000/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("✅ SOS sent to backend");

    } catch (error) {

      console.warn("⚠️ Backend not reachable", error);

    }
  }

  // Auto call after delay
  sosTimeout = setTimeout(() => {

    window.location.href = `tel:${emergencyNumber}`;

  }, 1800);
}

function cancelSOS() {

  console.log("Cancel clicked");

  sosActive = false;

  clearTimeout(sosTimeout);

  // Stop alarm
  if (sosAudio) {

    sosAudio.pause();

    sosAudio.currentTime = 0;

    sosAudio = null;
  }

  // Stop vibration
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }

  // Hide SOS screen
  document.getElementById("sosScreen").style.display = "none";
}

function shareUniversalSOS() {

  let link = window.location.href + "?sos=active";

  let msg = `
🚨 SOS ALERT 🚨
I need immediate help!

${link}
  `;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(msg)}`
  );
}
window.callSOS = callSOS;
window.cancelSOS = cancelSOS;
window.callNumber = callNumber;
window.shareUniversalSOS = shareUniversalSOS;