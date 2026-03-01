(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var widgetId = script.getAttribute("data-widget-id") || script.getAttribute("data-api-key");
  var apiUrl = script.getAttribute("data-api-url") || (script.src ? script.src.replace(/\/widget\/script\.js.*$/, "") : "");
  if (!widgetId || !apiUrl) return;

  var MAX_ACTIVITY = 15;
  var MAX_ERRORS = 3;
  var userActivity = [];
  var capturedErrors = [];
  var lastErrorForReport = null;

  function trackActivity(type, data) {
    userActivity.push({ type: type, ts: new Date().toISOString(), url: window.location.href, data: data });
    if (userActivity.length > MAX_ACTIVITY) userActivity.shift();
  }

  function captureError(payload) {
    capturedErrors.push(payload);
    if (capturedErrors.length > MAX_ERRORS) capturedErrors.shift();
    lastErrorForReport = payload;
    showErrorWarning();
  }

  window.addEventListener("error", function (e) {
    captureError({
      type: "error",
      message: e.message,
      source: e.filename || null,
      line: e.lineno,
      col: e.colno,
      stack: e.error && e.error.stack ? e.error.stack : null,
      ts: new Date().toISOString(),
    });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var reason = e.reason;
    var msg = reason && (typeof reason === "string" ? reason : reason.message);
    var stack = reason && reason.stack;
    captureError({
      type: "unhandledrejection",
      message: msg || String(reason),
      stack: stack || null,
      ts: new Date().toISOString(),
    });
  });

  document.addEventListener(
    "click",
    function (e) {
      if (!e.target || e.target.id === "bt-btn" || e.target.closest && e.target.closest("#bt-root")) return;
      var el = e.target;
      var data = { tag: el.tagName };
      if (el.id) data.id = el.id;
      if (el.className && typeof el.className === "string") data.className = el.className.split(/\s+/).slice(0, 3).join(" ");
      trackActivity("click", data);
    },
    true
  );
  var lastUrl = window.location.href;
  if (window.MutationObserver) {
    var obs = new MutationObserver(function () {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        trackActivity("navigation", { to: lastUrl });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener("popstate", function () {
    trackActivity("navigation", { to: window.location.href });
  });
  var _pushState = history.pushState;
  var _replaceState = history.replaceState;
  if (_pushState) {
    history.pushState = function () {
      _pushState.apply(this, arguments);
      trackActivity("navigation", { to: window.location.href });
    };
  }
  if (_replaceState) {
    history.replaceState = function () {
      _replaceState.apply(this, arguments);
      trackActivity("navigation", { to: window.location.href });
    };
  }

  var style = document.createElement("style");
  style.textContent =
    "#bt-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:system-ui,-apple-system,sans-serif;}" +
    "#bt-root.has-error #bt-btn{background:#b91c1c;}" +
    "#bt-root.has-error #bt-btn::after{content:'';position:absolute;top:4px;right:4px;width:10px;height:10px;background:#fef2f2;border-radius:50%;animation:bt-pulse 1.5s ease-in-out infinite;}" +
    "@keyframes bt-pulse{0%,100%{opacity:1}50%{opacity:.6}}" +
    "#bt-btn{position:relative;width:56px;height:56px;border-radius:50%;background:#0f172a;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .2s;}" +
    "#bt-btn:hover{transform:scale(1.05);}" +
    "#bt-btn svg{width:24px;height:24px;}" +
    "#bt-toast{position:absolute;bottom:64px;right:0;background:#b91c1c;color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;max-width:220px;box-shadow:0 4px 12px rgba(0,0,0,.25);display:none;cursor:pointer;}" +
    "#bt-toast.visible{display:block;}" +
    "#bt-toast:hover{background:#991b1b;}" +
    "#bt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;}" +
    "#bt-modal{background:#fff;border-radius:12px;max-width:440px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2);}" +
    "#bt-modal h2{margin:0 0 16px;font-size:18px;font-weight:600;padding:20px 20px 0;}" +
    "#bt-form{padding:0 20px 20px;}" +
    "#bt-form label{display:block;margin-bottom:4px;font-size:13px;font-weight:500;color:#374151;}" +
    "#bt-form input,#bt-form textarea{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:12px;box-sizing:border-box;}" +
    "#bt-form input[type=file]{padding:8px;}" +
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
    '<div id="bt-toast" role="button" tabindex="0" aria-label="An error occurred - click to report">An error occurred on this page. Report it?</div>' +
    '<button type="button" id="bt-btn" aria-label="Report a bug">' +
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
    "</button>";
  document.body.appendChild(root);

  var toastEl = root.querySelector("#bt-toast");
  function showErrorWarning() {
    root.classList.add("has-error");
    toastEl.classList.add("visible");
  }
  function hideErrorWarning() {
    root.classList.remove("has-error");
    toastEl.classList.remove("visible");
  }
  toastEl.addEventListener("click", function () {
    openModal(true);
  });
  toastEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(true);
    }
  });

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
    '<label for="bt-email">Email</label>' +
    '<input type="email" id="bt-email" name="email" placeholder="you@example.com" required>' +
    '<label for="bt-media">Screenshot or short video (optional)</label>' +
    '<input type="file" id="bt-media" name="media" accept="image/*,video/*" capture="environment">' +
    '<div id="bt-media-preview" style="display:none;margin-top:8px;font-size:12px;color:#6b7280;"></div>' +
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

  function openModal(fromError) {
    overlay.style.display = "flex";
    if (fromError && lastErrorForReport) {
      var titleInput = overlay.querySelector("#bt-title");
      var descInput = overlay.querySelector("#bt-desc");
      titleInput.value = "Page error: " + (lastErrorForReport.message || "Unknown").substring(0, 180);
      var desc = "An error was detected on this page.\n\nError: " + (lastErrorForReport.message || "Unknown");
      if (lastErrorForReport.stack) desc += "\n\nStack:\n" + lastErrorForReport.stack;
      descInput.value = desc.substring(0, 5000);
    }
  }
  function closeModal() {
    overlay.style.display = "none";
  }

  root.querySelector("#bt-btn").addEventListener("click", function () {
    openModal(false);
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector("#bt-cancel").addEventListener("click", closeModal);

  var mediaInput = overlay.querySelector("#bt-media");
  var mediaPreview = overlay.querySelector("#bt-media-preview");
  mediaInput.addEventListener("change", function () {
    var file = mediaInput.files && mediaInput.files[0];
    if (file) {
      mediaPreview.style.display = "block";
      mediaPreview.textContent = file.name + " (" + (file.size / 1024).toFixed(1) + " KB)";
    } else {
      mediaPreview.style.display = "none";
      mediaPreview.textContent = "";
    }
  });

  overlay.querySelector("#bt-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var msgEl = overlay.querySelector("#bt-msg");
    var submitBtn = overlay.querySelector("#bt-submit");
    var title = document.getElementById("bt-title").value.trim();
    var description = document.getElementById("bt-desc").value.trim();
    var email = document.getElementById("bt-email").value.trim();
    var file = mediaInput.files && mediaInput.files[0];

    if (description.length < 10) {
      showMsg(msgEl, "error", "Description must be at least 10 characters.");
      return;
    }
    if (!email) {
      showMsg(msgEl, "error", "Email is required.");
      return;
    }

    submitBtn.disabled = true;
    msgEl.style.display = "none";

    var extra = { timestamp: new Date().toISOString() };
    if (userActivity.length) extra.userActivity = userActivity.slice(-MAX_ACTIVITY);
    if (capturedErrors.length) extra.capturedErrors = capturedErrors.slice();

    var doSubmit = function (body, contentType) {
      return fetch(apiUrl + "/bug-report", {
        method: "POST",
        headers: contentType ? {} : { "Content-Type": "application/json" },
        body: body,
      });
    };

    var req;
    if (file) {
      var formData = new FormData();
      formData.append("widgetId", widgetId);
      formData.append("title", title || "Bug report");
      formData.append("description", description);
      formData.append("email", email);
      formData.append("pageUrl", window.location.href);
      formData.append("userAgent", navigator.userAgent);
      formData.append("extraData", JSON.stringify(extra));
      formData.append("media", file);
      req = doSubmit(formData, "multipart");
    } else {
      req = doSubmit(
        JSON.stringify({
          widgetId: widgetId,
          title: title || "Bug report",
          description: description,
          email: email,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          extraData: extra,
        }),
        false
      );
    }

    req
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
        mediaInput.value = "";
        mediaPreview.style.display = "none";
        mediaPreview.textContent = "";
        if (lastErrorForReport) {
          lastErrorForReport = null;
          capturedErrors = [];
          hideErrorWarning();
        }
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
