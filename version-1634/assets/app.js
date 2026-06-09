(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
      navToggle.addEventListener('click', function () {
        siteNav.classList.toggle('is-open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
      var searchInput = filterScope.querySelector('[data-filter-search]');
      var yearSelect = filterScope.querySelector('[data-filter-year]');
      var genreSelect = filterScope.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.movie-card'));

      function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';

        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardGenre = card.getAttribute('data-genre') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || cardGenre.toLowerCase().indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear.indexOf(year) !== -1;
          var matchedGenre = !genre || cardGenre.indexOf(genre) !== -1;
          card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear && matchedGenre));
        });
      }

      [searchInput, yearSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
    }

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchInputMain = document.querySelector('[data-search-page-input]');
    var searchResults = document.querySelector('[data-search-results]');

    if (searchForm && searchInputMain && searchResults && typeof siteSearchData !== 'undefined') {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInputMain.value = initialQuery;

      function renderSearch(query) {
        var normalized = query.trim().toLowerCase();
        var results = siteSearchData.filter(function (movie) {
          var haystack = [movie.title, movie.genre, movie.region, movie.year, movie.tags].join(' ').toLowerCase();
          return !normalized || haystack.indexOf(normalized) !== -1;
        }).slice(0, 96);

        searchResults.innerHTML = results.map(function (movie) {
          return [
            '<article class="movie-card">',
            '<a class="poster" href="./' + movie.file + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '<a class="card-action" href="./' + movie.file + '">立即观看</a>',
            '</div>',
            '</article>'
          ].join('');
        }).join('');
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = searchInputMain.value.trim();
        var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', url);
        renderSearch(query);
      });

      searchInputMain.addEventListener('input', function () {
        renderSearch(searchInputMain.value);
      });

      renderSearch(initialQuery);
    }
  });
})();
