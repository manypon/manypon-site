(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var button = form.querySelector("button[type=submit]");
  var label = form.querySelector("[data-submit-label]");
  var status = form.querySelector("[data-status]");

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = "contact-form__status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      website: form.elements.website.value
    };

    button.disabled = true;
    label.textContent = "Sending...";
    setStatus("", "");

    fetch(form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          setStatus("Thanks! Your message has been sent.", "ok");
          return;
        }
        if (response.status === 429) {
          setStatus("Too many messages. Please try again a bit later.", "error");
          return;
        }
        if (response.status === 400) {
          setStatus("Please check the fields and try again.", "error");
          return;
        }
        setStatus("Something went wrong. Please try again later.", "error");
      })
      .catch(function () {
        setStatus("Network error. Please check your connection.", "error");
      })
      .then(function () {
        button.disabled = false;
        label.textContent = "Send message";
      });
  });
})();
