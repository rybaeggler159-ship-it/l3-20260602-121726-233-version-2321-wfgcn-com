(function () {
    var mobileButton = document.querySelector('[data-mobile-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var targetSelector = form.getAttribute('data-target');
        var target = document.querySelector(targetSelector);
        var queryInput = form.querySelector('[data-filter-query]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var yearSelect = form.querySelector('[data-filter-year]');

        if (!target) {
            return;
        }

        var items = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(queryInput ? queryInput.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-tags')
                ].join(' '));
                var itemType = normalize(item.getAttribute('data-type'));
                var itemYear = normalize(item.getAttribute('data-year'));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && itemType !== type) {
                    matched = false;
                }
                if (year && itemYear !== year) {
                    matched = false;
                }

                item.classList.toggle('hidden-by-filter', !matched);
            });
        }

        [queryInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
