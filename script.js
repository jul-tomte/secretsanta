// --- Data ---
let names = [];
let restrictions = [];

const list = document.getElementById("list");
const restrictionsList = document.getElementById("restrictions");

// Update dropdowns
function refreshSelects() {
  const selects = [document.getElementById("r1"), document.getElementById("r2")];
  selects.forEach(sel => {
    sel.innerHTML = "<option value=''>--</option>";
    names.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      sel.appendChild(opt);
    });
  });
}

// --- Add name ---
document.getElementById("addBtn").onclick = () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!name || names.includes(name)) return;
  names.push(name);
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
  document.getElementById("nameInput").value = "";
  refreshSelects();
};

// --- Add restriction ---
document.getElementById("addRestrictBtn").onclick = () => {
  const a = document.getElementById("r1").value;
  const b = document.getElementById("r2").value;
  if (a && b && a !== b) {
    restrictions.push([a, b]);
    const li = document.createElement("li");
    li.textContent = `${a} ❌ ${b}`;
    restrictionsList.appendChild(li);
  }
};

// --- Shuffle helper ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Draw algorithm ---
function doDraw() {
  const givers = [...names];
  let receivers = [...names];
  const pairs = {};
  for (let attempt = 0; attempt < 1000; attempt++) {
    receivers = shuffle(receivers);
    let ok = true;
    for (let i = 0; i < givers.length; i++) {
      const g = givers[i];
      const r = receivers[i];
      if (g === r) { ok = false; break; }
      if (restrictions.some(([x, y]) =>
        (x === g && y === r) || (y === g && x === r)
      )) { ok = false; break; }
    }
    if (ok) {
      givers.forEach((g, i) => pairs[g] = receivers[i]);
      return pairs;
    }
  }
  return null;
}

// --- Create short code for receiver ---
function encode(name) {
  // Simple reversible base36 encoding
  return btoa(unescape(encodeURIComponent(name)))
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function decode(code) {
  try {
    return decodeURIComponent(escape(atob(code.replace(/-/g, '+').replace(/_/g, '/'))));
  } catch { return null; }
}

// --- When clicked "Dra namn!" ---
document.getElementById("drawBtn").onclick = () => {
  const result = doDraw();
  if (!result) {
    alert("Ingen giltig dragning hittades. Försök igen!");
    return;
  }

  let html = "<h3>Länkar (kopiera och skicka):</h3><ul>";
  Object.entries(result).forEach(([giver, receiver]) => {
    const link = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(giver)}&r=${encode(receiver)}`;
    html += `<li>${giver}: <a href="${link}" target="_blank">${link}</a></li>`;
  });
  html += "</ul>";
  document.getElementById("output").innerHTML = html;
};

// --- Check if this is a personal link view ---
const params = new URLSearchParams(window.location.search);
if (params.has("u") && params.has("r")) {
  document.body.innerHTML = "";
  const giver = params.get("u");
  const receiver = decode(params.get("r"));
  if (receiver) showCard(giver, receiver);
  else document.body.textContent = "Fel länk.";
}

function showCard(giver, receiver) {
  const card = `
┌──────────────────────────────┐
│   🎄  Hemlig Tomte  🎄       │
│──────────────────────────────│
   Hej ${giver}!               
                              
  Du ska ge en gåva till:     
                              
        ${receiver}           
                              
        God Jul!              
└──────────────────────────────┘`;
  const div = document.createElement("div");
  div.className = "ascii-card";
  div.textContent = card;
  document.body.appendChild(div);
}
