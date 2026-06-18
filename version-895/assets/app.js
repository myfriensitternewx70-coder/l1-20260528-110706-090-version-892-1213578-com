(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function() {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function bindSearchForms() {
    document.querySelectorAll(".search-form").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function filterCards(container, query) {
    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
    var value = normalize(query);
    var visible = 0;
    cards.forEach(function(card) {
      var text = normalize(card.getAttribute("data-text"));
      var matched = !value || text.indexOf(value) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector(".empty-state");
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function sortCards(container, mode) {
    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
    cards.sort(function(a, b) {
      if (mode === "year-desc") {
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      }
      if (mode === "year-asc") {
        return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
      }
      if (mode === "title-asc") {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      }
      return 0;
    });
    cards.forEach(function(card) {
      container.appendChild(card);
    });
  }

  function bindListTools() {
    var container = document.querySelector(".list-container");
    if (!container) {
      return;
    }
    var input = document.querySelector(".category-filter");
    var select = document.querySelector(".sort-select");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && input.classList.contains("search-query")) {
      input.value = query;
    }
    if (input) {
      filterCards(container, input.value);
      input.addEventListener("input", function() {
        filterCards(container, input.value);
      });
    }
    if (select) {
      select.addEventListener("change", function() {
        sortCards(container, select.value);
        if (input) {
          filterCards(container, input.value);
        }
      });
    }
  }

  ready(function() {
    bindMenu();
    bindSearchForms();
    bindListTools();
  });
})();
