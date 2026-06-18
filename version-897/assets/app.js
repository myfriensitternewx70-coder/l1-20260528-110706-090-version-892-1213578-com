(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var localInput = document.querySelector('[data-local-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var result = document.querySelector('[data-result-count]');

  var applyFilter = function (term) {
    if (!cards.length) {
      return;
    }
    var value = String(term || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var matched = !value || haystack.indexOf(value) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (result) {
      result.textContent = value ? (visible ? '已匹配到相关影片' : '未找到匹配影片') : '';
    }
  };

  if (localInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      localInput.value = query;
      applyFilter(query);
    }
    localInput.addEventListener('input', function () {
      applyFilter(localInput.value);
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');
      var value = input ? input.value.trim() : '';
      if (form.getAttribute('data-mode') === 'local') {
        event.preventDefault();
        applyFilter(value);
      } else if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  document.querySelectorAll('[data-filter-term]').forEach(function (button) {
    button.addEventListener('click', function () {
      var term = button.getAttribute('data-filter-term') || '';
      if (localInput) {
        localInput.value = term;
      }
      applyFilter(term);
    });
  });
})();

window.initMoviePlayer = function (source) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('player-overlay');
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  var load = function () {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var start = function () {
    load();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
};
