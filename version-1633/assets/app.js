(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs(".menu-toggle");
        var nav = qs(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = qs(".hero-slider");
        if (!root) {
            return;
        }
        var slides = qsa(".hero-slide", root);
        var dots = qsa(".hero-dots button", root);
        var prev = qs(".hero-prev", root);
        var next = qs(".hero-next", root);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        start();
    }

    function setupFilters() {
        var grids = qsa(".filter-grid");
        grids.forEach(function (grid) {
            var section = grid.closest(".content-section") || document;
            var input = qs(".filter-input", section);
            var year = qs(".filter-year", section);
            var type = qs(".filter-type", section);
            var empty = qs(".empty-state", section);
            var cards = qsa(".movie-card", grid);
            function apply() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchText = !text || haystack.indexOf(text) !== -1;
                    var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var show = matchText && matchYear && matchType;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, year, type].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
        });
    }

    function setupSearchPage() {
        var results = qs("#search-results");
        var input = qs("#site-search-input");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        function card(item) {
            return '<article class="movie-card">' +
                '<a class="movie-poster" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="play-dot">▶</span>' +
                '</a>' +
                '<div class="movie-info">' +
                '<a class="movie-name" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
                '<div class="movie-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</div>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
                '</div>' +
                '</article>';
        }
        function render(value) {
            var text = (value || "").trim().toLowerCase();
            if (!text) {
                results.innerHTML = "";
                return;
            }
            var matched = window.SEARCH_INDEX.filter(function (item) {
                return item.search.indexOf(text) !== -1;
            }).slice(0, 96);
            results.innerHTML = matched.map(card).join("");
        }
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(query);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve();
        }
        if (window.__hlsLoadingPromise) {
            return window.__hlsLoadingPromise;
        }
        window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsLoadingPromise;
    }

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        var started = false;
        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        function attach() {
            if (started) {
                play();
                return;
            }
            started = true;
            overlay.classList.add("is-hidden");
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                play();
                return;
            }
            loadHlsScript().then(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        play();
                    });
                } else {
                    video.src = source;
                    play();
                }
            }).catch(function () {
                video.src = source;
                play();
            });
        }
        overlay.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (!started) {
                attach();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
