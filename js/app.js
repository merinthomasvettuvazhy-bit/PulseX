// =========================
// GLOBAL VARIABLES
// =========================

// Current selected safety mode
let mode = "";

// User live location
let userLat = null;
let userLng = null;

// Voice recognition
let recognition = null;
let isListening = false;

// SOS system
let sosTimeout;
let sosAudio;
let sosActive = false;

// =========================
// DEFAULT EMERGENCY CONTACTS
// =========================
let defaultContacts = [

  {
    id: "contact1",
    name: "Police",
    number: "112"
  },

  {
    id: "contact2",
    name: "Women Helpline",
    number: "1091"
  },

  {
    id: "contact3",
    name: "Ambulance",
    number: "108"
  },

  {
    id: "contact4",
    name: "Child Helpline",
    number: "1098"
  }

];

// Stores all contacts
let emergencyContacts = [];

// =========================
// WINDOW LOAD
// =========================
window.onload = () => {

  // Load saved contacts
  loadContacts();

  // Render contacts UI
  renderContactsList();

};