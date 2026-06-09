(function() {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterScope = document.querySelector("[data-filter-scope]");

  if (filterScope) {
    var input = filterScope.querySelector("[data-filter-input]");
    var yearSelect = filterScope.querySelector("[data-filter-year]");
    var resetButton = filterScope.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card"));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-category") || ""
        ].join(" ").toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-filter-hidden", !(matchedQuery && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener("click", function() {
        if (input) {
          input.value = "";
        }

        if (yearSelect) {
          yearSelect.value = "";
        }

        applyFilter();
      });
    }
  }
}());
