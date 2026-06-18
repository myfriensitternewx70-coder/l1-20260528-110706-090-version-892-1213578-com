(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var heroButtons = Array.prototype.slice.call(document.querySelectorAll("[data-hero-button]"));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function(slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });

    heroButtons.forEach(function(button, i) {
      button.classList.toggle("is-active", i === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer || heroSlides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function() {
      showHero(heroIndex + 1);
    }, 5200);
  }

  heroButtons.forEach(function(button, i) {
    button.addEventListener("click", function() {
      showHero(i);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHero();
    });
  });

  showHero(0);
  startHero();

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function matchCard(card, query, year, type, region) {
    var haystack = [
      card.dataset.title,
      card.dataset.tags,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.category
    ].map(normalize).join(" ");

    if (query && haystack.indexOf(query) === -1) {
      return false;
    }

    if (year && normalize(card.dataset.year).indexOf(year) === -1) {
      return false;
    }

    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
      return false;
    }

    if (region && normalize(card.dataset.region).indexOf(region) === -1) {
      return false;
    }

    return true;
  }

  Array.prototype.slice.call(document.querySelectorAll(".filter-scope")).forEach(function(scope) {
    var input = scope.querySelector("[data-search-input]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var regionSelect = scope.querySelector("[data-filter-region]");
    var reset = scope.querySelector("[data-reset-filter]");
    var count = scope.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty-state]");

    function applyFilter() {
      var query = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var visible = 0;

      cards.forEach(function(card) {
        var matched = matchCard(card, query, year, type, region);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.innerHTML = "已显示 <strong>" + visible + "</strong> 条";
      }

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, yearSelect, typeSelect, regionSelect].forEach(function(node) {
      if (node) {
        node.addEventListener("input", applyFilter);
        node.addEventListener("change", applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener("click", function() {
        if (input) {
          input.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  });
})();
