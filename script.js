let names = [];
let restrictions = [];

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


const list = document.getElementById("list");
const restrictionsList = document.getElementById("restrictions");


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


document.getElementById("addRestrictBtn").onclick = () => {
  const r1 = document.getElementById("r1").value;
  const r2 = document.getElementById("r2").value;
  if (r1 && r2 && r1 !== r2) {
    restrictions.push([r1, r2]);
    const li = document.createElement("li");
    li.textContent = `${r1} ❌ ${r2}`;
    restrictionsList.appendChild(li);
  }
};


document.getElementById("drawBtn").onclick = () => {
  const result = doDraw();
  if (!result) {
    alert("Kunde inte hitta en giltig dragning. Försök igen!");
    return;
  }


  let html = "<h3>Länkar (kopiera & skicka):</h3><ul>";
  Object.keys(result).forEach(giver => {

    const key = Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem("santa_" + key, result[giver]); 
    const link = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(giver)}&k=${key}`;
    html += `<li>${giver}: <a href="${link}" target="_blank">${link}</a></li>`;
  });
  html += "</ul>";
  document.getElementById("output").innerHTML = html;
};


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
      if (restrictions.some(([a, b]) =>
        (a === g && b === r) || (b === g && a === r)
      )) { ok = false; break; }
    }

    if (ok) {
      givers.forEach((g, i) => pairs[g] = receivers[i]);
      return pairs;
    }
  }
  return null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


const q = new URLSearchParams(window.location.search);
if (q.has("u") && q.has("k")) {
  document.body.innerHTML = "";
  const receiver = sessionStorage.getItem("santa_" + q.get("k"));
  if (receiver) showCard(q.get("u"), receiver);
  else document.body.textContent = "Fel länk eller session utgången.";
}

function showCard(giver, receiver) {
  const art = `
+-----------------------+
| 🎄  Hemlig Tomte  🎄   |
+-----------------------+
|  ${giver}, du ska ge present till :  |
|                                     |
|     🎁   ${receiver}!  🎁    |
|                                     |
|   God Jul! 🎅                        |
+-----------------------+`;
  const div = document.createElement("div");
  div.className = "ascii-card";
  div.textContent = art;
  document.body.appendChild(div);
}
