(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      var run = function () {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          run();
        });
      });
      if (slides.length > 1) {
        run();
      }
    }

    var localSearches = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    localSearches.forEach(function (input) {
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        var scope = input.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden-card", value && haystack.indexOf(value) === -1);
        });
      });
    });

    if (window.SEARCH_INDEX) {
      setupGlobalSearch();
    }
  });

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results) {
      return;
    }

    fillSelect(regionFilter, uniqueValues("region"));
    fillSelect(typeFilter, uniqueValues("type"));
    fillSelect(yearFilter, uniqueValues("year").sort().reverse());

    var render = function () {
      var keyword = input.value.trim().toLowerCase();
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var items = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.year, item.tags, item.oneLine].join(" ").toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!region || item.region === region) &&
          (!type || item.type === type) &&
          (!year || item.year === year);
      }).slice(0, 96);
      results.innerHTML = items.map(cardMarkup).join("");
    };

    input.addEventListener("input", render);
    [regionFilter, typeFilter, yearFilter].forEach(function (select) {
      if (select) {
        select.addEventListener("change", render);
      }
    });
  }

  function uniqueValues(key) {
    var seen = Object.create(null);
    window.SEARCH_INDEX.forEach(function (item) {
      if (item[key]) {
        seen[item[key]] = true;
      }
    });
    return Object.keys(seen).sort();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function cardMarkup(item) {
    return [
      "<article class=\"movie-card compact\" data-movie-card>",
      "<a href=\"./" + escapeHtml(item.file) + "\" class=\"poster-link\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
      "<div class=\"poster-frame\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-overlay\"></span>",
      "<span class=\"play-icon\" aria-hidden=\"true\">▶</span>",
      "<span class=\"card-category\">" + escapeHtml(item.category) + "</span>",
      "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<h3>" + escapeHtml(item.title) + "</h3>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"card-meta\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
      "<div class=\"card-tags\"><span>" + escapeHtml(item.genre) + "</span></div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  window.MoviePlayer = {
    init: function (src, videoId, maskId, buttonId) {
      var video = document.getElementById(videoId);
      var mask = document.getElementById(maskId);
      var button = document.getElementById(buttonId);
      if (!video || !src) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;
      var load = function () {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      };
      var play = function () {
        load();
        if (mask) {
          mask.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }
      if (mask) {
        mask.addEventListener("click", play);
        mask.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            play();
          }
        });
      }
      video.addEventListener("play", function () {
        if (mask) {
          mask.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
