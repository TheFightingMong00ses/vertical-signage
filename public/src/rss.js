// rss.js — Displays 4 simultaneous ACM RSS feeds stacked in the RSS card

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
var ROTATE_INTERVAL_MS = 10000; // rotate story every 10 seconds
// Since Steve wanted the feed to move all the way through, the 10 minute refresh interval is no longer necessary.
// var REFRESH_INTERVAL_MS = 10 * 60 * 1000;
var feedCache = {};
var CACHE_TTL_MS = 10*60*1000;

// Each slot tracks its own feed index, article list, article index, and timer
var slots = [];
for (var i = 0; i < NUM_SLOTS; i++) {
  slots.push({
    id: i,
    feedIndex: i % FEEDS.length, // spread starting points across the feed list
    articles: [],
    articleIndex: 0,
    rotateTimer: null,
    retryCount:0
  });
}

// ── Feed-index cycling ─────────────────────────────────────────────────────
// Returns the next feed index after `currentIndex` that is not already
// assigned to another slot, so no source repeats within a full cycle.
// If every feed is already in use (more slots than feeds), it falls back to
// simple round-robin to avoid an infinite loop.
function nextUnusedFeedIndex(currentIndex, excludeSlotId) {
  var usedIndexes = {};
  for (var i = 0; i < slots.length; i++) {
    if (slots[i].id !== excludeSlotId) {
      usedIndexes[slots[i].feedIndex] = true;
    }
  }

  var candidate = (currentIndex + 1) % FEEDS.length;
  var checked = 0;
  while (usedIndexes[candidate] && checked < FEEDS.length) {
    candidate = (candidate + 1) % FEEDS.length;
    checked++;
  }
  return candidate;
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
  var signageColumn = document.getElementById("signage-column");
  if (!signageColumn) return null;

  var existing = document.getElementById("vs-rss-card");
  if (existing) {
    // Always re-append to guarantee it stays at the bottom of the column
    signageColumn.appendChild(existing);
    return existing;
  }

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

  var qr = document.createElement("img");
  qr.className = "vs-rss-qr";
  qr.id = slotId(slotIdx, "qr");
  qr.alt = "QR code";
  qr.style.cssText = "flex-shrink:0;width:80px;height:80px;align-self:center;border-radius:4px;display:none;";

  var textCol = document.createElement("div");
  textCol.style.cssText = "flex:1;min-width:0;";
  textCol.appendChild(heading);
  textCol.appendChild(body);
  textCol.appendChild(meta);

  var content = document.createElement("div");
  content.className = "vs-rss-content";
  content.id = slotId(slotIdx, "content");
  content.style.cssText = "display:flex;align-items:flex-start;gap:0.75rem;transition:opacity 0.55s ease;";
  content.appendChild(textCol);
  content.appendChild(qr);

  wrapper.appendChild(label);
  wrapper.appendChild(content);
  wrapper.appendChild(progress);
  wrapper.appendChild(counter);

  return wrapper;
}

// -- QR code rendering ------------------------------------------------------
function renderQR(slotIdx, url) {
  var img = document.getElementById(slotId(slotIdx, "qr"));
  if (!img) return;
  if (!url || url === "#") {
    img.style.display = "none";
    img.src = "";
    return;
  }
  img.onload = function () { img.style.display = "block"; };
  img.onerror = function () { img.style.display = "none"; };
  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=80x80&ecc=M&data=" +
    encodeURIComponent(url);
}

