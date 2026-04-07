const CITY = "Denver"
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=39.7392&longitude=-104.9847&current=wind_speed_10m,wind_direction_10m,temperature_2m&timezone=America%2F${CITY}&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch";
const GEO_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${CITY}&count=10&language=en&format=json`; 