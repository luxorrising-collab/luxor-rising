/* Luxor Rising — preview interactions (nav, dropdown, reveal, sticky bar, forms) */
(function () {
  // Mobile nav
  var b = document.getElementById("burger"),
    n = document.getElementById("navLinks");
  if (b && n) {
    b.addEventListener("click", function () {
      var o = n.classList.toggle("open");
      b.setAttribute("aria-expanded", o);
    });
  }

  // Destinations dropdown — click toggles on mobile / keyboard
  document.querySelectorAll(".nav-dd-t").forEach(function (t) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      var dd = t.closest(".nav-dd");
      var open = dd.classList.toggle("open");
      t.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".nav-dd.open").forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        var t = dd.querySelector(".nav-dd-t");
        if (t) t.setAttribute("aria-expanded", false);
      }
    });
  });

  // Reveal on scroll
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );
  document.querySelectorAll(".rv").forEach(function (el) {
    io.observe(el);
  });

  // Sticky bar
  var bar = document.getElementById("bar");
  if (bar) {
    window.addEventListener(
      "scroll",
      function () {
        bar.classList.toggle("show", window.scrollY > 620);
      },
      { passive: true }
    );
  }

  // Filter chips (hubs / listings)
  var chips = document.querySelectorAll(".chip");
  var count = document.getElementById("count");
  if (chips.length) {
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) {
          x.classList.remove("on");
        });
        c.classList.add("on");
        var f = c.dataset.f,
          shown = 0;
        document.querySelectorAll(".card[data-cat]").forEach(function (card) {
          var ok = f === "all" || card.dataset.cat.indexOf(f) > -1;
          card.classList.toggle("hide", !ok);
          if (ok) shown++;
        });
        if (count) count.textContent = "Showing " + shown + " experience" + (shown === 1 ? "" : "s");
      });
    });
  }

  // Preview-only forms: no backend — show inline confirmation
  document.querySelectorAll("form[data-preview]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var ok = form.parentNode.querySelector(".form-ok");
      form.style.display = "none";
      if (ok) {
        ok.classList.add("show");
        ok.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
})();
