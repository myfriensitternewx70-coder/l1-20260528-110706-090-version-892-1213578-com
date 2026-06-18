(function() {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function(img) {
    img.addEventListener("error", function() {
      img.classList.add("image-missing");
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var bg = hero.querySelector(".hero-bg");
    var active = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      active = (next + slides.length) % slides.length;

      slides.forEach(function(slide, index) {
        slide.classList.toggle("is-active", index === active);
      });

      dots.forEach(function(dot, index) {
        dot.classList.toggle("is-active", index === active);
      });

      if (bg) {
        bg.style.backgroundImage = "url('" + slides[active].getAttribute("data-cover") + "')";
      }
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function textOf(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterGrid(panel) {
    var target = document.querySelector(panel.getAttribute("data-target"));
    if (!target) {
      return;
    }

    var q = textOf(panel.querySelector("[data-filter-keyword]") && panel.querySelector("[data-filter-keyword]").value);
    var year = textOf(panel.querySelector("[data-filter-year]") && panel.querySelector("[data-filter-year]").value);
    var type = textOf(panel.querySelector("[data-filter-type]") && panel.querySelector("[data-filter-type]").value);
    var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

    cards.forEach(function(card) {
      var haystack = textOf([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type")
      ].join(" "));
      var pass = true;

      if (q && haystack.indexOf(q) === -1) {
        pass = false;
      }

      if (year && textOf(card.getAttribute("data-year")) !== year) {
        pass = false;
      }

      if (type && textOf(card.getAttribute("data-type")).indexOf(type) === -1 && textOf(card.getAttribute("data-genre")).indexOf(type) === -1) {
        pass = false;
      }

      card.style.display = pass ? "" : "none";
    });
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    panel.querySelectorAll("input, select").forEach(function(control) {
      control.addEventListener("input", function() {
        filterGrid(panel);
      });
      control.addEventListener("change", function() {
        filterGrid(panel);
      });
    });

    filterGrid(panel);
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function startPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector(".play-overlay");
    var url = root.getAttribute("data-play");

    if (!video || !url) {
      return;
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (video.getAttribute("data-ready") === "true") {
      video.play();
      return;
    }

    video.setAttribute("data-ready", "true");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play();
      return;
    }

    loadHls(function() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play();
        });
      } else {
        video.src = url;
        video.play();
      }
    });
  }

  document.querySelectorAll(".js-player").forEach(function(root) {
    var overlay = root.querySelector(".play-overlay");
    var shell = root.querySelector(".video-shell");

    if (overlay) {
      overlay.addEventListener("click", function(event) {
        event.preventDefault();
        startPlayer(root);
      });
    }

    if (shell) {
      shell.addEventListener("click", function(event) {
        if (event.target === shell) {
          startPlayer(root);
        }
      });
    }
  });

  function renderSearch() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !window.MovieSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-search-year]");
    var typeSelect = document.querySelector("[data-search-type]");
    var empty = document.querySelector(".search-results-empty");

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function makeCard(item) {
      return [
        '<article class="movie-card" data-title="' + item.safeTitle + '" data-year="' + item.safeYear + '" data-genre="' + item.safeGenre + '" data-region="' + item.safeRegion + '" data-type="' + item.safeType + '">',
        '<a class="poster-link" href="' + item.url + '" aria-label="' + item.safeTitle + '">',
        '<img src="' + item.cover + '" alt="' + item.safeTitle + '" loading="lazy">',
        '<span class="year-badge">' + item.safeYear + '</span>',
        '<span class="play-dot">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<a class="movie-card-title" href="' + item.url + '">' + item.safeTitle + '</a>',
        '<p class="movie-card-meta">' + item.safeRegion + ' · ' + item.safeType + '</p>',
        '<p class="movie-card-desc">' + item.safeDesc + '</p>',
        '<div class="tag-row"><span>' + item.safeCategory + '</span><span>' + item.safeGenreShort + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function currentResults() {
      var q = textOf(input && input.value);
      var year = textOf(yearSelect && yearSelect.value);
      var type = textOf(typeSelect && typeSelect.value);
      var list = window.MovieSearchIndex.filter(function(item) {
        var haystack = textOf([item.title, item.year, item.genre, item.region, item.type, item.category].join(" "));
        var pass = true;

        if (q && haystack.indexOf(q) === -1) {
          pass = false;
        }

        if (year && textOf(item.year) !== year) {
          pass = false;
        }

        if (type && textOf(item.type).indexOf(type) === -1 && textOf(item.genre).indexOf(type) === -1) {
          pass = false;
        }

        return pass;
      });

      if (!q && !year && !type) {
        list = window.MovieSearchIndex.slice(0, 80);
      }

      return list.slice(0, 240);
    }

    function draw() {
      var list = currentResults();
      root.innerHTML = list.map(makeCard).join("");

      root.querySelectorAll("img").forEach(function(img) {
        img.addEventListener("error", function() {
          img.classList.add("image-missing");
        });
      });

      if (empty) {
        empty.style.display = list.length ? "none" : "block";
      }
    }

    [input, yearSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", draw);
        control.addEventListener("change", draw);
      }
    });

    draw();
  }

  renderSearch();
})();
