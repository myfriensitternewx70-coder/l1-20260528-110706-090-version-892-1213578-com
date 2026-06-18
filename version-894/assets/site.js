(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("active", thumbIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                var index = Number(thumb.getAttribute("data-hero-thumb"));
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function filterCards(input, cards, emptyState) {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search") || card.textContent);
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle("hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle("show", visible === 0);
        }
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchList = document.querySelector("[data-search-list]");
    var searchClear = document.querySelector("[data-search-clear]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (searchInput && searchList) {
        var searchCards = Array.prototype.slice.call(searchList.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener("input", function () {
            filterCards(searchInput, searchCards, emptyState);
        });
        if (searchClear) {
            searchClear.addEventListener("click", function () {
                searchInput.value = "";
                filterCards(searchInput, searchCards, emptyState);
                searchInput.focus();
            });
        }
        filterCards(searchInput, searchCards, emptyState);
    }

    var inlineFilters = Array.prototype.slice.call(document.querySelectorAll("[data-inline-filter]"));
    inlineFilters.forEach(function (filter) {
        var input = filter.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        input.addEventListener("input", function () {
            filterCards(input, cards, null);
        });
    });
})();
