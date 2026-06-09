(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("hidden");
        });
    }

    function initHero() {
        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    var active = slideIndex === current;
                    slide.classList.toggle("opacity-100", active);
                    slide.classList.toggle("opacity-0", !active);
                    slide.classList.toggle("is-active", active);
                });
                dots.forEach(function (dot, dotIndex) {
                    var active = dotIndex === current;
                    dot.classList.toggle("bg-white", active);
                    dot.classList.toggle("w-8", active);
                    dot.classList.toggle("is-active", active);
                    dot.classList.toggle("bg-white/50", !active);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            show(0);
            restart();
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var targetSelector = form.getAttribute("data-filter-target");
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-card]"));
            var search = form.querySelector('[name="search"]');
            var type = form.querySelector('[name="type"]');
            var year = form.querySelector('[name="year"]');
            var genre = form.querySelector('[name="genre"]');

            function value(input) {
                return input ? input.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = value(search);
                var typeValue = value(type);
                var yearValue = value(year);
                var genreValue = value(genre);
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (typeValue && (card.getAttribute("data-type") || "").toLowerCase().indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && (card.getAttribute("data-year") || "").toLowerCase().indexOf(yearValue) === -1) {
                        ok = false;
                    }
                    if (genreValue && haystack.indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            var hlsInstance = null;
            if (!video || !button) {
                return;
            }

            function attachSource() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                var source = video.getAttribute("data-src");
                if (!source) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute("data-ready", "1");
            }

            function start(event) {
                if (event) {
                    event.preventDefault();
                }
                attachSource();
                button.classList.add("hidden");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        button.classList.remove("hidden");
                    });
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
