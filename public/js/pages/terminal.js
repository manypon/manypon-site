(function () {
  var target = document.querySelector("[data-typed]");
  var after = document.querySelectorAll("[data-after]");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!target || calm) return;

  var text = target.textContent;
  target.textContent = "";
  after.forEach(function (el) { el.classList.add("is-hidden"); });

  var index = 0;
  function type() {
    target.textContent = text.slice(0, ++index);
    if (index < text.length) {
      setTimeout(type, 110);
      return;
    }
    setTimeout(function () {
      after.forEach(function (el, i) {
        setTimeout(function () { el.classList.remove("is-hidden"); }, i * 350);
      });
    }, 350);
  }
  setTimeout(type, 1100);
})();
