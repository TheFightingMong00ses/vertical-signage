import { formatWeatherData } from "../src/weather.mjs";

describe("formatWeatherData", () => {
  (test("extracts current weather values from API data", () => {
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
  }),
    test("handles missing weather data", () => {
      const apiData = {};
      const result = formatWeatherData(apiData);
      expect(result.temperature).toBeNull();
      expect(result.windSpeed).toBeNull();
      expect(result.windDirection).toBeNull();
    }));
});
