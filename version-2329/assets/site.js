(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var params = new URLSearchParams(window.location.search);
  if (filterInput && params.get('q')) {
    filterInput.value = params.get('q');
  }
  var applyFilters = function () {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = filterType ? filterType.value : '';
    var year = filterYear ? filterYear.value : '';
    var category = filterCategory ? filterCategory.value : '';
    filterCards.forEach(function (card) {
      var text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchType = !type || (card.dataset.type || '').indexOf(type) !== -1;
      var matchYear = !year || card.dataset.year === year;
      var matchCategory = !category || card.dataset.category === category;
      card.classList.toggle('hidden', !(matchKeyword && matchType && matchYear && matchCategory));
    });
  };
  [filterInput, filterType, filterYear, filterCategory].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
  if (filterCards.length) {
    applyFilters();
  }

  var playButton = document.querySelector('[data-play-button]');
  var video = document.getElementById('moviePlayer');
  if (playButton && video) {
    var source = video.getAttribute('data-video');
    var hlsInstance;
    var start = function () {
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
      } else {
        video.setAttribute('src', source);
      }
      playButton.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    };
    playButton.addEventListener('click', start);
    video.addEventListener('click', start);
  }
})();