// -- Per-slot article display -----------------------------------------------
function showArticle(slot) {
  if (!slot.articles.length) return;

  var article = slot.articles[slot.articleIndex];
  var slotEl = document.getElementById("vs-rss-slot-" + slot.id);
  var content = document.getElementById(slotId(slot.id, "content"));
  var heading = document.getElementById(slotId(slot.id, "heading"));
  var body = document.getElementById(slotId(slot.id, "body"));
  var meta = document.getElementById(slotId(slot.id, "meta"));
  var counter = document.getElementById(slotId(slot.id, "counter"));

  if (!heading || !body) return;

  // On the very first article ever, skip the fade+height animation entirely.
  // The slot only has "Loading\u2026" placeholder text so there's nothing valid
  // to animate from \u2014 attempting it causes startup jank.
  //
  // hasShownFirst is reset to false on fetch error/retry, but hasRenderedOnce
  // stays true permanently once a real article has painted. On a retry the
  // slot already has real content and a valid height, so we fall through to
  // the normal animated transition instead of snapping in.
  if (!slot.hasShownFirst && !slot.hasRenderedOnce) {
    slot.hasShownFirst = true;
    slot.hasRenderedOnce = true;
    heading.textContent = article.title;
    body.textContent = article.description;
    meta.textContent = article.date;
    counter.textContent = slot.articleIndex + 1 + " / " + slot.articles.length;
    renderQR(slot.id, article.link);

    if (slotEl) {
      // Disable ALL transitions on both the slot and content so we can
      // measure and set values without any animation interference.
      slotEl.style.transition = "none";
      slotEl.style.height = "auto";
      if (content) {
        content.style.transition = "none";
        content.style.opacity = "0";
      }

      requestAnimationFrame(function () {
        slotEl.style.height = slotEl.scrollHeight + "px";
        requestAnimationFrame(function () {
          setTimeout(function () {
            // Re-enable transitions, then fade content in on the next frame
            // so the browser picks up the transition before opacity changes.
            slotEl.style.transition = "";
            if (content) content.style.transition = "opacity 0.55s ease";
            requestAnimationFrame(function () {
              if (content) content.style.opacity = "1";
              startProgressBar(slot.id);
              if (slot.onFirstPaintDone) slot.onFirstPaintDone();
            });
          }, 50);
        });
      });
    } else {
      if (content) content.style.opacity = "1";
      startProgressBar(slot.id);
      if (slot.onFirstPaintDone) slot.onFirstPaintDone();
    }

    return;
  }

  // Mark first paint done — covers both the normal second-article path and
  // the retry-with-existing-height path that bypassed the cold-start branch.
  slot.hasShownFirst = true;

  // 1. Fade out content — skip the wait if it's already invisible (e.g. the
  // fetch success handler pre-faded it before calling startRotation).
  var alreadyHidden = content && content.style.opacity === "0";
  if (content) content.style.opacity = "0";

  // 2. After fade completes (or immediately if already hidden), swap content,
  // measure new height, animate slot.
  var swapDelay = alreadyHidden ? 0 : 550;
  setTimeout(function () {
    heading.textContent = article.title;
    body.textContent = article.description;
    meta.textContent = article.date;
    counter.textContent = slot.articleIndex + 1 + " / " + slot.articles.length;
    renderQR(slot.id, article.link);

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
  }, swapDelay); // 550ms to match fade, or 0 if content was pre-faded
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
      // Done with this feed — move to the next one not already showing
      slot.articleIndex = 0;
      slot.feedIndex = nextUnusedFeedIndex(slot.feedIndex, slot.id);
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
  var label = document.getElementById(slotId(slot.id, "label"));

  if (label)
    label.innerHTML =
      '<span class="vs-rss-dot"></span> Loading ' + feed.label + "\u2026";
  

    var cached = feedCache[feed.url];
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      slot.articles = cached.articles;
      slot.articleIndex = 0;
      var lbl = document.getElementById((slotId(slot.id, "label")));
      if (lbl) lbl.innerHTML = `<span class="vs-rss-dot"></span> ` + feed.label;
      startRotation(slot);
      return;
    }
    var PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(feed.url);
  
    fetch(PROXY_URL)
      .then(function (res) {
      if (!res.ok) throw new Error("Network error");
      return res.text();
    })
    .then(function (data) {
      var parsed = parseRSS(data);
      if (parsed.length === 0) throw new Error("No articles found");

      feedCache[feed.url] = { articles: parsed, time: Date.now()};
      slot.retryCount = 0;
      slot.articles = parsed;
      slot.articleIndex = 0;

      var lbl = document.getElementById(slotId(slot.id, "label"));
      if (lbl) lbl.innerHTML = '<span class="vs-rss-dot"></span> ' + feed.label;

      // If this is a retry (hasRenderedOnce is true), the content is currently
      // showing the error message at some unknown opacity. Force it to opacity 1
      // first, then let it fade to 0, so showArticle's normal transition has a
      // defined visible start state to animate from instead of snapping in.
      if (slot.hasRenderedOnce) {
        var contentEl = document.getElementById(slotId(slot.id, "content"));
        if (contentEl) {
          contentEl.style.opacity = "1";
          requestAnimationFrame(function () {
            contentEl.style.opacity = "0";
            setTimeout(function () {
              startRotation(slot);
            }, 550);
          });
        } else {
          startRotation(slot);
        }
      } else {
        startRotation(slot);
      }
    })
    .catch(function (err) {
      console.error("RSS fetch failed for slot " + slot.id + ":", err);

<<<<<<< HEAD
      var content = document.getElementById(slotId(slot.id, "content"));
      var heading = document.getElementById(slotId(slot.id, "heading"));
      var body = document.getElementById(slotId(slot.id, "body"));
      var meta = document.getElementById(slotId(slot.id, "meta"));

      // Fade out, swap in the error message, fade back in.
      if (content) content.style.opacity = "0";
      setTimeout(function () {
        if (heading) heading.textContent = "Could not load feed. Trying next\u2026";
        if (body) body.textContent = "";
        if (meta) meta.textContent = "";
        renderQR(slot.id, null);
        if (content) content.style.opacity = "1";

        // Reset hasShownFirst so the retry can re-enter the normal animated
        // path (the cold-start branch is skipped because the slot already has
        // a real height, so the transition will be smooth either way).
        slot.hasShownFirst = false;
        slot.feedIndex = nextUnusedFeedIndex(slot.feedIndex, slot.id);
        setTimeout(function () {
          fetchFeedForSlot(slot);
        }, 3000);
      }, 550);
    });
}
export function initRSS() {
  var card = createRSSCard();

  // Start invisible — fade in as soon as the first slot has painted,
  // so the user sees content as early as possible rather than waiting
  // for all four fetches to complete.
  if (card) {
    card.style.transition = "opacity 0.6s ease";
    card.style.opacity = "0";
  }

  var hasRevealed = false;
  slots.forEach(function (slot) {
    slot.onFirstPaintDone = function () {
      if (!hasRevealed && card) {
        hasRevealed = true;
        requestAnimationFrame(function () {
          card.style.opacity = "1";
        });
      }
    };
    fetchFeedForSlot(slot);
=======
      // Advance to the next feed and retry after a short delay
      slot.feedIndex = (slot.feedIndex +1)% FEEDS.length;

      slot.retryCount = (slot.retryCount || 0) + 1;
      var retryDelay = Math.min(3000 * slot.retryCount, 60000);

      setTimeout(function () {
        fetchFeedForSlot(slot);
      }, retryDelay);
    });
}
export function initRSS() {
  createRSSCard();

    if (card){
      card.transition = "opacity 0.6s ease";
      card.style.opacity = "0";
    }

    var hasRevealed = false;
  

  slots.forEach(function (slot, index) {
    slot.onFirstPaintDone = function () {
      if (!hasRevealed && card) {
        hasRevealed = true;
        requestAnimationFrame(function ( {
          card.style.opacity = "1";
        }));
      }
    }
    setTimeout(function () {
      fetchFeedForSlot(slot);
    }, index * 1500); // 1.5 second gap between each slot

  });
}
