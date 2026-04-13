// rss.js — Fetches Tom's Hardware RSS feed and rotates stories as a card

(function () {
  var RSS_URL = "https://www.tomshardware.com/feeds/all";
  var PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(RSS_URL);
  var ROTATE_INTERVAL_MS = 8000; // rotate story every 8 seconds
  var REFRESH_INTERVAL_MS = 10 * 60 * 1000; // re-fetch feed every 10 minutes

  var articles = [];
  var currentIndex = 0;
  var rotateTimer = null;

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

  function getRSSCard() {
    return document.getElementById("vs-rss-card");
  }

  function createRSSCard() {
    var existing = getRSSCard();
    if (existing) return existing;

    var signageColumn = document.getElementById("signage-column");
    if (!signageColumn) return null;

    var card = document.createElement("article");
    card.className = "vs-card vs-rss-card";
    card.id = "vs-rss-card";

    var label = document.createElement("div");
    label.className = "vs-card-title vs-rss-label";
    label.innerHTML = '<span class="vs-rss-dot"></span> Tom\'s Hardware — Live Feed';

    var heading = document.createElement("h2");
    heading.className = "vs-card-heading";
    heading.id = "vs-rss-heading";
    heading.textContent = "Loading…";

    var body = document.createElement("p");
    body.className = "vs-card-body";
    body.id = "vs-rss-body";
    body.textContent = "";

    var meta = document.createElement("div");
    meta.className = "vs-rss-meta";
    meta.id = "vs-rss-meta";
    meta.textContent = "";

    var progress = document.createElement("div");
    progress.className = "vs-rss-progress";
    progress.id = "vs-rss-progress";

    var bar = document.createElement("div");
    bar.className = "vs-rss-bar";
    bar.id = "vs-rss-bar";
    progress.appendChild(bar);

    var counter = document.createElement("div");
    counter.className = "vs-rss-counter";
    counter.id = "vs-rss-counter";
    counter.textContent = "";

    card.appendChild(label);
    card.appendChild(heading);
    card.appendChild(body);
    card.appendChild(meta);
    card.appendChild(progress);
    card.appendChild(counter);

    signageColumn.appendChild(card);
    return card;
  }

  function showArticle(index) {
    if (!articles.length) return;

    var article = articles[index];
    var heading = document.getElementById("vs-rss-heading");
    var body = document.getElementById("vs-rss-body");
    var meta = document.getElementById("vs-rss-meta");
    var counter = document.getElementById("vs-rss-counter");
    var card = getRSSCard();

    if (!heading || !body) return;

    // Fade out
    if (card) card.style.opacity = "0.4";

    setTimeout(function () {
      heading.textContent = article.title;
      body.textContent = article.description;
      meta.textContent = article.date;
      counter.textContent = (index + 1) + " / " + articles.length;

      // Fade in
      if (card) card.style.opacity = "1";

      // Restart progress bar animation
      startProgressBar();
    }, 300);
  }

  function startProgressBar() {
    var bar = document.getElementById("vs-rss-bar");
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    setTimeout(function () {
      bar.style.transition = "width " + ROTATE_INTERVAL_MS + "ms linear";
      bar.style.width = "100%";
    }, 30);
  }

  function startRotation() {
    if (rotateTimer) clearInterval(rotateTimer);
    showArticle(currentIndex);

    rotateTimer = setInterval(function () {
      currentIndex = (currentIndex + 1) % articles.length;
      showArticle(currentIndex);
    }, ROTATE_INTERVAL_MS);
  }

  function fetchFeed() {
    fetch(PROXY_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Network error");
        return res.text();
      })
      .then(function (data) {
        var parsed = parseRSS(data);
        if (parsed.length === 0) throw new Error("No articles found");

        articles = parsed;
        currentIndex = 0;

        createRSSCard();
        startRotation();
      })
      .catch(function (err) {
        console.error("RSS fetch failed:", err);
        var card = createRSSCard();
        var heading = document.getElementById("vs-rss-heading");
        if (heading) heading.textContent = "Could not load feed. Retrying…";
      });
  }

  // Initial fetch, then refresh every 10 minutes
  fetchFeed();
  setInterval(fetchFeed, REFRESH_INTERVAL_MS);
})();
