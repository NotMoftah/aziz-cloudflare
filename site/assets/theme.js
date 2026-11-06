(function () {
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() { try { return localStorage.getItem("theme"); } catch (e) { return null; } }
  function apply(t) { root.setAttribute("data-theme", t); }
  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }
  mq.addEventListener && mq.addEventListener("change", function (e) {
    if (!stored()) apply(e.matches ? "dark" : "light");
  });
})();
