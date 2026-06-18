(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-go')) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    document.querySelectorAll('[data-toolbar]').forEach(function (toolbar) {
        var input = toolbar.querySelector('.filter-input');
        var section = toolbar.closest('.content-section');
        var grid = section ? section.querySelector('.sortable-grid') : null;
        var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('.sort-btn'));
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children);
        var applyFilter = function () {
            var q = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                card.style.display = !q || title.indexOf(q) !== -1 ? '' : 'none';
            });
        };
        if (input) {
            input.addEventListener('input', applyFilter);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                var sort = button.getAttribute('data-sort');
                var sorted = cards.slice();
                if (sort === 'rating') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
                    });
                } else if (sort === 'views') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                    });
                } else if (sort === 'year') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    });
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = Array.prototype.slice.call(grid.children);
                applyFilter();
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-button');
        var stream = player.getAttribute('data-stream');
        var initialized = false;
        var start = function () {
            if (!video || !stream) {
                return;
            }
            player.classList.add('is-playing');
            if (window.Hls && window.Hls.isSupported()) {
                if (!initialized) {
                    var hls = new Hls({ maxBufferLength: 60 });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                    initialized = true;
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
            } else {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
                video.play().catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }
        player.addEventListener('click', function (event) {
            if (event.target === player) {
                start();
            }
        });
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
        }
    });

    var searchResults = document.getElementById('searchResults');
    var searchInput = document.getElementById('searchInput');
    var searchStatus = document.getElementById('searchStatus');
    if (searchResults && window.ASIA_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (searchInput) {
            searchInput.value = query;
        }
        var renderSearch = function (q) {
            searchResults.innerHTML = '';
            var keyword = q.trim().toLowerCase();
            if (!keyword) {
                searchStatus.textContent = '输入关键词开始搜索。';
                return;
            }
            var matched = window.ASIA_SEARCH_INDEX.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, item.tags, item.description].join(' ').toLowerCase();
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            searchStatus.textContent = '搜索关键词：' + q + '，匹配到 ' + matched.length + ' 条结果。';
            matched.forEach(function (item) {
                var card = document.createElement('article');
                card.className = 'movie-card';
                card.innerHTML = '<a href="' + item.file + '" class="card-image-wrap"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"><span class="category-badge">' + item.category + '</span><span class="duration-badge">' + item.duration + '</span></a><div class="card-body"><a href="' + item.file + '" class="card-title">' + item.title + '</a><p>' + item.description + '</p><div class="card-meta"><span>★ ' + item.rating + '</span><span>' + item.year + '</span></div></div>';
                searchResults.appendChild(card);
            });
        };
        renderSearch(query);
    }
})();
