// Mobile nav toggle + active link highlighting
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("open") ? "true" : "false"
      );
    });
  }

  var current = document.body.getAttribute("data-page");
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("data-page") === current) {
      a.classList.add("active");
    }
  });
});
