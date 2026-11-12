(function () {
  var loginView = document.getElementById("login-view");
  var inboxView = document.getElementById("inbox-view");
  var loginForm = document.getElementById("login-form");
  var loginStatus = document.getElementById("login-status");
  var inboxStatus = document.getElementById("inbox-status");
  var meta = document.getElementById("inbox-meta");
  var list = document.getElementById("message-list");
  var empty = document.getElementById("empty");
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function show(view) {
    loginView.hidden = view !== "login";
    inboxView.hidden = view !== "inbox";
    if (view === "login") document.getElementById("password").focus();
  }

  function request(method, body) {
    var options = { method: method, credentials: "same-origin", headers: {} };
    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    return options;
  }

  function api(path, method, body) {
    return fetch(path, request(method, body));
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, handler) {
    var node = el("button", "btn btn--ghost", label);
    node.type = "button";
    node.addEventListener("click", handler);
    return node;
  }

  function render(data) {
    list.textContent = "";
    var messages = data.messages;
    empty.hidden = messages.length > 0;
    meta.textContent = data.total + " total · " + data.unread + " unread";

    messages.forEach(function (message) {
      var item = el("li", "message glass" + (message.read ? "" : " is-unread"));
      var head = el("div", "message__head");
      head.appendChild(el("span", "message__name", message.name));
      head.appendChild(el("time", "message__time", new Date(message.createdAt).toLocaleString()));
      item.appendChild(head);

      if (EMAIL.test(message.email)) {
        var mail = el("a", "message__email", message.email);
        mail.href = "mailto:" + message.email;
        item.appendChild(mail);
      } else {
        item.appendChild(el("span", "message__email", message.email));
      }

      item.appendChild(el("p", "message__text", message.message));

      var actions = el("div", "message__actions");
      actions.appendChild(button(message.read ? "Mark unread" : "Mark read", function () {
        api("/api/messages", "PATCH", { id: message.id, read: !message.read }).then(load);
      }));
      actions.appendChild(button("Delete", function () {
        if (!window.confirm("Delete this message?")) return;
        api("/api/messages", "DELETE", { id: message.id }).then(load);
      }));
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  function load() {
    inboxStatus.textContent = "";
    return api("/api/messages", "GET")
      .then(function (response) {
        if (response.status === 401) {
          show("login");
          return null;
        }
        if (!response.ok) throw new Error("failed");
        return response.json();
      })
      .then(function (data) {
        if (!data) return;
        show("inbox");
        render(data);
      })
      .catch(function () {
        show("inbox");
        inboxStatus.textContent = "Could not load messages.";
      });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var input = loginForm.elements.password;
    var submit = loginForm.querySelector("button[type=submit]");
    if (!input.value) return;
    submit.disabled = true;
    loginStatus.textContent = "";

    api("/api/login", "POST", { password: input.value })
      .then(function (response) {
        if (response.ok) {
          input.value = "";
          return load();
        }
        if (response.status === 429) loginStatus.textContent = "Too many attempts. Try again later.";
        else if (response.status === 401) loginStatus.textContent = "Wrong password.";
        else loginStatus.textContent = "Server error.";
      })
      .catch(function () { loginStatus.textContent = "Network error."; })
      .then(function () { submit.disabled = false; });
  });

  document.getElementById("refresh").addEventListener("click", load);
  document.getElementById("logout").addEventListener("click", function () {
    api("/api/logout", "POST").then(function () { show("login"); });
  });

  load();
})();
