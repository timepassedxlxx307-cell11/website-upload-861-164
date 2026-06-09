(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));

    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = (card.dataset.title + ' ' + card.dataset.meta).toLowerCase();
        card.classList.toggle('is-filter-hidden', keyword && !haystack.includes(keyword));
      });
    });
  }

  const searchResults = document.querySelector('[data-search-results]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchStatus = document.querySelector('[data-search-status]');

  if (searchResults && Array.isArray(window.SEARCH_ITEMS)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    const createCard = function (item) {
      const tags = item.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-pin">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(String(item.year || '精选')) + '</span></div>' +
        '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    };

    const render = function (query) {
      const keyword = query.trim().toLowerCase();
      const source = window.SEARCH_ITEMS;
      const results = keyword ? source.filter(function (item) {
        const haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
        return haystack.includes(keyword);
      }) : source.slice(0, 96);
      const visible = results.slice(0, 120);

      searchResults.innerHTML = visible.map(createCard).join('');

      if (searchStatus) {
        searchStatus.textContent = keyword ? '已匹配到相关影片，点击卡片即可进入详情页。' : '展示片库中的热门内容，也可以输入关键词继续筛选。';
      }
    };

    render(initialQuery);

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        render(searchInput.value);
      });
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
