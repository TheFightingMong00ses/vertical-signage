import { expect } from "chai";
import { formatWeatherData } from "../src/weather.js";
describe("formatWeatherData", () => {
    it("extracts current weather values from API data",() => {
        const apiData = {
            "current": {
                "temperature_2m":48.2
            }
        };
        const result = formatWeatherData(apiData);;
        expect(result.temperature).toBe(48.2);
    });