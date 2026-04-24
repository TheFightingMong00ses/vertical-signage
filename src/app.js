// Basic vertical signage logic using plain JavaScript.
// Reads configuration from config/config.json and renders "cards" vertically.
import { initRSS } from "./rss.js";
import { initWeather } from "./weather.js";
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
        const weatherConfig = config.widgets.find(w => w.type === "weather");
        const rssConfig = config.widgets.find(w => w.type === "rss");
    
        if (weatherConfig) initWeather(weatherConfig.lat, weatherConfig.lon);
        if (rssConfig) initRSS();
      })
      .catch(function (error) {
        console.error("Failed to load config:", error);
        setStatus("Failed to load config. See console.");
        
      });
  }

  loadConfig();
