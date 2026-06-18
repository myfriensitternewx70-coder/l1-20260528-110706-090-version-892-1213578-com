(function () {
    var navButton = document.querySelector("[data-menu-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (navButton && navLinks) {
        navButton.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    var headerSearch = document.querySelector("[data-header-search]");
    if (headerSearch) {
        headerSearch.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = headerSearch.querySelector("input");
            var keyword = input ? input.value.trim() : "";
            if (keyword) {
                window.location.href = "search.html?q=" + encodeURIComponent(keyword);
            }
        });
    }

    var focus = document.querySelector("[data-focus-slider]");
    if (focus) {
        var slides = Array.prototype.slice.call(focus.querySelectorAll(".focus-slide"));
        var dots = Array.prototype.slice.call(focus.querySelectorAll("[data-slide-dot]"));
        var active = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    filterBars.forEach(function (bar) {
        var scopeSelector = bar.getAttribute("data-filter-bar");
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        if (!scope) {
            scope = document;
        }

        var keywordInput = bar.querySelector("[data-filter-keyword]");
        var yearSelect = bar.querySelector("[data-filter-year]");
        var genreSelect = bar.querySelector("[data-filter-genre]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        var urlParams = new URLSearchParams(window.location.search);
        var queryKeyword = urlParams.get("q");
        if (queryKeyword && keywordInput && !keywordInput.value) {
            keywordInput.value = queryKeyword;
        }

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.textContent
                ].join(" ").toLowerCase();

                var cardYear = card.getAttribute("data-year") || "";
                var cardGenre = card.getAttribute("data-genre") || "";
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        };

        [keywordInput, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
})();

function mountMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-video-player]");
    var playButton = document.querySelector("[data-play-button]");

    if (!video || !streamUrl) {
        return;
    }

    var started = false;
    var hlsPlayer = null;

    var loadVideo = function () {
        if (started) {
            return;
        }

        started = true;

        if (playButton) {
            playButton.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };

    if (playButton) {
        playButton.addEventListener("click", loadVideo);
    }

    video.addEventListener("click", function () {
        if (!started) {
            loadVideo();
        }
    });

    video.addEventListener("play", function () {
        if (playButton) {
            playButton.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
