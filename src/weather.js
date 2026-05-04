// weather.js — fetches and displays weather in the hero section

export function buildWeatherAPIUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,apparent_temperature,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
}

export async function fetchUrl(url) {
  const response = await fetch(url);
  const apiData  = await response.json();
  return formatWeatherData(apiData);
}

export function formatWeatherData(apiData) {
  const current = apiData.current || {};
  return {
    timeZone:            apiData.timezone ?? null,
    temperature:         current.temperature_2m ?? null,
    windSpeed:           current.wind_speed_10m ?? null,
    windDirection:       current.wind_direction_10m != null ? String(current.wind_direction_10m) : null,
    weatherCode:         current.weathercode ?? current.weather_code ?? null,
    apparentTemperature: current.apparent_temperature ?? null,
  };
}

function getWindDirection(weatherData) {
  const windAngle = weatherData.windDirection;
  if (windAngle == null) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(windAngle / 45) % 8];
}

const weatherIcons = {
  0:  '☀️',  // Clear sky
  1:  '🌤️', // Mainly clear
  2:  '⛅',  // Partly cloudy
  3:  '☁️',  // Overcast
  45: '🌫️', // Fog
  48: '🌫️', // Icy fog
  51: '🌦️', // Light drizzle
  53: '🌦️', // Moderate drizzle
  55: '🌧️', // Dense drizzle
  61: '🌧️', // Slight rain
  63: '🌧️', // Moderate rain
  65: '🌧️', // Heavy rain
  71: '❄️',  // Slight snow
  73: '❄️',  // Moderate snow
  75: '❄️',  // Heavy snow
  77: '🌨️', // Snow grains
  80: '🌦️', // Slight showers
  81: '🌧️', // Moderate showers
  82: '🌧️', // Violent showers
  85: '🌨️', // Slight snow showers
  86: '🌨️', // Heavy snow showers
  95: '⛈️', // Thunderstorm
  96: '⛈️', // Thunderstorm with hail
  99: '⛈️', // Thunderstorm with heavy hail
};

function getWeatherIcon(weatherCode) {
  return weatherIcons[weatherCode] || '❓';
}

function renderWeatherCard(weatherData, windDegree) {
  const card = document.createElement('div');
  card.className = 'weather-card';
  const icon = weatherIcons[weatherData.weatherCode] || '❓';

  card.innerHTML = `
    <div class="vs-card-title">Weather</div>
    <h2 id="weather-heading">${icon} ${weatherData.temperature ?? 'N/A'}°F</h2>
    <small id="weather-timezone">${weatherData.timeZone ?? 'N/A'}</small>
    <p id="weather-feels">Feels like: ${weatherData.apparentTemperature ?? 'N/A'}°F</p>
    <p id="weather-wind">${weatherData.windSpeed ?? 'N/A'} mph ${windDegree ?? 'N/A'}</p>
  `;

  return card;
}

export async function initWeather(lat, lon) {
  const url           = buildWeatherAPIUrl(lat, lon);
  const formattedData = await fetchUrl(url);
  const windDegree    = getWindDirection(formattedData);
  const card          = renderWeatherCard(formattedData, windDegree);

  // Insert into hero column
  const heroCol = document.getElementById('signage-column-hero');
  if (heroCol) {
    heroCol.appendChild(card);
  } else {
    const col = document.getElementById('signage-column');
    if (col) col.prepend(card);
  }
}

export async function refreshWeather(lat, lon) {
  const url           = buildWeatherAPIUrl(lat, lon);
  const formattedData = await fetchUrl(url);
  const windDegree    = getWindDirection(formattedData);
  const icon          = weatherIcons[formattedData.weatherCode] || '❓';

  const heading  = document.getElementById('weather-heading');
  const timezone = document.getElementById('weather-timezone');
  const feels    = document.getElementById('weather-feels');
  const wind     = document.getElementById('weather-wind');

  if (heading)  heading.textContent  = `${icon} ${formattedData.temperature ?? 'N/A'}°F`;
  if (timezone) timezone.textContent = formattedData.timeZone ?? 'N/A';
  if (feels)    feels.textContent    = `Feels like: ${formattedData.apparentTemperature ?? 'N/A'}°F`;
  if (wind)     wind.textContent     = `${formattedData.windSpeed ?? 'N/A'} mph ${windDegree ?? 'N/A'}`;
}