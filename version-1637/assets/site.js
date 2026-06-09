(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".nav-menu");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var currentSlide = 0;
        var heroTimer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === currentSlide);
            });
        }

        function startHero() {
            if (slides.length <= 1) {
                return;
            }
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(heroTimer);
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startHero();
            });
        });

        showSlide(0);
        startHero();

        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
        var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));

        function applyFilters() {
            var query = normalize(filterInputs.map(function (input) {
                return input.value;
            }).filter(Boolean).join(" "));
            var year = "";
            var type = "";

            filterSelects.forEach(function (select) {
                if (select.getAttribute("data-filter") === "year") {
                    year = normalize(select.value);
                }
                if (select.getAttribute("data-filter") === "type") {
                    type = normalize(select.value);
                }
            });

            scopes.forEach(function (scope) {
                Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card")).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesYear = !year || normalize(card.getAttribute("data-year")) === year || haystack.indexOf(year) !== -1;
                    var matchesType = !type || normalize(card.getAttribute("data-type")) === type || haystack.indexOf(type) !== -1;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType));
                });
            });
        }

        filterInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        filterSelects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        var globalInput = document.querySelector(".global-search-input");
        var globalResults = document.querySelector(".global-search-results");
        var searchItems = Array.isArray(window.SearchIndex) ? window.SearchIndex : [];

        function renderGlobalResults(query) {
            if (!globalInput || !globalResults) {
                return;
            }

            var keyword = normalize(query);
            if (!keyword) {
                globalResults.classList.remove("is-open");
                globalResults.innerHTML = "";
                return;
            }

            var results = [];
            for (var i = 0; i < searchItems.length; i += 1) {
                var item = searchItems[i];
                var value = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre
                ].join(" "));

                if (value.indexOf(keyword) !== -1) {
                    results.push(item);
                }

                if (results.length >= 12) {
                    break;
                }
            }

            globalResults.innerHTML = results.map(function (item) {
                return [
                    "<a class=\"search-result-item\" href=\"" + item.url + "\">",
                    "<img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\">",
                    "<span><h3>" + item.title + "</h3><p>" + [item.year, item.region, item.type].filter(Boolean).join(" · ") + "</p></span>",
                    "</a>"
                ].join("");
            }).join("");

            globalResults.classList.toggle("is-open", results.length > 0);
        }

        if (globalInput) {
            globalInput.addEventListener("input", function () {
                renderGlobalResults(globalInput.value);
            });

            document.addEventListener("click", function (event) {
                if (!globalInput.contains(event.target) && globalResults && !globalResults.contains(event.target)) {
                    globalResults.classList.remove("is-open");
                }
            });
        }

        var video = document.getElementById("movie-player");
        var cover = document.querySelector(".player-cover");

        if (video && cover) {
            var sourceElement = video.querySelector("source");
            var sourceUrl = sourceElement ? sourceElement.getAttribute("src") : "";
            var streamReady = false;
            var hlsPlayer = null;

            function markPlaying() {
                cover.classList.add("is-hidden");
            }

            function prepareStream() {
                if (streamReady || !sourceUrl) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsPlayer = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsPlayer.loadSource(sourceUrl);
                    hlsPlayer.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }

                streamReady = true;
            }

            function startPlayback() {
                prepareStream();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(markPlaying).catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                } else {
                    markPlaying();
                }
            }

            cover.addEventListener("click", startPlayback);

            video.addEventListener("play", markPlaying);

            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
                    hlsPlayer.destroy();
                }
            });
        }
    });
}());
