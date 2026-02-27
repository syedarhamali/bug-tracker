(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var widgetId = script.getAttribute("data-widget-id") || script.getAttribute("data-api-key");
  var apiUrl = script.getAttribute("data-api-url") || (script.src ? script.src.replace(/\/widget\/script\.js.*$/, "") : "");
  if (!widgetId || !apiUrl) return;

  var style = document.createElement("style");
  style.textContent =
    "#bt-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:system-ui,-apple-system,sans-serif;}" +
    "#bt-btn{width:56px;height:56px;border-radius:50%;background:#0f172a;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .2s;}" +
    "#bt-btn:hover{transform:scale(1.05);}" +
    "#bt-btn svg{width:24px;height:24px;}" +
    "#bt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;}" +
    "#bt-modal{background:#fff;border-radius:12px;max-width:440px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2);}" +
    "#bt-modal h2{margin:0 0 16px;font-size:18px;font-weight:600;padding:20px 20px 0;}" +
    "#bt-form{padding:0 20px 20px;}" +
    "#bt-form label{display:block;margin-bottom:4px;font-size:13px;font-weight:500;color:#374151;}" +
    "#bt-form input,#bt-form textarea{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:12px;box-sizing:border-box;}" +
    "#bt-form textarea{min-height:100px;resize:vertical;}" +
    "#bt-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}" +
    "#bt-actions button{padding:10px 18px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;border:none;}" +
    "#bt-cancel{background:#f3f4f6;color:#374151;}" +
    "#bt-submit{background:#0f172a;color:#fff;}" +
    "#bt-submit:disabled{opacity:.6;cursor:not-allowed;}" +
    "#bt-msg{padding:8px 12px;border-radius:8px;margin-bottom:12px;font-size:13px;}" +
    "#bt-msg.success{background:#d1fae5;color:#065f46;}" +
    "#bt-msg.error{background:#fee2e2;color:#991b1b;}";
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "bt-root";
  root.innerHTML =
    '<button type="button" id="bt-btn" aria-label="Report a bug">' +
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
    "</button>";
  document.body.appendChild(root);

  var overlay = document.createElement("div");
  overlay.id = "bt-overlay";
  overlay.style.display = "none";
  overlay.innerHTML =
    '<div id="bt-modal">' +
    "<h2>Report a bug</h2>" +
    '<form id="bt-form">' +
    '<div id="bt-msg" style="display:none;"></div>' +
    '<label for="bt-title">Title</label>' +
    '<input type="text" id="bt-title" name="title" placeholder="Short summary" required maxlength="200">' +
    '<label for="bt-desc">Description</label>' +
    '<textarea id="bt-desc" name="description" placeholder="What happened? Steps to reproduce..." required minlength="10"></textarea>' +
    '<label for="bt-email">Email (optional)</label>' +
    '<input type="email" id="bt-email" name="email" placeholder="you@example.com">' +
    '<div id="bt-actions">' +
    '<button type="button" id="bt-cancel">Cancel</button>' +
    '<button type="submit" id="bt-submit">Submit</button>' +
    "</div>" +
    "</form>" +
    "</div>";
  document.body.appendChild(overlay);

  function showMsg(el, type, text) {
    el.style.display = "block";
    el.className = type === "error" ? "error" : "success";
    el.textContent = text;
  }

  function openModal() {
    overlay.style.display = "flex";
  }
  function closeModal() {
    overlay.style.display = "none";
  }

  root.querySelector("#bt-btn").addEventListener("click", openModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector("#bt-cancel").addEventListener("click", closeModal);

  overlay.querySelector("#bt-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var msgEl = overlay.querySelector("#bt-msg");
    var submitBtn = overlay.querySelector("#bt-submit");
    var title = document.getElementById("bt-title").value.trim();
    var description = document.getElementById("bt-desc").value.trim();
    var email = document.getElementById("bt-email").value.trim();

    if (description.length < 10) {
      showMsg(msgEl, "error", "Description must be at least 10 characters.");
      return;
    }

    submitBtn.disabled = true;
    msgEl.style.display = "none";

    var payload = {
      widgetId: widgetId,
      title: title || "Bug report",
      description: description,
      email: email || undefined,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      extraData: { timestamp: new Date().toISOString() },
    };

    fetch(apiUrl + "/bug-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "Submission failed");
          return data;
        });
      })
      .then(function () {
        showMsg(msgEl, "success", "Thanks! Your report was submitted.");
        document.getElementById("bt-title").value = "";
        document.getElementById("bt-desc").value = "";
        document.getElementById("bt-email").value = "";
        setTimeout(closeModal, 1500);
      })
      .catch(function (err) {
        showMsg(msgEl, "error", err.message || "Something went wrong. Please try again.");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
