(function () {
  var el = document.getElementById("countdown");
  if (!el) return;

  var target = new Date(el.dataset.target).getTime();
  var days = document.getElementById("cd-days");
  var hours = document.getElementById("cd-hours");
  var minutes = document.getElementById("cd-minutes");
  var seconds = document.getElementById("cd-seconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    var diff = target - Date.now();

    if (diff <= 0) {
      days.textContent = hours.textContent = minutes.textContent = seconds.textContent = "00";
      clearInterval(timer);
      return;
    }

    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var m = Math.floor((diff / (1000 * 60)) % 60);
    var s = Math.floor((diff / 1000) % 60);

    days.textContent = pad(d);
    hours.textContent = pad(h);
    minutes.textContent = pad(m);
    seconds.textContent = pad(s);
  }

  tick();
  var timer = setInterval(tick, 1000);
})();

(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  function closeMenu() {
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  function openMenu() {
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    nav.classList.add("is-open");
  }

  toggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", function (e) {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) closeMenu();
  });
})();

(function () {
  var tabs = document.querySelectorAll(".day-tab");
  var panels = document.querySelectorAll(".day-panel");
  if (!tabs.length || !panels.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var day = tab.dataset.day;

      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.dataset.dayPanel === day);
      });
    });
  });
})();

(function () {
  var navLinks = document.querySelectorAll(".main-nav a[href^='#']");
  if (!navLinks.length) return;

  var linksBySection = {};
  var sections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (!section) return;
    linksBySection[id] = link;
    sections.push(section);
  });

  if (!sections.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.remove("is-active");
        });
        linksBySection[entry.target.id].classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();

(function () {
  var figs = document.querySelectorAll(".hero-fig");
  if (!figs.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  var timer = null;

  function lightRandom() {
    var fig = figs[Math.floor(Math.random() * figs.length)];
    fig.classList.remove("is-lit");
    void fig.offsetWidth;
    fig.classList.add("is-lit");
    timer = setTimeout(lightRandom, 1200 + Math.random() * 3200);
  }

  timer = setTimeout(lightRandom, 900);
})();

(function () {
  var track = document.getElementById("tokoh-track");
  var dots = document.querySelectorAll(".tokoh-dot");
  if (!track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll(".tokoh-card"));
  if (!cards.length) return;

  var MAX_SCALE = 1.15;
  var MIN_SCALE = 0.7;
  var MAX_OPACITY = 1;
  var MIN_OPACITY = 0.35;

  function goTo(index) {
    var card = cards[index];
    if (!card) return;
    var target = card.offsetLeft + card.offsetWidth / 2 - track.offsetWidth / 2;
    track.scrollTo({ left: target, behavior: "smooth" });
  }

  function updateScales() {
    var trackRect = track.getBoundingClientRect();
    var centerX = trackRect.left + trackRect.width / 2;
    var falloff = trackRect.width / 2 + 20;
    var nearest = 0;
    var nearestDist = Infinity;

    cards.forEach(function (card, i) {
      var r = card.getBoundingClientRect();
      var cardCenter = r.left + r.width / 2;
      var dist = Math.abs(cardCenter - centerX);
      var t = Math.min(1, dist / falloff);
      var scale = MAX_SCALE - t * (MAX_SCALE - MIN_SCALE);
      var opacity = MAX_OPACITY - t * (MAX_OPACITY - MIN_OPACITY);
      card.style.transform = "scale(" + scale.toFixed(3) + ")";
      card.style.opacity = opacity.toFixed(3);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });

    cards.forEach(function (card, i) {
      card.classList.toggle("is-active", i === nearest);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === nearest);
    });

    return nearest;
  }

  var ticking = false;
  track.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateScales();
        ticking = false;
      });
    },
    { passive: true }
  );

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goTo(i);
    });
  });

  cards.forEach(function (card, i) {
    card.addEventListener("click", function () {
      if (!card.classList.contains("is-active")) goTo(i);
    });
  });

  window.addEventListener("resize", function () {
    updateScales();
    goTo(updateScales());
  });

  goTo(1);
  updateScales();
})();
