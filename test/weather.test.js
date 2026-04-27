import { buildWeatherAPIUrl, formatWeatherData } from "../src/weather.js";

describe("formatWeatherData", () => {
  test("extracts current weather values from API data", () => {
    const apiData = {
      current: {
        temperature_2m: 48.2,
        wind_speed_10m: 6.5,
        wind_direction_10m: 352,
      },
    };
    const result = formatWeatherData(apiData);
    expect(result.temperature).toBe(48.2);
    expect(result.windSpeed).toBe(6.5);
    expect(result.windDirection).toBe("352");
  });

  test("handles missing weather data", () => {
    const apiData = {};
    const result = formatWeatherData(apiData);
    expect(result.temperature).toBeNull();
    expect(result.windSpeed).toBeNull();
    expect(result.windDirection).toBeNull();
  });
});

describe("buildWeatherAPIUrl", () => {
  const expectedUrl =
    "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,precipitation,wind_speed_10m&timezone=America%2FDenver&forecast_days=3&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch";

  test("constructs the correct API URL with given coordinates", () => {
    const apiData = {
      lat: 40.7128,
      lon: -74.006,
    };
    const result = buildWeatherAPIUrl(apiData.lat, apiData.lon);
    expect(result).toBe(expectedUrl);
  });

  test("handles missing coordinates", () => {
    const result = buildWeatherAPIUrl(null, null);
    expect(result).toBe(expectedUrl);
  });
});
