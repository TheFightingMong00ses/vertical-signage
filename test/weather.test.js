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
  test("constructs the correct API URL with given coordinates", () => {
    const result = buildWeatherAPIUrl(40.7128, -74.006);
    expect(result).toContain("latitude=40.7128");
    expect(result).toContain("longitude=-74.006");
    expect(result).toContain("temperature_unit=fahrenheit");
    expect(result).toContain("wind_speed_unit=mph");
    expect(result).toContain("timezone=auto");
  });

  test("handles null coordinates", () => {
    const result = buildWeatherAPIUrl(null, null);
    expect(result).toContain("latitude=null");
    expect(result).toContain("longitude=null");
  });
});
