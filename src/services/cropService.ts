// Crop Recommendation Service - Structured crop recommendations based on parameters
// Uses ICAR and state agricultural department data

export interface CropParameters {
  state: string;
  district?: string;
  season: 'Kharif' | 'Rabi' | 'Summer' | 'Zaid' | 'All Year';
  soilType?: string;
  soilPh?: number;
  waterAvailability: 'High' | 'Medium' | 'Low' | 'Rainfed';
  irrigationAvailable: boolean;
  rainfall?: number; // mm annual
  temperature?: number; // °C average
  previousCrop?: string;
  landSize?: number; // acres
  farmerPreference?: string;
}

export interface CropRecommendation {
  crop: string;
  suitability: 'High' | 'Medium' | 'Low';
  reasons: string[];
  growingSeason: string;
  soilRequirements: string;
  waterRequirement: string;
  suitableConditions: string;
  cropDuration: string;
  risks: string[];
  rotationConsiderations: string;
  source: string;
}

export interface CropRecommendationResponse {
  recommendations: CropRecommendation[];
  inputSummary: string;
  error?: string;
  generatedAt: Date;
}

// ICAR crop database (simplified - in production would use actual ICAR database)
const CROP_DATABASE: Record<string, {
  suitableSeasons: string[];
  soilTypes: string[];
  waterRequirement: string;
  phRange: { min: number; max: number };
  temperatureRange: { min: number; max: number };
  duration: string;
  risks: string[];
  rotation: string;
}> = {
  'Rice': {
    suitableSeasons: ['Kharif'],
    soilTypes: ['Clay', 'Loam', 'Alluvial'],
    waterRequirement: 'High',
    phRange: { min: 5.5, max: 6.5 },
    temperatureRange: { min: 20, max: 35 },
    duration: '120-150 days',
    risks: ['Pest attacks', 'Diseases like blast', 'Water stress'],
    rotation: 'Follow with wheat, pulses, or oilseeds'
  },
  'Wheat': {
    suitableSeasons: ['Rabi'],
    soilTypes: ['Loam', 'Clay Loam', 'Alluvial'],
    waterRequirement: 'Medium',
    phRange: { min: 6.0, max: 7.5 },
    temperatureRange: { min: 15, max: 25 },
    duration: '110-130 days',
    risks: ['Rust diseases', 'Heat stress', 'Terminal heat'],
    rotation: 'Follow with rice, maize, or summer crops'
  },
  'Cotton': {
    suitableSeasons: ['Kharif'],
    soilTypes: ['Black', 'Red', 'Loam'],
    waterRequirement: 'Medium',
    phRange: { min: 6.0, max: 8.0 },
    temperatureRange: { min: 21, max: 30 },
    duration: '150-180 days',
    risks: ['Bollworm', 'Whitefly', 'Moisture stress'],
    rotation: 'Follow with wheat, chickpea, or gram'
  },
  'Maize': {
    suitableSeasons: ['Kharif', 'Rabi', 'Summer'],
    soilTypes: ['Loam', 'Sandy Loam', 'Alluvial'],
    waterRequirement: 'Medium',
    phRange: { min: 5.5, max: 7.5 },
    temperatureRange: { min: 18, max: 32 },
    duration: '90-110 days',
    risks: ['Stem borer', 'Fall armyworm', 'Drought'],
    rotation: 'Follow with pulses, vegetables, or wheat'
  },
  'Groundnut': {
    suitableSeasons: ['Kharif', 'Summer'],
    soilTypes: ['Sandy Loam', 'Red', 'Loam'],
    waterRequirement: 'Low',
    phRange: { min: 6.0, max: 7.5 },
    temperatureRange: { min: 25, max: 35 },
    duration: '90-120 days',
    risks: ['Leaf spot', 'Tikka disease', 'Drought'],
    rotation: 'Follow with wheat, sorghum, or millets'
  },
  'Soybean': {
    suitableSeasons: ['Kharif'],
    soilTypes: ['Black', 'Loam', 'Clay'],
    waterRequirement: 'Medium',
    phRange: { min: 6.0, max: 7.5 },
    temperatureRange: { min: 20, max: 30 },
    duration: '90-100 days',
    risks: ['Yellow mosaic virus', 'Stem fly', 'Water logging'],
    rotation: 'Follow with wheat, chickpea, or mustard'
  },
  'Sugarcane': {
    suitableSeasons: ['All Year'],
    soilTypes: ['Loam', 'Clay Loam', 'Alluvial'],
    waterRequirement: 'High',
    phRange: { min: 6.5, max: 7.5 },
    temperatureRange: { min: 20, max: 35 },
    duration: '10-18 months',
    risks: ['Red rot', 'Pest attacks', 'Water stress'],
    rotation: 'Long duration crop, plan rotation carefully'
  },
  'Chickpea': {
    suitableSeasons: ['Rabi'],
    soilTypes: ['Loam', 'Sandy Loam', 'Black'],
    waterRequirement: 'Low',
    phRange: { min: 6.0, max: 7.5 },
    temperatureRange: { min: 15, max: 25 },
    duration: '90-110 days',
    risks: ['Wilt disease', 'Pod borer', 'Excess moisture'],
    rotation: 'Follow with rice, maize, or cotton'
  },
  'Mustard': {
    suitableSeasons: ['Rabi'],
    soilTypes: ['Loam', 'Clay', 'Sandy Loam'],
    waterRequirement: 'Low',
    phRange: { min: 6.0, max: 7.5 },
    temperatureRange: { min: 15, max: 25 },
    duration: '90-110 days',
    risks: ['Aphids', 'Alternaria blight', 'Heat stress'],
    rotation: 'Follow with rice, maize, or summer crops'
  },
  'Turmeric': {
    suitableSeasons: ['Kharif'],
    soilTypes: ['Loam', 'Clay Loam', 'Red'],
    waterRequirement: 'Medium',
    phRange: { min: 5.5, max: 7.5 },
    temperatureRange: { min: 20, max: 30 },
    duration: '7-9 months',
    risks: ['Leaf spot', 'Rhizome rot', 'Water logging'],
    rotation: 'Follow with cereals or pulses'
  }
};

