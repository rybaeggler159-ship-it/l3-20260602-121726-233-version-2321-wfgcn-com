(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var navigation = document.querySelector('[data-nav]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      navigation.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6500);
  }

  var filterPage = document.querySelector('[data-filter-page]');

  if (filterPage) {
    var searchInput = filterPage.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(filterPage.querySelectorAll('[data-filter-type]'));
    var cards = Array.prototype.slice.call(filterPage.querySelectorAll('[data-card]'));
    var emptyState = filterPage.querySelector('[data-empty-state]');
    var currentType = 'all';
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var title = normalize(card.getAttribute('data-title'));
        var year = normalize(card.getAttribute('data-year'));
        var type = card.getAttribute('data-type') || '';
        var matchQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1 || year.indexOf(query) !== -1;
        var matchType = currentType === 'all' || type === currentType;
        var show = matchQuery && matchType;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentType = button.getAttribute('data-filter-type') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  var playerShell = document.querySelector('[data-player]');

  if (playerShell) {
    var video = playerShell.querySelector('video');
    var button = playerShell.querySelector('[data-play-button]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
