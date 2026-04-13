export function formatWeatherData(apiData) {
  const current = apiData.current || {};

  return {
    temperature: current.temperature_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    windDirection:
      current.wind_direction_10m != null
        ? String(current.wind_direction_10m)
        : null,
  };
}