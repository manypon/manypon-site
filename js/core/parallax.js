(function () {
  var img = document.querySelector(".backdrop__img");
  if (!img) return;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;

  var targetX = 0;
  var targetY = 0;
  var frame = null;

  function apply() {
    img.style.setProperty("--px", targetX.toFixed(1) + "px");
    img.style.setProperty("--py", targetY.toFixed(1) + "px");
    frame = null;
  }

  window.addEventListener("pointermove", function (event) {
    targetX = (event.clientX / window.innerWidth - 0.5) * -26;
    targetY = (event.clientY / window.innerHeight - 0.5) * -16;
    if (frame === null) frame = requestAnimationFrame(apply);
  }, { passive: true });
})();
