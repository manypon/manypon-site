(function () {
  var levels = document.querySelectorAll(".level");
  if (!levels.length) return;
  if (!("IntersectionObserver" in window)) {
    levels.forEach(function (el) { el.classList.add("is-filled"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var siblings = Array.prototype.indexOf.call(levels, entry.target);
      setTimeout(function () { entry.target.classList.add("is-filled"); }, siblings * 90);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  levels.forEach(function (el) { observer.observe(el); });
})();
