(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toggleMobileNav() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("active", Number(dot.getAttribute("data-hero-dot")) === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var word = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var passKeyword = !word || text.indexOf(word) !== -1;
        var passYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var passRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        card.classList.toggle("hidden-by-filter", !(passKeyword && passYear && passRegion));
      });
    }

    [keyword, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (keyword) {
          keyword.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (region) {
          region.value = "";
        }
        apply();
      });
    }
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var container = document.getElementById("searchResults");
    if (!container || !window.SEARCH_MOVIES) {
      return;
    }
    var input = document.getElementById("searchInput");
    var recommend = document.getElementById("searchRecommend");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      container.innerHTML = '<div class="search-empty">请输入关键词开始搜索。</div>';
      return;
    }
    var lower = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      return text.indexOf(lower) !== -1;
    }).slice(0, 160);
    if (recommend) {
      recommend.style.display = results.length ? "none" : "block";
    }
    if (!results.length) {
      container.innerHTML = '<div class="search-empty">没有找到匹配内容，可以尝试更换关键词。</div>';
      return;
    }
    container.innerHTML = results.map(cardTemplate).join("");
  }

  function setupPlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var stream = options.stream;
    var loaded = false;
    var hls = null;
    if (!video || !overlay || !stream) {
      return;
    }

    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
    }

    function play() {
      load();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: setupPlayer
  };

  ready(function () {
    toggleMobileNav();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