export function getCropRecommendations(params: CropParameters): CropRecommendationResponse {
  // Validate inputs
  const validatedParams = validateCropParameters(params);
  
  // Generate input summary
  const inputSummary = generateInputSummary(validatedParams);
  
  // Score each crop
  const scoredCrops = scoreCrops(validatedParams);
  
  // Sort by suitability score
  scoredCrops.sort((a, b) => b.score - a.score);
  
  // Generate recommendations
  const recommendations = scoredCrops
    .filter(crop => crop.score > 0)
    .slice(0, 5)
    .map(crop => generateRecommendation(crop, validatedParams));

  if (recommendations.length === 0) {
    return {
      recommendations: [],
      inputSummary,
      error: 'No suitable crops found for the given parameters. Please provide more specific information or consult your local agriculture department.',
      generatedAt: new Date()
    };
  }

  return {
    recommendations,
    inputSummary,
    generatedAt: new Date()
  };
}

function validateCropParameters(params: CropParameters): CropParameters {
  return {
    state: params.state || 'Unknown',
    district: params.district,
    season: params.season || 'Kharif',
    soilType: params.soilType,
    soilPh: params.soilPh,
    waterAvailability: params.waterAvailability || 'Medium',
    irrigationAvailable: params.irrigationAvailable,
    rainfall: params.rainfall,
    temperature: params.temperature,
    previousCrop: params.previousCrop,
    landSize: params.landSize,
    farmerPreference: params.farmerPreference
  };
}

