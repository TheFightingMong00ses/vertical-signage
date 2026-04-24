
// build the API URL with the coordinates
function buildWeatherAPIUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
}


// fetch the weather data and convert to string
async  function formatWeatherData(url) {
  const stringData = await fetch(url);
  const apiData = await stringData.json();
  
  const current = apiData.current || {};
  console.log("apiData.current:", apiData.current);
  console.log("FULL apiData:", apiData);
  console.log("CURRENT:", apiData.current);

  return {
    timeZone: apiData.timezone ?? null,
    temperature: current.temperature_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    windDirection:
      current.wind_direction_10m != null
        ? String(current.wind_direction_10m)
        : null,
    weatherCode: current.weathercode ?? current.weather_code ?? null
  };

};


//
function getWindDirection(weatherData) {

  const windAngle = weatherData.windDirection;
  if (windAngle == null) return "N/A";
  const directions = ["N", "NE","E", "SE","S", "SW","W", "NW", ]
  
  const index = Math.round(windAngle/45) % 8;
  return directions[index];
 
}

// Map weather codes to icons
const weatherIcons = {
  0: "☀️",   // clear sky
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
    <h3>${icon}</h3>
    <p>${weatherData.timeZone ?? "N/A"}</p>
    <p>Temperature: ${weatherData.temperature ?? "N/A"}°F</p>
    <p>Wind Speed: ${weatherData.windSpeed ?? "N/A"} mph</p>
    <p>Wind Direction: ${windDegree ?? "N/A"}</p>`
  
  return card;
}

 export async function initWeather(lat,lon) {
  const url = buildWeatherAPIUrl(lat,lon);
  const weatherApiData = await formatWeatherData(url);
  const icon = getWeatherIcon(weatherApiData.weatherCode)
  const windDegree = getWindDirection(weatherApiData);
  const card = renderWeatherCard(weatherApiData, windDegree, icon);

  const signageColumn = document.getElementById("signage-column");
    if (signageColumn) {
        signageColumn.prepend(card)
    }

  }