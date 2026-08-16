// Weather Service - Uses OpenWeatherMap API for real weather data with Firestore caching
// Environment variable required: VITE_OPENWEATHER_API_KEY

import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

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

export interface CachedWeatherData {
  location: string;
  state: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  currentWeather: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed?: number;
    rainfall?: number;
    feelsLike?: number;
  };
  forecast?: any[];
  alerts?: string[];
  lastUpdated: Timestamp;
  expiresAt: Timestamp;
}

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_CACHE_COLLECTION = 'weatherCache';
const CACHE_DURATION_MINUTES = 60; // Cache for 1 hour

const db = getFirestoreDB();

// Firestore-based caching
async function getFromFirestoreCache(location: string, state: string): Promise<CachedWeatherData | null> {
  try {
    const cacheId = `${state}_${location.toLowerCase().replace(/\s+/g, '_')}`;
    const cacheRef = doc(db, WEATHER_CACHE_COLLECTION, cacheId);
    const cacheSnap = await getDoc(cacheRef);
    
    if (cacheSnap.exists()) {
      const cachedData = cacheSnap.data() as CachedWeatherData;
      const now = Timestamp.now();
      
      // Check if cache is still valid
      if (cachedData.expiresAt.toDate() > now.toDate()) {
        return cachedData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error reading from Firestore cache:', error);
    return null;
  }
}

async function setFirestoreCache(
  location: string,
  state: string,
  weatherResponse: WeatherResponse,
  district?: string,
  latitude?: number,
  longitude?: number
): Promise<void> {
  try {
    const cacheId = `${state}_${location.toLowerCase().replace(/\s+/g, '_')}`;
    const cacheRef = doc(db, WEATHER_CACHE_COLLECTION, cacheId);
    
    const now = Timestamp.now();
    const expiresAt = new Timestamp(now.seconds + (CACHE_DURATION_MINUTES * 60), now.nanoseconds);
    
    const cachedData: CachedWeatherData = {
      location,
      state,
      district,
      latitude,
      longitude,
      currentWeather: {
        temperature: weatherResponse.current.temperature,
        condition: weatherResponse.current.description,
        humidity: weatherResponse.current.humidity,
        windSpeed: weatherResponse.current.windSpeed,
        rainfall: weatherResponse.current.precipitation,
        feelsLike: weatherResponse.current.feelsLike,
      },
      forecast: weatherResponse.forecast,
      alerts: [],
      lastUpdated: now,
      expiresAt,
    };
    
    await setDoc(cacheRef, cachedData);
  } catch (error) {
    console.error('Error writing to Firestore cache:', error);
    // Don't throw error - weather should still work even if caching fails
  }
}

export async function getCurrentWeather(
  location: string, 
  state: string = 'Unknown',
  district?: string,
  latitude?: number,
  longitude?: number
): Promise<WeatherResponse> {
  if (!WEATHER_API_KEY) {
    return {
      current: {} as WeatherData,
      error: 'Weather service is not configured. Please add VITE_OPENWEATHER_API_KEY to environment variables.'
    };
  }

  // Check Firestore cache first
  const cached = await getFromFirestoreCache(location, state);
  if (cached) {
    // Convert cached data back to WeatherResponse format
    const current: WeatherData = {
      location: cached.location,
      temperature: cached.currentWeather.temperature,
      humidity: cached.currentWeather.humidity,
      description: cached.currentWeather.condition,
      windSpeed: cached.currentWeather.windSpeed || 0,
      precipitation: cached.currentWeather.rainfall || 0,
      feelsLike: cached.currentWeather.feelsLike || cached.currentWeather.temperature,
      timestamp: cached.lastUpdated.toDate(),
      source: 'OpenWeatherMap (Cached)',
    };

    return {
      current,
      forecast: cached.forecast,
    };
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
    
    // Cache in Firestore
    await setFirestoreCache(location, state, response, district, latitude, longitude);
    
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
