(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var filterRoot = document.querySelector("[data-filters]");
  var cardContainer = document.querySelector("[data-card-container]");

  if (filterRoot && cardContainer) {
    var searchInput = filterRoot.querySelector("[data-filter-search]");
    var categorySelect = filterRoot.querySelector("[data-filter-category]");
    var sortSelect = filterRoot.querySelector("[data-filter-sort]");
    var cards = Array.prototype.slice.call(cardContainer.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get("search") || "";

    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
    }

    function applyFilters() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var cat = categorySelect ? categorySelect.value : "all";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardCat = card.getAttribute("data-category") || "";
        var visible = (!q || text.indexOf(q) !== -1) && (cat === "all" || cardCat === cat);
        card.classList.toggle("is-filter-hidden", !visible);
      });
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === "score") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
      } else if (value === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
      } else if (value === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        cardContainer.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilters);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        applySort();
        applyFilters();
      });
    }
    applySort();
    applyFilters();
  }

  window.initMoviePlayer = function (src) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var shell = document.querySelector("[data-player-shell]");
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      loaded = true;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          play();
        }
      });
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