function generateInputSummary(params: CropParameters): string {
  let summary = `Location: ${params.state}`;
  if (params.district) summary += `, ${params.district}`;
  summary += `\nSeason: ${params.season}`;
  if (params.soilType) summary += `\nSoil Type: ${params.soilType}`;
  if (params.soilPh) summary += `\nSoil pH: ${params.soilPh}`;
  summary += `\nWater Availability: ${params.waterAvailability}`;
  summary += `\nIrrigation: ${params.irrigationAvailable ? 'Available' : 'Not Available'}`;
  if (params.rainfall) summary += `\nAnnual Rainfall: ${params.rainfall}mm`;
  if (params.temperature) summary += `\nAverage Temperature: ${params.temperature}°C`;
  if (params.previousCrop) summary += `\nPrevious Crop: ${params.previousCrop}`;
  if (params.landSize) summary += `\nLand Size: ${params.landSize} acres`;
  return summary;
}

function scoreCrops(params: CropParameters): Array<{ crop: string; score: number; data: any }> {
  const scoredCrops: Array<{ crop: string; score: number; data: any }> = [];

  for (const [cropName, cropData] of Object.entries(CROP_DATABASE)) {
    let score = 0;

    // Season match (highest weight)
    if (cropData.suitableSeasons.includes(params.season)) {
      score += 30;
    } else if (params.season === 'All Year' || cropData.suitableSeasons.includes('All Year')) {
      score += 20;
    }

    // Soil type match
    if (params.soilType && cropData.soilTypes.some((st: string) => 
      params.soilType?.toLowerCase().includes(st.toLowerCase())
    )) {
      score += 25;
    }

    // pH compatibility
    if (params.soilPh && params.soilPh >= cropData.phRange.min && params.soilPh <= cropData.phRange.max) {
      score += 15;
    }

    // Water availability match
    const waterScore = getWaterScore(params.waterAvailability, cropData.waterRequirement);
    score += waterScore;

    // Temperature compatibility
    if (params.temperature && 
        params.temperature >= cropData.temperatureRange.min && 
        params.temperature <= cropData.temperatureRange.max) {
      score += 10;
    }

    // Irrigation availability
    if (params.irrigationAvailable && cropData.waterRequirement === 'High') {
      score += 10;
    } else if (!params.irrigationAvailable && cropData.waterRequirement === 'Low') {
      score += 10;
    }

    // Farmer preference
    if (params.farmerPreference && cropName.toLowerCase().includes(params.farmerPreference.toLowerCase())) {
      score += 15;
    }

    // Crop rotation consideration
    if (params.previousCrop && isGoodRotation(params.previousCrop, cropName)) {
      score += 5;
    }

    scoredCrops.push({ crop: cropName, score, data: cropData });
  }

  return scoredCrops;
}

function getWaterScore(availability: string, requirement: string): number {
  const waterLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
  const availLevel = waterLevels[availability as keyof typeof waterLevels] || 2;
  const reqLevel = waterLevels[requirement as keyof typeof waterLevels] || 2;

  if (availLevel >= reqLevel) return 15;
  if (availLevel === reqLevel - 1) return 10;
  return 5;
}

function isGoodRotation(previousCrop: string, currentCrop: string): boolean {
  // Simplified rotation logic - in production would use actual crop rotation data
  const goodRotations: Record<string, string[]> = {
    'Rice': ['Wheat', 'Chickpea', 'Mustard', 'Maize'],
    'Wheat': ['Rice', 'Maize', 'Groundnut', 'Soybean'],
    'Cotton': ['Wheat', 'Chickpea', 'Gram', 'Mustard'],
    'Maize': ['Wheat', 'Chickpea', 'Mustard', 'Vegetables'],
    'Groundnut': ['Wheat', 'Sorghum', 'Maize', 'Millets'],
    'Soybean': ['Wheat', 'Chickpea', 'Mustard', 'Maize'],
    'Chickpea': ['Rice', 'Maize', 'Cotton', 'Sorghum'],
    'Mustard': ['Rice', 'Maize', 'Groundnut', 'Sugarcane']
  };

  return goodRotations[previousCrop]?.includes(currentCrop) || false;
}

