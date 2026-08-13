// Weather Service - Uses OpenWeatherMap API for real weather data
// Environment variable required: VITE_OPENWEATHER_API_KEY

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
  timestamp: Date;
  source: string;
}

export interface WeatherForecast {
  date: Date;
  temperatureMax: number;
  temperatureMin: number;
  description: string;
  precipitationChance: number;
}

export interface WeatherResponse {
  current: WeatherData;
  forecast?: WeatherForecast[];
  error?: string;
}

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Cache weather data for 30 minutes
const WEATHER_CACHE_DURATION = 30 * 60 * 1000;
const weatherCache = new Map<string, { data: WeatherResponse; timestamp: number }>();

function getFromCache(location: string): WeatherResponse | null {
  const cached = weatherCache.get(location);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(location: string, data: WeatherResponse): void {
  weatherCache.set(location, { data, timestamp: Date.now() });
}

export async function getCurrentWeather(location: string): Promise<WeatherResponse> {
  if (!WEATHER_API_KEY) {
    return {
      current: {} as WeatherData,
      error: 'Weather service is not configured. Please add VITE_OPENWEATHER_API_KEY to environment variables.'
    };
  }

  // Check cache first
  const cached = getFromCache(location);
  if (cached) {
    return cached;
  }

  try {
    // Get coordinates from location name
    const geoResponse = await fetch(
      `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!geoResponse.ok) {
      throw new Error(`Weather API error: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    // Validate response
    if (!geoData.main || !geoData.weather || !geoData.wind) {
      throw new Error('Invalid weather data received from API');
    }

    const current: WeatherData = {
      location: geoData.name || location,
      temperature: validateNumber(geoData.main.temp, -50, 60),
      humidity: validateNumber(geoData.main.humidity, 0, 100),
      description: geoData.weather[0]?.description || 'Unknown',
      windSpeed: validateNumber(geoData.wind.speed, 0, 50),
      precipitation: geoData.rain?.['1h'] || geoData.snow?.['1h'] || 0,
      feelsLike: validateNumber(geoData.main.feels_like, -50, 60),
      timestamp: new Date(),
      source: 'OpenWeatherMap'
    };

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    let forecast: WeatherForecast[] | undefined;
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      if (forecastData.list && Array.isArray(forecastData.list)) {
        forecast = forecastData.list
          .filter((_: any, index: number) => index % 8 === 0) // Get one forecast per day (every 3 hours * 8 = 24 hours)
          .slice(0, 5)
          .map((item: any) => ({
            date: new Date(item.dt * 1000),
            temperatureMax: validateNumber(item.main.temp_max, -50, 60),
            temperatureMin: validateNumber(item.main.temp_min, -50, 60),
            description: item.weather[0]?.description || 'Unknown',
            precipitationChance: item.pop ? Math.round(item.pop * 100) : 0
          }));
      }
    }

    const response: WeatherResponse = { current, forecast };
    setCache(location, response);
    return response;

  } catch (error) {
    console.error('Weather service error:', error);
    return {
      current: {} as WeatherData,
      error: 'Current weather data is temporarily unavailable. Please try again later.'
    };
  }
}

function validateNumber(value: any, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

export function formatWeatherData(data: WeatherData, language: string = 'en'): string {
  const tempUnit = '°C';
  const windUnit = 'm/s';
  
  return `Current weather in ${data.location}:
Temperature: ${data.temperature}${tempUnit} (feels like ${data.feelsLike}${tempUnit})
Humidity: ${data.humidity}%
Wind: ${data.windSpeed} ${windUnit}
Conditions: ${data.description}
Precipitation: ${data.precipitation > 0 ? `${data.precipitation}mm` : 'None'}
Last updated: ${data.timestamp.toLocaleString(language)}`;
}
