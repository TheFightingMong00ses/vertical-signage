// Basic vertical signage logic using plain JavaScript.
// Reads configuration from config/config.json and renders "cards" vertically.
import { initRSS } from "./rss.js";
import { initWeather, refreshWeather } from "./weather.js";
import { initClock } from "./clock.js";

var signageColumn = document.getElementById("signage-column");
var statusEl = document.getElementById("vs-status");

const API_KEY = 'AIzaSyA5P7oin4sIt9YIF2duHNnEzKSMTTcDXM0';
const CALENDAR_ID = '822f45b9a5bfd09202fefbe67cf78a0d96861e6ec514f4978c864e5a570f56fd@group.calendar.google.com';

  // -- Helper functions
if (!signageColumn) {
  throw new Error("signage-column not found");
}

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function toLocalDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// -- Config cards

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
      document.dispatchEvent(new CustomEvent("vs:config-rendered"));
      setTimeout(setupCalendar, 0);
      return;
    }

    items.forEach(function (item) {
      var card = createCard(item);
      signageColumn.appendChild(card);
    });

    // Signal that config cards have been rendered so other scripts can
    // position themselves after them (e.g. the RSS card stays at the bottom).
    document.dispatchEvent(new CustomEvent("vs:config-rendered"));
     setTimeout(setupCalendar, 0);
  }

// -- Calendar

async function displayWeekView() {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Build all 7 days upfront regardless of events
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = toLocalDateKey(d);
    days[key] = []; // start empty, events will fill in if they exist
  }

  // Fetch events and slot them into the correct day
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true&timeMin=${now.toISOString()}&timeMax=${weekEnd.toISOString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      data.items.forEach(event => {
        const date = (event.start.dateTime || event.start.date).split('T')[0];
        if (days[date] !== undefined) {
          days[date].push(event);
        }
      });
    }
  } catch (err) {
    console.error('Calendar fetch failed:', err);
    // Continue rendering — days will just show as empty
  }

  // Render every day
  const container = document.getElementById('calendar');
  container.innerHTML = '';

  // Create the grid wrapper
  const grid = document.createElement('div');
  grid.className = 'vs-calendar-grid';

  Object.entries(days).forEach(([date, events]) => {
    const isToday = date === toLocalDateKey(now);
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    const col = document.createElement('div');
    col.className = 'vs-calendar-col' + (isToday ? ' vs-calendar-today' : '');
     // Day header
    const header = document.createElement('div');
    header.className = 'vs-calendar-col-header';

    const dayName = document.createElement('span');
    dayName.className = 'vs-calendar-dayname';
    dayName.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    const dayNum = document.createElement('span');
    dayNum.className = 'vs-calendar-daynum' + (isToday ? ' vs-calendar-daynum-today' : '');
    dayNum.textContent = dateObj.getDate();

    header.appendChild(dayName);
    header.appendChild(dayNum);
    col.appendChild(header);

    // Events
    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'vs-calendar-empty';
      empty.textContent = '';
      col.appendChild(empty);
    } else {
      events.forEach(e => {
        const event = document.createElement('div');
        event.className = 'vs-calendar-event';

        const startTime = e.start.dateTime
          ? new Date(e.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : 'All Day';

        event.textContent = `${startTime} ${e.summary}`;
        col.appendChild(event);
      });
    }
    grid.appendChild(col);
  });
container.appendChild(grid);
}

function setupCalendar(){
  const rssCard = signageColumn.querySelector('.vs-rss-card');

  const calendarCard = document.createElement('div');
  calendarCard.id = 'calendar';
  calendarCard.className = 'vs-card';

  if (rssCard){
    signageColumn.insertBefore(calendarCard, rssCard);
  } else {
    signageColumn.appendChild(calendarCard);
  }

  displayWeekView();
  setInterval(displayWeekView, 5 * 60 * 1000);
}

// -- Config load
function applyDisplaySettings(settings) {
  if (!settings) return;
  if (typeof settings.fontScale === "number") {
    document.documentElement.style.setProperty(
      "--vs-font-scale",
      String(settings.fontScale),
    );
  }
}

function startRefreshCycle(config) {
  const intervalMs = (config.displaySettings?.refreshMinutes ?? 10) * 60 * 1000;

  setInterval(function () {
    const widgets = config.widgets ?? [];
    const weatherConfig = config.widgets.find((w) => w.type === "weather");
    if (weatherConfig) refreshWeather(weatherConfig.lat, weatherConfig.lon);
  }, intervalMs);
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

      setStatus("Config loaded");

      const widgets= config.widgets ?? [];

      const weatherConfig = widgets.find((w) => w.type === "weather");
      const clockConfig = widgets.find((w) => w.type === "clock");
      const rssConfig = widgets.find((w) => w.type === "rss");


  // Clock — prepends to top of column
      const clockConfig = config.widgets && config.widgets.find((w) => w.type === "clock");
      if (clockConfig) initClock(clockConfig);

  // Weather
      const weatherConfig = config.widgets && config.widgets.find((w) => w.type === "weather");
      if (weatherConfig) {
        initWeather(weatherConfig.lat, weatherConfig.lon);
        startRefreshCycle(config);
      }

  // RSS and calendar via setTimeout so they land below
      setTimeout(function() {
       initRSS();
     }, 0);
})
    .catch(function (error) {
      console.error("Failed to load config:", error);
      setStatus("Failed to load config. See console.");
      renderItems([]);
    });
}

loadConfig();
