// Market Price Service - Uses official agricultural market data
// Environment variable required: VITE_AGMARKNET_API_KEY (optional - can use public endpoints)

export interface MarketPrice {
  commodity: string;
  market: string;
  state: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: Date;
  source: string;
}

export interface MarketPriceResponse {
  prices: MarketPrice[];
  error?: string;
  lastUpdated: Date;
}

// Cache market prices for 6 hours (prices update daily)
const MARKET_CACHE_DURATION = 6 * 60 * 60 * 1000;
const marketCache = new Map<string, { data: MarketPriceResponse; timestamp: number }>();

function getFromCache(key: string): MarketPriceResponse | null {
  const cached = marketCache.get(key);
  if (cached && Date.now() - cached.timestamp < MARKET_CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: MarketPriceResponse): void {
  marketCache.set(key, { data, timestamp: Date.now() });
}

export async function getMarketPrices(
  commodity?: string,
  state?: string,
  district?: string
): Promise<MarketPriceResponse> {
  const cacheKey = `${commodity || 'all'}-${state || 'all'}-${district || 'all'}`;
  
  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Using Agmarknet (Government of India) public API
    // This is a free public endpoint for agricultural market prices
    let apiUrl = 'https://agmarknet.gov.in/api/crop-commodity-price';
    const params = new URLSearchParams();
    
    if (commodity) params.append('commodity', commodity);
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Market API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate and parse response
    const prices: MarketPrice[] = [];
    
    if (data.records && Array.isArray(data.records)) {
      for (const record of data.records) {
        const price: MarketPrice = {
          commodity: record.commodity || 'Unknown',
          market: record.market || 'Unknown',
          state: record.state || 'Unknown',
          district: record.district || 'Unknown',
          minPrice: validatePrice(record.min_price),
          maxPrice: validatePrice(record.max_price),
          modalPrice: validatePrice(record.modal_price),
          unit: record.unit || 'quintal',
          date: parseDate(record.arrival_date),
          source: 'Agmarknet (Government of India)'
        };
        
        // Filter by requested parameters if provided
        if (commodity && !price.commodity.toLowerCase().includes(commodity.toLowerCase())) continue;
        if (state && !price.state.toLowerCase().includes(state.toLowerCase())) continue;
        if (district && !price.district.toLowerCase().includes(district.toLowerCase())) continue;
        
        prices.push(price);
      }
    }

    if (prices.length === 0) {
      return {
        prices: [],
        lastUpdated: new Date(),
        error: 'No market price data available for the specified criteria. Please try different search terms or check back later.'
      };
    }

    const result: MarketPriceResponse = {
      prices,
      lastUpdated: new Date()
    };
    
    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error('Market service error:', error);
    return {
      prices: [],
      lastUpdated: new Date(),
      error: 'Current market price data is temporarily unavailable. The government market data service may be experiencing issues. Please try again later.'
    };
  }
}

function validatePrice(value: any): number {
  const num = Number(value);
  if (isNaN(num) || num < 0) return 0;
  return num;
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

export function formatMarketPrice(price: MarketPrice, language: string = 'en'): string {
  return `Commodity: ${price.commodity}
Market: ${price.market}, ${price.district}, ${price.state}
Price Range: ₹${price.minPrice} - ₹${price.maxPrice} per ${price.unit}
Modal Price: ₹${price.modalPrice} per ${price.unit}
Date: ${price.date.toLocaleDateString(language)}
Source: ${price.source}`;
}

export function getCommoditySuggestions(): string[] {
  return [
    'Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Cotton',
    'Sugarcane', 'Groundnut', 'Mustard', 'Soybean', 'Chilli', 'Turmeric',
    'Banana', 'Mango', 'Grapes', 'Pomegranate', 'Orange', 'Apple'
  ];
}

export function getStateSuggestions(): string[] {
  return [
    'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh',
    'Madhya Pradesh', 'West Bengal', 'Bihar', 'Odisha', 'Kerala'
  ];
}