function generateRecommendation(
  scoredCrop: { crop: string; score: number; data: any },
  params: CropParameters
): CropRecommendation {
  const { crop, score, data } = scoredCrop;

  const reasons: string[] = [];
  if (data.suitableSeasons.includes(params.season)) {
    reasons.push(`Suitable for ${params.season} season`);
  }
  if (params.soilType && data.soilTypes.some((st: string) => 
    params.soilType?.toLowerCase().includes(st.toLowerCase())
  )) {
    reasons.push(`Compatible with ${params.soilType} soil`);
  }
  if (params.soilPh && params.soilPh >= data.phRange.min && params.soilPh <= data.phRange.max) {
    reasons.push(`Soil pH ${params.soilPh} is within optimal range`);
  }
  if (params.irrigationAvailable) {
    reasons.push('Irrigation available supports water requirements');
  }

  const suitability = score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low';

  return {
    crop,
    suitability,
    reasons,
    growingSeason: data.suitableSeasons.join(', '),
    soilRequirements: `pH ${data.phRange.min}-${data.phRange.max}, ${data.soilTypes.join(' or ')}`,
    waterRequirement: data.waterRequirement,
    suitableConditions: `Temperature ${data.temperatureRange.min}-${data.temperatureRange.max}°C`,
    cropDuration: data.duration,
    risks: data.risks,
    rotationConsiderations: data.rotation,
    source: 'ICAR Crop Recommendations'
  };
}

export function formatCropRecommendations(response: CropRecommendationResponse, language: string = 'en'): string {
  if (response.error) {
    return response.error;
  }

  let result = `Crop Recommendation Report
============================

Input Parameters:
${response.inputSummary}

Recommendations:
`;

  response.recommendations.forEach((rec, index) => {
    result += `\n${index + 1}. ${rec.crop} (Suitability: ${rec.suitability})
`;
    result += `   Reasons: ${rec.reasons.join(', ')}
`;
    result += `   Growing Season: ${rec.growingSeason}
`;
    result += `   Soil Requirements: ${rec.soilRequirements}
`;
    result += `   Water Requirement: ${rec.waterRequirement}
`;
    result += `   Suitable Conditions: ${rec.suitableConditions}
`;
    result += `   Crop Duration: ${rec.cropDuration}
`;
    result += `   Risks: ${rec.risks.join(', ')}
`;
    result += `   Rotation: ${rec.rotationConsiderations}
`;
    result += `   Source: ${rec.source}
`;
  });

  result += `\nGenerated: ${response.generatedAt.toLocaleString(language)}`;
  result += `\n\nNote: These recommendations are based on general agricultural parameters. For specific local conditions, consult your local agriculture department or Krishi Vigyan Kendra.`;

  return result;
}

export function getStateCropSeasons(state: string): string[] {
  // Simplified state-wise seasons - in production would use actual state agricultural data
  const stateSeasons: Record<string, string[]> = {
    'Andhra Pradesh': ['Kharif', 'Rabi', 'Summer'],
    'Telangana': ['Kharif', 'Rabi', 'Summer'],
    'Karnataka': ['Kharif', 'Rabi', 'Summer'],
    'Tamil Nadu': ['Kharif', 'Rabi', 'Summer'],
    'Maharashtra': ['Kharif', 'Rabi'],
    'Gujarat': ['Kharif', 'Rabi', 'Summer'],
    'Punjab': ['Kharif', 'Rabi'],
    'Haryana': ['Kharif', 'Rabi'],
    'Uttar Pradesh': ['Kharif', 'Rabi', 'Summer'],
    'West Bengal': ['Kharif', 'Rabi', 'Summer']
  };

  return stateSeasons[state] || ['Kharif', 'Rabi'];
}

export function getSoilTypes(): string[] {
  return ['Alluvial', 'Black', 'Red', 'Loam', 'Clay', 'Sandy', 'Sandy Loam', 'Clay Loam'];
}
