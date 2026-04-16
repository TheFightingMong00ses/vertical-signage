// rss.js — Displays 4 simultaneous ACM RSS feeds stacked in the RSS card
(function () {
  var FEEDS = [
    // Tom's Hardware main feed (includes all categories) - We can comment it out later, but I wanted to keep it for now. Call me sentimeental :)
    //{ url: "https://www.tomshardware.com/feeds/all",                                              label: "Tom's Hardware — All Categories" },
    // Begin ACM feeds
    {
      url: "https://cacm.acm.org/category/architecture-and-hardware/feed/",
      label: "ACM — Architecture and Hardware",
    },
    {
      url: "https://cacm.acm.org/category/artificial-intelligence-and-machine-learning/feed/",
      label: "ACM — Artificial Intelligence",
    },
    {
      url: "https://cacm.acm.org/category/computing-applications/feed/",
      label: "ACM — Computing Applications",
    },
    {
      url: "https://cacm.acm.org/category/computing-profession/feed/",
      label: "ACM — Computing Profession",
    },
    {
      url: "https://cacm.acm.org/category/data-science/feed/",
      label: "ACM — Data Science",
    },
    {
      url: "https://cacm.acm.org/category/education/feed/",
      label: "ACM — Education",
    },
    {
      url: "https://cacm.acm.org/category/hci/feed/",
      label: "ACM — Human-Computer Interaction",
    },
    {
      url: "https://cacm.acm.org/category/security-and-privacy/feed/",
      label: "ACM — Security and Privacy",
    },
    {
      url: "https://cacm.acm.org/category/society/feed/",
      label: "ACM — Society",
    },
    {
      url: "https://cacm.acm.org/category/software-engineering-and-programming-languages/feed/",
      label: "ACM — Software Engineering",
    },
    {
      url: "https://cacm.acm.org/category/systems-and-networking/feed/",
      label: "ACM — Systems and Networking",
    },
    {
      url: "https://cacm.acm.org/category/theory/feed/",
      label: "ACM — Theory of Computation",
    },
  ];

  var NUM_SLOTS = 4;
  var ROTATE_INTERVAL_MS = 8000; // rotate story every 8 seconds
  // Since Steve wanted the feed to move all the way through, the 10 minute refresh interval is no longer necessary.
  // var REFRESH_INTERVAL_MS = 10 * 60 * 1000;

  // Each slot tracks its own feed index, article list, article index, and timer
  var slots = [];
  for (var i = 0; i < NUM_SLOTS; i++) {
    slots.push({
      id: i,
      feedIndex: i % FEEDS.length, // spread starting points across the feed list
      articles: [],
      articleIndex: 0,
      rotateTimer: null,
    });
  }

  // ── RSS parsing helpers ────────────────────────────────────────────────────
  function parseRSS(xmlString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlString, "text/xml");
    var items = doc.querySelectorAll("item");
    var results = [];

    items.forEach(function (item) {
      var title = item.querySelector("title");
      var description = item.querySelector("description");
      var pubDate = item.querySelector("pubDate");
      var link = item.querySelector("link");

      results.push({
        title: title ? title.textContent.trim() : "No title",
        description: description
          ? stripHTML(description.textContent.trim()).substring(0, 160) + "…"
          : "",
        date: pubDate ? formatDate(pubDate.textContent.trim()) : "",
        link: link ? link.textContent.trim() : "#",
      });
    });

    return results;
  }

  function stripHTML(str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent || div.innerText || "";
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  }

  // ── DOM helpers ────────────────────────────────────────────────────────────
  function slotId(slotIdx, suffix) {
    return "vs-rss-slot-" + slotIdx + "-" + suffix;
  }

  function createRSSCard() {
    var existing = document.getElementById("vs-rss-card");
    if (existing) return existing;

    var signageColumn = document.getElementById("signage-column");
    if (!signageColumn) return null;

    var card = document.createElement("article");
    card.className = "vs-card vs-rss-card";
    card.id = "vs-rss-card";

    for (var i = 0; i < NUM_SLOTS; i++) {
      card.appendChild(createSlotDOM(i));
      if (i < NUM_SLOTS - 1) {
        var divider = document.createElement("div");
        divider.className = "vs-rss-slot-divider";
        card.appendChild(divider);
      }
    }

    signageColumn.appendChild(card);
    return card;
  }

  function createSlotDOM(slotIdx) {
    var wrapper = document.createElement("div");
    wrapper.className = "vs-rss-slot";
    wrapper.id = "vs-rss-slot-" + slotIdx;

    var label = document.createElement("div");
    label.className = "vs-card-title vs-rss-label";
    label.id = slotId(slotIdx, "label");
    label.innerHTML = '<span class="vs-rss-dot"></span> Loading\u2026';

    var heading = document.createElement("h2");
    heading.className = "vs-card-heading";
    heading.id = slotId(slotIdx, "heading");
    heading.textContent = "Loading\u2026";

    var body = document.createElement("p");
    body.className = "vs-card-body";
    body.id = slotId(slotIdx, "body");
    body.textContent = "";

    var meta = document.createElement("div");
    meta.className = "vs-rss-meta";
    meta.id = slotId(slotIdx, "meta");
    meta.textContent = "";

    var progress = document.createElement("div");
    progress.className = "vs-rss-progress vs-rss-progress-slot";
    progress.id = slotId(slotIdx, "progress");

    var bar = document.createElement("div");
    bar.className = "vs-rss-bar";
    bar.id = slotId(slotIdx, "bar");
    progress.appendChild(bar);

    var counter = document.createElement("div");
    counter.className = "vs-rss-counter vs-rss-counter-slot";
    counter.id = slotId(slotIdx, "counter");
    counter.textContent = "";

    var content = document.createElement("div");
    content.className = "vs-rss-content";
    content.id = slotId(slotIdx, "content");
    content.appendChild(heading);
    content.appendChild(body);
    content.appendChild(meta);

    wrapper.appendChild(label);
    wrapper.appendChild(content);
    wrapper.appendChild(progress);
    wrapper.appendChild(counter);

    return wrapper;
  }

  // -- Per-slot article display -----------------------------------------------
  function showArticle(slot) {
    if (!slot.articles.length) return;

    var article = slot.articles[slot.articleIndex];
    var slotEl  = document.getElementById("vs-rss-slot-" + slot.id);
    var content = document.getElementById(slotId(slot.id, "content"));
    var heading = document.getElementById(slotId(slot.id, "heading"));
    var body    = document.getElementById(slotId(slot.id, "body"));
    var meta    = document.getElementById(slotId(slot.id, "meta"));
    var counter = document.getElementById(slotId(slot.id, "counter"));

    if (!heading || !body) return;

    // 1. Fade out content
    if (content) content.style.opacity = "0";

    // 2. After fade completes, swap content, measure new height, animate slot
    setTimeout(function () {
      heading.textContent = article.title;
      body.textContent    = article.description;
      meta.textContent    = article.date;
      counter.textContent = slot.articleIndex + 1 + " / " + slot.articles.length;

      if (slotEl) {
        // Lock to current rendered height
        var currentHeight = slotEl.offsetHeight;
        slotEl.style.height = currentHeight + "px";

        requestAnimationFrame(function () {
          // Temporarily release to measure natural height with new content
          slotEl.style.height = "auto";
          var targetHeight = slotEl.scrollHeight + "px";

          // Re-lock so the transition has a defined start point
          slotEl.style.height = currentHeight + "px";

          // Kick off the smooth height animation on the next paint
          requestAnimationFrame(function () {
            slotEl.style.height = targetHeight;

            // 3. Fade content back in slightly after height animation begins
            setTimeout(function () {
              if (content) content.style.opacity = "1";
              startProgressBar(slot.id);
            }, 120);
          });
        });
      } else {
        if (content) content.style.opacity = "1";
        startProgressBar(slot.id);
      }
    }, 550); // match CSS opacity transition duration (0.55s)
  }

  function startProgressBar(slotIdx) {
    var bar = document.getElementById(slotId(slotIdx, "bar"));
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    setTimeout(function () {
      bar.style.transition = "width " + ROTATE_INTERVAL_MS + "ms linear";
      bar.style.width = "100%";
    }, 30);
  }

  function startRotation(slot) {
    if (slot.rotateTimer) clearInterval(slot.rotateTimer);
    showArticle(slot);

    slot.rotateTimer = setInterval(function () {
      slot.articleIndex++;

      if (slot.articleIndex >= slot.articles.length) {
        // Done with this feed — move to the next one
        slot.articleIndex = 0;
        slot.feedIndex = (slot.feedIndex + 1) % FEEDS.length;
        fetchFeedForSlot(slot);
      } else {
        showArticle(slot);
      }
    }, ROTATE_INTERVAL_MS);
  }

  // ── Per-slot fetch ─────────────────────────────────────────────────────────
  function fetchFeedForSlot(slot) {
    if (slot.rotateTimer) {
      clearInterval(slot.rotateTimer);
      slot.rotateTimer = null;
    }

    var feed = FEEDS[slot.feedIndex];
    var PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(feed.url);

    var label = document.getElementById(slotId(slot.id, "label"));
    if (label)
      label.innerHTML =
        '<span class="vs-rss-dot"></span> Loading ' + feed.label + "\u2026";

    fetch(PROXY_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Network error");
        return res.text();
      })
      .then(function (data) {
        var parsed = parseRSS(data);
        if (parsed.length === 0) throw new Error("No articles found");

        slot.articles = parsed;
        slot.articleIndex = 0;

        var lbl = document.getElementById(slotId(slot.id, "label"));
        if (lbl)
          lbl.innerHTML = '<span class="vs-rss-dot"></span> ' + feed.label;

        startRotation(slot);
      })
      .catch(function (err) {
        console.error("RSS fetch failed for slot " + slot.id + ":", err);
        var heading = document.getElementById(slotId(slot.id, "heading"));
        if (heading) heading.textContent = "Could not load feed. Trying next\u2026";

        // Advance to the next feed and retry after a short delay
        slot.feedIndex = (slot.feedIndex + 1) % FEEDS.length;
        setTimeout(function () { fetchFeedForSlot(slot); }, 3000);
      });
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  createRSSCard();

  slots.forEach(function (slot) {
    fetchFeedForSlot(slot);
  });
})();
