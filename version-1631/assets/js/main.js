(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('.hero-carousel');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.content-section'));
    sections.forEach(function (section) {
      var input = section.querySelector('.filter-input');
      var year = section.querySelector('.filter-year');
      var category = section.querySelector('.filter-category');
      var list = section.querySelector('.filter-list');
      var empty = section.querySelector('.empty-state');
      if (!list || (!input && !year && !category)) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var categoryValue = category ? category.value : '';
        var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-card'));
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      apply();
    });
  }

  function initPlayer() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    panels.forEach(function (panel) {
      var video = panel.querySelector('video');
      var overlay = panel.querySelector('.player-overlay');
      var stream = panel.getAttribute('data-stream');
      var active = false;
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      function attachStream() {
        if (active) {
          return;
        }
        active = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attachStream();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!active) {
          play();
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
