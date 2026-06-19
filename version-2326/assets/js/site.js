(function () {
    "use strict";

    function setupMobileNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHeroSliders() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            if (slides.length === 0) {
                return;
            }

            function showSlide(index) {
                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startTimer() {
                stopTimer();
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }

            function stopTimer() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    startTimer();
                });
            });

            slider.addEventListener("mouseenter", stopTimer);
            slider.addEventListener("mouseleave", startTimer);
            startTimer();
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll(".poster-image").forEach(function (image) {
            image.addEventListener("error", function () {
                var frame = image.closest(".poster-frame");
                if (frame) {
                    frame.classList.add("is-missing");
                }
                image.style.opacity = "0";
            });
        });

        document.querySelectorAll(".hero-bg-image").forEach(function (image) {
            image.addEventListener("error", function () {
                var slide = image.closest(".hero-slide");
                if (slide) {
                    slide.classList.add("image-missing");
                }
                image.style.opacity = "0";
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
            var reset = panel.querySelector("[data-filter-reset]");
            var count = panel.querySelector("[data-filter-count]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
            var empty = document.querySelector("[data-filter-empty]");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function cardMatchesSelect(card, name, value) {
                if (!value) {
                    return true;
                }

                var field = normalize(card.getAttribute("data-" + name));
                return field.indexOf(normalize(value)) !== -1;
            }

            function applyFilters() {
                var term = input ? normalize(input.value) : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute("data-search"));
                    var isVisible = !term || searchText.indexOf(term) !== -1;

                    selects.forEach(function (select) {
                        if (!cardMatchesSelect(card, select.getAttribute("data-filter-select"), select.value)) {
                            isVisible = false;
                        }
                    });

                    card.hidden = !isVisible;

                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", applyFilters);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }

                    selects.forEach(function (select) {
                        select.value = "";
                    });

                    applyFilters();
                });
            }

            applyFilters();
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-video-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector("[data-player-trigger]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-video-src");
            var hlsInstance = null;
            var loaded = false;

            if (!video || !trigger || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("播放已就绪，请再次点击视频控件开始播放。");
                    });
                }
            }

            function loadNativeHls() {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
            }

            function loadWithHlsJs() {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源加载完成，正在播放。");
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放器加载失败，可刷新页面后重试。");
                    }
                });
            }

            function loadPlayer() {
                if (loaded) {
                    playVideo();
                    return;
                }

                loaded = true;
                trigger.classList.add("is-hidden");
                setStatus("正在初始化 HLS 播放源...");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    loadNativeHls();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    loadWithHlsJs();
                    return;
                }

                video.src = source;
                setStatus("当前浏览器不支持 HLS.js，已尝试直接载入播放源。");
                video.load();
            }

            trigger.addEventListener("click", loadPlayer);

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupHeroSliders();
        setupImageFallbacks();
        setupFilters();
        setupPlayers();
    });
})();
