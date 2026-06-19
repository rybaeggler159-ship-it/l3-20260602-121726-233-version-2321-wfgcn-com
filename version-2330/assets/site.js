(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(active + 1);
        restart();
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        restart();
      });
    });
    restart();
  }

  document.querySelectorAll(".rail-shell").forEach(function(shell) {
    var rail = shell.querySelector("[data-rail]");
    var prev = shell.querySelector("[data-rail-prev]");
    var next = shell.querySelector("[data-rail-next]");
    if (!rail) {
      return;
    }
    var distance = function() {
      return Math.max(260, Math.floor(rail.clientWidth * 0.78));
    };
    if (prev) {
      prev.addEventListener("click", function() {
        rail.scrollBy({ left: -distance(), behavior: "smooth" });
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        rail.scrollBy({ left: distance(), behavior: "smooth" });
      });
    }
  });

  document.querySelectorAll("[data-filter-area]").forEach(function(area) {
    var input = area.querySelector("[data-filter-input]");
    var genreSelect = area.querySelector("[data-filter-genre]");
    var yearSelect = area.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-search-card]"));
    var empty = area.querySelector("[data-empty-state]");

    if (area.hasAttribute("data-url-query") && input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function apply() {
      var words = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
      var genre = genreSelect ? genreSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matchesWords = words.every(function(word) {
          return text.indexOf(word) !== -1;
        });
        var matchesGenre = !genre || (card.getAttribute("data-genre") || "").indexOf(genre) !== -1 || (card.getAttribute("data-tags") || "").indexOf(genre) !== -1;
        var matchesYear = !year || (card.getAttribute("data-year") || "") === year;
        var matches = matchesWords && matchesGenre && matchesYear;
        card.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, genreSelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  });
})();
