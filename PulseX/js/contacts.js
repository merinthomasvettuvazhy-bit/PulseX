// =========================
// LOAD CONTACTS
// =========================
function loadContacts() {

  const saved = localStorage.getItem(
    "pulsex_emergency_contacts"
  );

  // Start with default contacts
  emergencyContacts = [...defaultContacts];

  if (saved) {

    try {

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {

        // Only add custom contacts
        parsed.forEach(contact => {

          const alreadyExists =
            emergencyContacts.some(
              c => c.number === contact.number
            );

          if (!alreadyExists) {
            emergencyContacts.push(contact);
          }

        });

      }

    } catch (e) {

      console.log("Error loading contacts");

    }
  }

  renderContactsList();
}

// =========================
// SAVE CONTACTS
// =========================
function saveContactsToStorage() {

  const customContacts =
    emergencyContacts.filter(
      c =>
        !defaultContacts.some(
          d => d.id === c.id
        )
    );

  localStorage.setItem(
    "raksha_emergency_contacts",
    JSON.stringify(customContacts)
  );
}

// =========================
// RENDER CONTACTS
// =========================
function renderContactsList() {

  const container =
    document.getElementById("contactsList");

  if (!container) return;

  let html = "";

  emergencyContacts.forEach((contact) => {

    const isDefault =
      defaultContacts.some(
        d => d.id === contact.id
      );

    html += `

      <div class="custom-contact-card">

        <div class="custom-contact-name">
          👤 ${escapeHtml(contact.name)}
        </div>

        <div class="custom-contact-number">
          📞 ${escapeHtml(contact.number)}
        </div>

        <div class="contact-buttons">

          <button
            class="btn-custom"
            onclick="callContact('${contact.id}')"
          >
            📞 Call Now
          </button>

          ${
            !isDefault
            ? `
            <button
              class="small-btn delete-contact"
              onclick="deleteContact('${contact.id}')"
              style="
                background:red;
                color:white;
                margin-top:10px;
              "
            >
              🗑️ Remove
            </button>
            `
            : ""
          }

        </div>

      </div>

    `;
  });

  // ADD CONTACT BUTTON
  html += `

    <div style="
      text-align:center;
      margin-top:20px;
    ">

      <button
        onclick="showAddContactForm()"
        style="
          background:#00c853;
          color:white;
          border:none;
          padding:14px 24px;
          border-radius:30px;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          width:90%;
          max-width:320px;
        "
      >
        ➕ Add New Contact
      </button>

    </div>

  `;

  container.innerHTML = html;
}

// =========================
// ESCAPE HTML
// =========================
function escapeHtml(str) {

  if (!str) return "";

  return str.replace(/[&<>]/g, function(m) {

    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";

    return m;
  });
}

// =========================
// CALL CONTACT
// =========================
function callContact(contactId) {

  const contact =
    emergencyContacts.find(
      c => c.id === contactId
    );

  if (!contact) {

    alert("Contact not found");

    return;
  }

  let cleanNumber =
    contact.number.replace(/[^\d+]/g, "");

  if (
    cleanNumber.length === 10 &&
    !cleanNumber.startsWith("+91")
  ) {

    cleanNumber = "+91" + cleanNumber;
  }

  window.location.href = `tel:${cleanNumber}`;
}

// =========================
// DELETE CONTACT
// =========================
function deleteContact(contactId) {

  const confirmDelete = confirm(
    "Remove this emergency contact?"
  );

  if (!confirmDelete) return;

  emergencyContacts =
    emergencyContacts.filter(
      c => c.id !== contactId
    );

  saveContactsToStorage();

  renderContactsList();
}

// =========================
// SHOW ADD CONTACT FORM
// =========================
function showAddContactForm() {

  document.getElementById(
    "addContactPanel"
  ).style.display = "block";

  document.getElementById(
    "newContactName"
  ).value = "";

  document.getElementById(
    "newContactNumber"
  ).value = "";
}

// =========================
// HIDE ADD CONTACT FORM
// =========================
function hideAddContactForm() {

  document.getElementById(
    "addContactPanel"
  ).style.display = "none";
}

// =========================
// ADD NEW CONTACT
// =========================
function addNewContact() {

  const name =
    document.getElementById(
      "newContactName"
    ).value.trim();

  const number =
    document.getElementById(
      "newContactNumber"
    ).value.trim();

  if (!name || !number) {

    alert(
      "Please enter both name and number"
    );

    return;
  }

  if (!/^[\d\s()+-]+$/.test(number)) {

    alert("Enter valid phone number");

    return;
  }

  const newId =
    "contact_" + Date.now();

  emergencyContacts.push({

    id: newId,
    name: name,
    number: number

  });

  saveContactsToStorage();

  renderContactsList();

  hideAddContactForm();

  const feedback =
    document.getElementById(
      "voiceFeedback"
    );

  if (feedback) {

    feedback.innerHTML =
      `✅ ${escapeHtml(name)} added`;

  }

}