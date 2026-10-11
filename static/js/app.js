// ============================================================
// Y Plant Affricanaidd CIC — Digital Empowerment Programme
// Frontend interactivity.
//
// Progressive enhancement: the site works fully without this file.
// ============================================================

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initSmoothScroll();
    initMobileMenu();
    initFormEnhancements();
    initRevealOnScroll();
    initHeroCarousel();
  });

  // ----------------------------------------------------------
  // 1. Smooth scroll for in-page anchors
  // ----------------------------------------------------------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId.length < 2) return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var headerOffset = 80;
        var elementPosition = target.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });

        var nav = document.querySelector(".site-header nav");
        if (nav && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
        }
      });
    });
  }

  // ----------------------------------------------------------
  // 2. Mobile menu toggle
  // ----------------------------------------------------------
  function initMobileMenu() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var nav = header.querySelector("nav");
    if (!nav) return;

    var toggle = document.createElement("button");
    toggle.className = "menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "☰";

    header.querySelector(".container").appendChild(toggle);

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.innerHTML = isOpen ? "✕" : "☰";
    });
  }

  // ----------------------------------------------------------
  // 3. Form: client-side validation + AJAX submission
  // ----------------------------------------------------------
  function initFormEnhancements() {
    var form = document.querySelector("form.form");
    if (!form) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.textContent : "";

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () { validateField(this); });
      field.addEventListener("input", function () {
        if (this.classList.contains("has-error")) validateField(this);
      });
    });

    form.addEventListener("submit", function (e) {
      var isValid = true;
      var firstInvalid = null;

      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // Interests group — at least one required
      var interestsGroup = form.querySelector(".checkbox-grid");
      if (interestsGroup) {
        var anyChecked = interestsGroup.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        if (!anyChecked) {
          isValid = false;
          if (!firstInvalid) firstInvalid = interestsGroup.querySelector('input[type="checkbox"]');
          showGroupError(interestsGroup, "Please tick at least one interest.");
        } else {
          clearGroupError(interestsGroup);
        }
      }

      if (!isValid) {
        e.preventDefault();
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      var ajaxUrl = form.getAttribute("data-ajax-url");
      if (ajaxUrl) {
        e.preventDefault();
        submitViaFetch(form, ajaxUrl, submitBtn, originalBtnText);
      }
    });

        function validateField(field) {
      var value = (field.value || "").trim();
      var type = field.type;
      var name = field.name;
      var msg = "";

      // Required fields
      if (field.required && !value) {
        msg = "This field is required.";
      }
      // Email format
      else if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        msg = "Please enter a valid email address.";
      }
      // Phone — at least 7 digits
      else if (name === "phone" && value) {
        var digits = value.replace(/\D/g, "");
        if (digits.length < 7) {
          msg = "Please enter a valid phone number.";
        }
      }

      setFieldError(field, msg);
      return !msg;
    }

    function setFieldError(field, message) {
      var group = field.closest(".form-group") || field.parentElement;
      if (!group) return;
      var errorEl = group.querySelector(".js-error");
      if (message) {
        field.classList.add("has-error");
        field.setAttribute("aria-invalid", "true");
        if (!errorEl) {
          errorEl = document.createElement("div");
          errorEl.className = "js-error errorlist";
          group.appendChild(errorEl);
        }
        errorEl.textContent = message;
      } else {
        field.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
        if (errorEl) errorEl.remove();
      }
    }

    function showGroupError(group, message) {
      var parent = group.closest(".form-group") || group.parentElement;
      if (!parent) return;
      var errorEl = parent.querySelector(".js-group-error");
      if (!errorEl) {
        errorEl = document.createElement("div");
        errorEl.className = "js-group-error errorlist";
        parent.appendChild(errorEl);
      }
      errorEl.textContent = message;
    }

    function clearGroupError(group) {
      var parent = group.closest(".form-group") || group.parentElement;
      if (!parent) return;
      var errorEl = parent.querySelector(".js-group-error");
      if (errorEl) errorEl.remove();
    }
  }

  function submitViaFetch(form, url, submitBtn, originalBtnText) {
    var payload = {};
    var formData = new FormData(form);

    formData.forEach(function (value, key) {
      if (key === "csrfmiddlewaretoken") return;
      if (key === "interests") {
        if (!payload.interests) payload.interests = [];
        payload.interests.push(value);
      } else {
        payload[key] = value;
      }
    });

    // NOTE: interests stays as an array — Django's MultipleChoiceField expects a list.

    var csrfInput = form.querySelector('input[name="csrfmiddlewaretoken"]');
    var csrf = csrfInput ? csrfInput.value : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf,
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.ok) {
          window.location.href = result.data.redirect;
          return;
        }
        showServerErrors(form, (result.data && result.data.errors) || {});
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      })
      .catch(function () {
        form.submit();
      });
  }

  function showServerErrors(form, errors) {
    Object.keys(errors).forEach(function (fieldName) {
      var messages = errors[fieldName]
        .map(function (e) { return e.message; })
        .join(" ");
      var field = form.querySelector('[name="' + fieldName + '"]');
      if (!field) return;
      var group = field.closest(".form-group") || field.parentElement;
      if (!group) return;
      var errorEl = group.querySelector(".js-error");
      if (!errorEl) {
        errorEl = document.createElement("div");
        errorEl.className = "js-error errorlist";
        group.appendChild(errorEl);
      }
      errorEl.textContent = messages;
      field.classList.add("has-error");
    });
  }

  // ----------------------------------------------------------
  // 4. Reveal-on-scroll animations
  // ----------------------------------------------------------
  function initRevealOnScroll() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(".card, .location-card, .section-title");
    targets.forEach(function (el) { el.classList.add("reveal"); });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ----------------------------------------------------------
  // 5. Hero circle carousel — cycles through programme images
  // ----------------------------------------------------------
  function initHeroCarousel() {
    var slides = document.querySelectorAll(".circle-carousel .carousel-slide");
    if (slides.length < 2) return;

    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var current = 0;
    var interval = 3000; // 3 seconds

    function showNext() {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }

    setInterval(showNext, interval);
  }

})();
