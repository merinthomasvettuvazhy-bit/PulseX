// =========================
// SET SAFETY MODE
// =========================
function setMode(selectedMode) {

  mode = selectedMode;

  document.getElementById("roleScreen").style.display = "none";

  const app = document.getElementById("app");
  app.style.display = "block";
  app.style.opacity = "0";
  
  setTimeout(() => {
  app.style.opacity = "1";
}, 50);

  getLocation();

  let title = "";
  let buttonsHTML = "";

  if (mode === "child") {

    title = "👧 Child Safety Mode";

    buttonsHTML = `
      <button class="btn-child" onclick="callNumber('1098')">
        Child Helpline - 1098
      </button>

      <button class="btn-child" onclick="callNumber('112')">
        Emergency - 112
      </button>
    `;
  }

  else if (mode === "women") {

    title = "👩 Women Safety Mode";

    buttonsHTML = `
      <button class="btn-women" onclick="callNumber('1091')">
        Women Helpline - 1091
      </button>

      <button class="btn-women" onclick="callNumber('112')">
        Emergency - 112
      </button>
    `;
  }

  else if (mode === "accident") {

    title = "🚑 Accident Emergency Mode";

    buttonsHTML = `
      <button class="btn-accident" onclick="callNumber('108')">
        Ambulance - 108
      </button>

      <button class="btn-accident" onclick="callNumber('112')">
        Emergency - 112
      </button>
    `;
  }

  document.getElementById("modeTitle").innerHTML = title;

  document.getElementById("emergencyButtons").innerHTML =
    buttonsHTML;
}
window.setMode = setMode;