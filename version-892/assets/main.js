(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grid = document.querySelector('[data-card-grid]');

  function filterCards() {
    if (!grid) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : '');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      card.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
    });
  }

  function sortCards() {
    if (!grid || !sortSelect) {
      return;
    }
    var mode = sortSelect.value;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    cards.sort(function (a, b) {
      if (mode === 'rating') {
        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
      }
      if (mode === 'views') {
        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
      }
      if (mode === 'year') {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      }
      return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    filterCards();
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }

  var likeButton = document.querySelector('[data-like-button]');
  if (likeButton) {
    likeButton.addEventListener('click', function () {
      likeButton.classList.toggle('is-liked');
      likeButton.textContent = likeButton.classList.contains('is-liked') ? '已喜欢' : '喜欢';
    });
  }

  var shareButton = document.querySelector('[data-share-button]');
  if (shareButton) {
    shareButton.addEventListener('click', function () {
      var title = document.title;
      var url = location.href;
      if (navigator.share) {
        navigator.share({ title: title, url: url });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        shareButton.textContent = '已复制链接';
        window.setTimeout(function () {
          shareButton.textContent = '分享';
        }, 1600);
      }
    });
  }

  var searchRoot = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-page-input]');
  var searchButton = document.querySelector('[data-search-page-button]');
  var searchNote = document.querySelector('[data-search-note]');

  function renderSearch() {
    if (!searchRoot || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(location.search);
    var query = normalize(searchInput && searchInput.value ? searchInput.value : params.get('q'));
    if (searchInput && !searchInput.value && params.get('q')) {
      searchInput.value = params.get('q');
    }
    var list = MOVIE_INDEX.filter(function (movie) {
      if (!query) {
        return true;
      }
      return normalize(movie.title + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.tags).indexOf(query) !== -1;
    }).slice(0, 120);
    searchRoot.innerHTML = list.map(function (movie) {
      return [
        '<article class="movie-card" data-card>',
        '  <a href="' + movie.url + '">',
        '    <span class="card-cover">',
        '      <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '      <span class="score-badge">' + movie.rating + '</span>',
        '      <span class="play-badge">▶</span>',
        '    </span>',
        '    <span class="card-body">',
        '      <strong>' + movie.title + '</strong>',
        '      <span class="card-desc">' + movie.desc + '</span>',
        '      <span class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></span>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
    if (searchNote) {
      searchNote.textContent = '找到 ' + list.length + ' 个结果';
    }
  }

  if (searchRoot) {
    renderSearch();
    window.setTimeout(renderSearch, 0);
  }

  if (searchButton) {
    searchButton.addEventListener('click', function () {
      renderSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        renderSearch();
      }
    });
  }
})();
