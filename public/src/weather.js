// build the API URL with the coordinates
export function buildWeatherAPIUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,apparent_temperature,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
}
//Handles the API respnse calls and returns the used api as an object
export async function fetchUrl(url) {
  const response = await fetch(url);
  const apiData = await response.json();
  return formatWeatherData(apiData);
}
// fetch the weather data and convert to json object
export function formatWeatherData(apiData) {
  const current = apiData.current || {};

  return {
    timeZone: apiData.timezone ?? null,
    temperature: current.temperature_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    windDirection:
      current.wind_direction_10m != null
        ? String(current.wind_direction_10m)
        : null,
    weatherCode: current.weathercode ?? current.weather_code ?? null,
    apparentTemperature: current.apparent_temperature ?? null,
  };
}

//
function getWindDirection(weatherData) {
  const windAngle = weatherData.windDirection;
  if (windAngle == null) return "N/A";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const index = Math.round(windAngle / 45) % 8;
  return directions[index];
}

// Map weather codes to icons
const weatherIcons = {
  0: "☀️", // clear sky
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  61: "🌧️",
  71: "❄️",
  95: "⛈️",
};

// Get the appropriate icon for a given weather code
function getWeatherIcon(weatherCode) {
  return weatherIcons[weatherCode] || "❓";
}

// Render a weather card with the provided data
function renderWeatherCard(weatherData, windDegree) {
  const card = document.createElement("div");
  card.className = "weather-card";
  const icon = weatherIcons[weatherData.weatherCode] || "❓";

  card.innerHTML = `
    <h2 id="weather-heading">${icon}${weatherData.temperature ?? "N/A"}°F</h2>
    <small id="weather-timezone">${weatherData.timeZone ?? "N/A"}</small>
    <p id="weather-feels">Feels like: ${weatherData.apparentTemperature ?? "N/A"}°F</p>
    <p id="weather-wind">${weatherData.windSpeed ?? "N/A"} mph ${windDegree ?? "N/A"}</p>`;

  return card;
}

export async function initWeather(lat, lon) {
  const url = buildWeatherAPIUrl(lat, lon);
  const formattedData = await fetchUrl(url);
  const icon = getWeatherIcon(formattedData.weatherCode);
  const windDegree = getWindDirection(formattedData);
  const card = renderWeatherCard(formattedData, windDegree, icon);

  const signageColumn = document.getElementById("signage-column");
  if (signageColumn) {
    signageColumn.prepend(card);
  }
}

export async function refreshWeather(lat, lon) {
  const url = buildWeatherAPIUrl(lat, lon);
  const formattedData = await fetchUrl(url);
  const windDegree = getWindDirection(formattedData);
  const icon = weatherIcons[formattedData.weatherCode] || "❓";

  const heading = document.getElementById("weather-heading");
  const timezone = document.getElementById("weather-timezone");
  const feels = document.getElementById("weather-feels");
  const wind = document.getElementById("weather-wind");

  if (heading)
    heading.textContent = `${icon}${formattedData.temperature ?? "N/A"}°F`;
  if (timezone) timezone.textContent = formattedData.timeZone ?? "N/A";
  if (feels)
    feels.textContent = `Feels like: ${formattedData.apparentTemperature ?? "N/A"}°F`;
  if (wind)
    wind.textContent = `${formattedData.windSpeed ?? "N/A"} mph ${windDegree ?? "N/A"}`;
}
