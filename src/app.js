// Basic vertical signage logic using plain JavaScript.
// Reads configuration from config/config.json and renders "cards" vertically.

(function () {
  var signageColumn = document.getElementById("signage-column");
  var statusEl = document.getElementById("vs-status");

  if (!signageColumn) {
    return;
  }

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function createCard(item) {
    var card = document.createElement("article");
    card.className = "vs-card";

    var title = document.createElement("div");
    title.className = "vs-card-title";
    title.textContent = item.section || "Announcement";

    var heading = document.createElement("h2");
    heading.className = "vs-card-heading";
    heading.textContent = item.title || "";

    var body = document.createElement("p");
    body.className = "vs-card-body";
    body.textContent = item.body || "";

    card.appendChild(title);
    card.appendChild(heading);
    card.appendChild(body);

    if (Array.isArray(item.tags) && item.tags.length > 0) {
      var chipRow = document.createElement("div");
      chipRow.className = "vs-chip-row";

      item.tags.forEach(function (tag) {
        var chip = document.createElement("span");
        chip.className = "vs-chip";
        chip.textContent = tag;
        chipRow.appendChild(chip);
      });

      card.appendChild(chipRow);
    }

    return card;
  }

  function renderItems(items) {
    // Remove only the config-driven cards, not cards added by other scripts
    var existing = signageColumn.querySelectorAll(".vs-card:not(.vs-rss-card)");
    existing.forEach(function (el) {
      el.remove();
    });

    if (!items || items.length === 0) {
      var empty = document.createElement("p");
      empty.className = "vs-card-body";
      empty.textContent = "No signage items configured yet.";
      signageColumn.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      var card = createCard(item);
      signageColumn.appendChild(card);
    });
  }

  function applyDisplaySettings(settings) {
    if (!settings) return;

    if (typeof settings.fontScale === "number") {
      document.documentElement.style.setProperty(
        "--vs-font-scale",
        String(settings.fontScale),
      );
    }
  }

  function loadConfig() {
    setStatus("Loading configuration…");

    fetch("../config/config.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (config) {
        applyDisplaySettings(config.displaySettings);
        renderItems(config.items);
        setStatus("Config loaded (" + (config.items || []).length + " items)");
      })
      .catch(function (error) {
        console.error("Failed to load config:", error);
        setStatus("Failed to load config. See console.");
        renderItems([]);
      });
  }

  loadConfig();
})();
