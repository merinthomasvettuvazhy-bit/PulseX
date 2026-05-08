// =========================
// GET USER LOCATION
// =========================
function getLocation() {

  if (navigator.geolocation) {

    document.getElementById('voiceFeedback').innerHTML =
      "📍 Getting your location...";

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;

        document.getElementById('voiceFeedback').innerHTML =
          "✅ Location detected successfully!";

        setTimeout(() => {

          document.getElementById('voiceFeedback').innerHTML =
            "💡 Click the microphone button and say a command";

        }, 2000);
      },

      (err) => {

        console.log("Location error:", err.message);

        document.getElementById('voiceFeedback').innerHTML =
          "⚠️ Please enable location services for police and SOS features";
      }

    );

  }
}

// =========================
// SHARE LIVE LOCATION
// =========================
function shareLocation() {

  if (!userLat || !userLng) {

    alert("Location not available");

    return;
  }

  const mapLink =
    `https://www.google.com/maps/search/?api=1&query=${userLat},${userLng}`;

  let msg = `
🚨 Emergency Alert from PulseX
I need immediate help!

Mode: ${mode.toUpperCase()}

Live Location:
${mapLink}
`;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(msg)}`
  );
}