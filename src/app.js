// Basic vertical signage logic using plain JavaScript.
// Reads configuration from config/config.json and renders "cards" vertically.
import { initRSS } from "./rss.js";
import { initWeather, refreshWeather } from "./weather.js";
import { initClock } from "./clock.js";
var signageColumn = document.getElementById("signage-column");
var statusEl = document.getElementById("vs-status");

if (!signageColumn) {
  throw new Error("signage-column not found");
}

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
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

function startRefreshCycle(config) {
  const intervalMs = config.displaySettings.refreshMinutes * 60 * 1000;

  setInterval(function () {
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
      setStatus("Config loaded");
      const weatherConfig = config.widgets.find((w) => w.type === "weather");
      const clockConfig = config.widgets.find((w) => w.type === "clock");
      const rssConfig = config.widgets.find((w) => w.type === "rss");

      if (weatherConfig) initWeather(weatherConfig.lat, weatherConfig.lon);
      if (clockConfig) initClock(clockConfig);
      if (rssConfig) initRSS();
    })
    .catch(function (error) {
      console.error("Failed to load config:", error);
      setStatus("Failed to load config. See console.");
    });
}

loadConfig();
