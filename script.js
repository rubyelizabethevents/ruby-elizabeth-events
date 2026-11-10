(function () {
  "use strict";

  // Year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // Smooth scroll for same-page anchors (respects reduced motion via CSS)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  // Fade-in on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("visible");
    });
  }


  // Glow video: autoplay muted loop when in view; respect prefers-reduced-motion
  var glowVideo = document.getElementById("glow-video");
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function playGlow() {
    if (!glowVideo || prefersReduced) return;
    var playPromise = glowVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        /* Autoplay blocked — controls remain available */
      });
    }
  }

  function pauseGlow() {
    if (!glowVideo) return;
    glowVideo.pause();
  }

  if (glowVideo) {
    glowVideo.muted = true;
    glowVideo.setAttribute("muted", "");
    glowVideo.playsInline = true;

    if (prefersReduced) {
      pauseGlow();
    } else if ("IntersectionObserver" in window) {
      var videoIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
              playGlow();
            } else {
              pauseGlow();
            }
          });
        },
        { threshold: [0, 0.35, 0.6] }
      );
      videoIo.observe(glowVideo);
    }

    if (window.matchMedia) {
      var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onMotionChange = function (e) {
        prefersReduced = e.matches;
        if (prefersReduced) pauseGlow();
        else if (glowVideo.getBoundingClientRect().top < window.innerHeight) {
          playGlow();
        }
      };
      if (motionMq.addEventListener) motionMq.addEventListener("change", onMotionChange);
      else if (motionMq.addListener) motionMq.addListener(onMotionChange);
    }
  }

  // Inquiry form — opens an email draft to the business inbox
  var PLACEHOLDER_EMAIL = "info@rubyelizabethevents.com";
  var form = document.getElementById("inquiry-form");
  var statusEl = document.getElementById("form-status");

  function showStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? "#8b3a3a" : "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (form.elements.namedItem("name") || {}).value || "";
      var email = (form.elements.namedItem("email") || {}).value || "";
      var phone = (form.elements.namedItem("phone") || {}).value || "";
      var eventDate = (form.elements.namedItem("event-date") || {}).value || "";
      var service = (form.elements.namedItem("service") || {}).value || "";
      var message = (form.elements.namedItem("message") || {}).value || "";

      name = String(name).trim();
      email = String(email).trim();
      message = String(message).trim();

      if (!name || !email || !message) {
        showStatus("Please fill in name, email, and message.", true);
        return;
      }

      var subject = encodeURIComponent(
        "Ruby Elizabeth Events Inquiry — " + name
      );
      var body = encodeURIComponent(
        [
          "Name: " + name,
          "Email: " + email,
          "Phone: " + (phone || "(not provided)"),
          "Event date: " + (eventDate || "(not provided)"),
          "Service interest: " + (service || "(not specified)"),
          "",
          "Message:",
          message,
        ].join("\n")
      );

      // Open mailto as temporary wiring
      window.location.href =
        "mailto:" + PLACEHOLDER_EMAIL + "?subject=" + subject + "&body=" + body;

      showStatus(
        "Opening your email client with a drafted inquiry to info@rubyelizabethevents.com. If nothing opens, email that address directly.",
        false
      );
    });
  }
})();
