// Seed Recommendation Service - Based on verified crop varieties
// Uses ICAR and state agricultural university data

export interface SeedParameters {
  crop: string;
  state: string;
  district?: string;
  season: 'Kharif' | 'Rabi' | 'Summer' | 'Zaid';
  soilType?: string;
  irrigationAvailable: boolean;
  duration?: string; // 'Short' | 'Medium' | 'Long'
  farmerRequirements?: string[];
}

export interface SeedVariety {
  varietyName: string;
  crop: string;
  suitableRegion: string[];
  season: string[];
  maturityDuration: string;
  characteristics: string[];
  diseaseResistance?: string[];
  yieldPotential: string;
  source: string;
  releaseYear?: number;
}

export interface SeedRecommendationResponse {
  varieties: SeedVariety[];
  inputSummary: string;
  error?: string;
  generatedAt: Date;
}

// ICAR and state agricultural university verified varieties (simplified database)
const SEED_DATABASE: Record<string, SeedVariety[]> = {
  'Rice': [
    {
      varietyName: 'MTU 1010',
      crop: 'Rice',
      suitableRegion: ['Andhra Pradesh', 'Telangana', 'Karnataka'],
      season: ['Kharif'],
      maturityDuration: '110-115 days',
      characteristics: ['High yield', 'Fine grain quality', 'Medium height'],
      diseaseResistance: ['Blast', 'Bacterial leaf blight'],
      yieldPotential: '5.5-6.0 t/ha',
      source: 'ANGRAU / ICAR',
      releaseYear: 2008
    },
    {
      varietyName: 'BPT 5204 (Samba Mahsuri)',
      crop: 'Rice',
      suitableRegion: ['Andhra Pradesh', 'Telangana', 'Tamil Nadu'],
      season: ['Kharif', 'Rabi'],
      maturityDuration: '140-145 days',
      characteristics: ['Premium quality', 'Aromatic', 'Slender grain'],
      diseaseResistance: ['Blast'],
      yieldPotential: '4.5-5.0 t/ha',
      source: 'ANGRAU / ICAR',
      releaseYear: 1986
    },
    {
      varietyName: 'Swarna (MTU 7029)',
      crop: 'Rice',
      suitableRegion: ['Andhra Pradesh', 'Telangana', 'Odisha'],
      season: ['Kharif'],
      maturityDuration: '115-120 days',
      characteristics: ['High yield', 'Medium duration', 'Bold grain'],
      diseaseResistance: ['Blast', 'Sheath blight'],
      yieldPotential: '5.0-5.5 t/ha',
      source: 'ANGRAU / ICAR',
      releaseYear: 1994
    }
  ],
  'Cotton': [
    {
      varietyName: 'RCH 2 Bt',
      crop: 'Cotton',
      suitableRegion: ['Maharashtra', 'Gujarat', 'Madhya Pradesh'],
      season: ['Kharif'],
      maturityDuration: '150-160 days',
      characteristics: ['Bollgard II technology', 'High yield', 'Medium duration'],
      diseaseResistance: ['Bollworm'],
      yieldPotential: '15-20 quintals/ha',
      source: 'Rasi Seeds / ICAR',
      releaseYear: 2006
    },
    {
      varietyName: 'JKCH 1947 Bt',
      crop: 'Cotton',
      suitableRegion: ['Punjab', 'Haryana', 'Rajasthan'],
      season: ['Kharif'],
      maturityDuration: '160-170 days',
      characteristics: ['Bollgard II', 'High yield potential', 'Wide adaptability'],
      diseaseResistance: ['Bollworm', 'Jassids'],
      yieldPotential: '18-22 quintals/ha',
      source: 'JK Agri Genetics / ICAR',
      releaseYear: 2012
    }
  ],
  'Wheat': [
    {
      varietyName: 'HD 2967',
      crop: 'Wheat',
      suitableRegion: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Delhi'],
      season: ['Rabi'],
      maturityDuration: '115-120 days',
      characteristics: ['High yield', 'Good quality', 'Wide adaptability'],
      diseaseResistance: ['Rust', 'Karnal bunt'],
      yieldPotential: '5.5-6.0 t/ha',
      source: 'IARI / ICAR',
      releaseYear: 2011
    },
    {
      varietyName: 'PBW 343',
      crop: 'Wheat',
      suitableRegion: ['Punjab', 'Haryana'],
      season: ['Rabi'],
      maturityDuration: '110-115 days',
      characteristics: ['High yield', 'Early maturity', 'Good quality'],
      diseaseResistance: ['Leaf rust'],
      yieldPotential: '5.0-5.5 t/ha',
      source: 'PAU / ICAR',
      releaseYear: 1995
    }
  ],
  'Maize': [
    {
      varietyName: 'Pioneer P 3302',
      crop: 'Maize',
      suitableRegion: ['Karnataka', 'Maharashtra', 'Andhra Pradesh'],
      season: ['Kharif', 'Rabi'],
      maturityDuration: '90-95 days',
      characteristics: ['High yield', 'Uniform cob', 'Good standability'],
      diseaseResistance: ['Turcicum leaf blight'],
      yieldPotential: '8-10 t/ha',
      source: 'Pioneer / ICAR',
      releaseYear: 2010
    },
    {
      varietyName: 'NK 6240',
      crop: 'Maize',
      suitableRegion: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh'],
      season: ['Kharif', 'Rabi'],
      maturityDuration: '85-90 days',
      characteristics: ['Early maturity', 'High yield', 'Good grain quality'],
      diseaseResistance: ['Maydis leaf blight'],
      yieldPotential: '7.5-8.5 t/ha',
      source: 'NK Seeds / ICAR',
      releaseYear: 2008
    }
  ],
  'Groundnut': [
    {
      varietyName: 'TG 37A',
      crop: 'Groundnut',
      suitableRegion: ['Andhra Pradesh', 'Telangana', 'Tamil Nadu'],
      season: ['Kharif', 'Summer'],
      maturityDuration: '100-105 days',
      characteristics: ['High yield', 'Bold kernel', 'Oil content 48-50%'],
      diseaseResistance: ['Tikka', 'Rust'],
      yieldPotential: '2.0-2.5 t/ha',
      source: 'ANGRAU / ICAR',
      releaseYear: 2005
    },
    {
      varietyName: 'JL 24',
      crop: 'Groundnut',
      suitableRegion: ['Gujarat', 'Maharashtra', 'Karnataka'],
      season: ['Kharif'],
      maturityDuration: '95-100 days',
      characteristics: ['High yield', 'Spreading type', 'Suitable for sandy soils'],
      diseaseResistance: ['Tikka'],
      yieldPotential: '1.8-2.2 t/ha',
      source: 'Junagadh Agricultural University / ICAR',
      releaseYear: 1979
    }
  ],
  'Soybean': [
    {
      varietyName: 'JS 9560',
      crop: 'Soybean',
      suitableRegion: ['Madhya Pradesh', 'Maharashtra', 'Karnataka'],
      season: ['Kharif'],
      maturityDuration: '95-100 days',
      characteristics: ['High yield', 'Medium duration', 'Bold seeds'],
      diseaseResistance: ['Yellow mosaic virus', 'Rust'],
      yieldPotential: '2.5-3.0 t/ha',
      source: 'JNKVV / ICAR',
      releaseYear: 2010
    },
    {
      varietyName: 'JS 335',
      crop: 'Soybean',
      suitableRegion: ['Madhya Pradesh', 'Maharashtra'],
      season: ['Kharif'],
      maturityDuration: '90-95 days',
      characteristics: ['High yield', 'Early maturity', 'Wide adaptability'],
      diseaseResistance: ['Yellow mosaic virus'],
      yieldPotential: '2.2-2.7 t/ha',
      source: 'JNKVV / ICAR',
      releaseYear: 1994
    }
  ],
  'Chickpea': [
    {
      varietyName: 'JG 11',
      crop: 'Chickpea',
      suitableRegion: ['Maharashtra', 'Karnataka', 'Andhra Pradesh'],
      season: ['Rabi'],
      maturityDuration: '95-100 days',
      characteristics: ['High yield', 'Bold seeds', 'Wilt resistant'],
      diseaseResistance: ['Wilt', 'Ascochyta blight'],
      yieldPotential: '2.0-2.5 t/ha',
      source: 'JNKVV / ICAR',
      releaseYear: 2005
    },
    {
      varietyName: 'GNG 469',
      crop: 'Chickpea',
      suitableRegion: ['Punjab', 'Haryana', 'Uttar Pradesh'],
      season: ['Rabi'],
      maturityDuration: '100-105 days',
      characteristics: ['High yield', 'Medium duration', 'Kabuli type'],
      diseaseResistance: ['Wilt'],
      yieldPotential: '2.2-2.8 t/ha',
      source: 'IARI / ICAR',
      releaseYear: 2008
    }
  ]
};

export function getSeedRecommendations(params: SeedParameters): SeedRecommendationResponse {
  // Validate inputs
  const validatedParams = validateSeedParameters(params);
  
  // Generate input summary
  const inputSummary = generateInputSummary(validatedParams);
  
  // Get varieties for the crop
  const cropVarieties = SEED_DATABASE[validatedParams.crop];
  
  if (!cropVarieties || cropVarieties.length === 0) {
    return {
      varieties: [],
      inputSummary,
      error: `No verified seed varieties found for ${validatedParams.crop}. Please consult your local agriculture department or Krishi Vigyan Kendra for region-specific recommendations.`,
      generatedAt: new Date()
    };
  }

  // Score varieties based on parameters
  const scoredVarieties = scoreVarieties(cropVarieties, validatedParams);
  
  // Sort by score
  scoredVarieties.sort((a, b) => b.score - a.score);
  
  // Return top recommendations
  const recommendations = scoredVarieties
    .filter(v => v.score > 0)
    .slice(0, 5)
    .map(v => v.variety);

  if (recommendations.length === 0) {
    return {
      varieties: [],
      inputSummary,
      error: `No suitable seed varieties found for the given parameters in ${validatedParams.state}. Please consult your local agriculture department for region-specific recommendations.`,
      generatedAt: new Date()
    };
  }

  return {
    varieties: recommendations,
    inputSummary,
    generatedAt: new Date()
  };
}

function validateSeedParameters(params: SeedParameters): SeedParameters {
  return {
    crop: params.crop,
    state: params.state,
    district: params.district,
    season: params.season || 'Kharif',
    soilType: params.soilType,
    irrigationAvailable: params.irrigationAvailable,
    duration: params.duration,
    farmerRequirements: params.farmerRequirements
  };
}

function generateInputSummary(params: SeedParameters): string {
  let summary = `Crop: ${params.crop}`;
  summary += `\nState: ${params.state}`;
  if (params.district) summary += `, ${params.district}`;
  summary += `\nSeason: ${params.season}`;
  if (params.soilType) summary += `\nSoil Type: ${params.soilType}`;
  summary += `\nIrrigation: ${params.irrigationAvailable ? 'Available' : 'Not Available'}`;
  if (params.duration) summary += `\nPreferred Duration: ${params.duration}`;
  return summary;
}

function scoreVarieties(varieties: SeedVariety[], params: SeedParameters): Array<{ variety: SeedVariety; score: number }> {
  return varieties.map(variety => {
    let score = 0;

    // Region match (highest weight)
    if (variety.suitableRegion.some(region => 
      params.state.toLowerCase().includes(region.toLowerCase())
    )) {
      score += 40;
    }

    // Season match
    if (variety.season.includes(params.season)) {
      score += 30;
    }

    // Duration preference
    if (params.duration) {
      const durationDays = extractDays(variety.maturityDuration);
      if (params.duration === 'Short' && durationDays < 100) score += 20;
      else if (params.duration === 'Medium' && durationDays >= 100 && durationDays < 130) score += 20;
      else if (params.duration === 'Long' && durationDays >= 130) score += 20;
    }

    // Irrigation consideration
    if (params.irrigationAvailable) {
      score += 10;
    }

    // Farmer requirements
    if (params.farmerRequirements) {
      params.farmerRequirements.forEach(req => {
        if (variety.characteristics.some(char => 
          char.toLowerCase().includes(req.toLowerCase())
        )) {
          score += 10;
        }
      });
    }

    return { variety, score };
  });
}

function extractDays(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function formatSeedRecommendations(response: SeedRecommendationResponse, language: string = 'en'): string {
  if (response.error) {
    return response.error;
  }

  let result = `Seed Variety Recommendation Report
=====================================

Input Parameters:
${response.inputSummary}

Recommended Varieties:
`;

  response.varieties.forEach((variety, index) => {
    result += `\n${index + 1}. ${variety.varietyName}
`;
    result += `   Crop: ${variety.crop}
`;
    result += `   Suitable Regions: ${variety.suitableRegion.join(', ')}
`;
    result += `   Season: ${variety.season.join(', ')}
`;
    result += `   Maturity Duration: ${variety.maturityDuration}
`;
    result += `   Characteristics: ${variety.characteristics.join(', ')}
`;
    if (variety.diseaseResistance && variety.diseaseResistance.length > 0) {
      result += `   Disease Resistance: ${variety.diseaseResistance.join(', ')}
`;
    }
    result += `   Yield Potential: ${variety.yieldPotential}
`;
    result += `   Source: ${variety.source}
`;
    if (variety.releaseYear) {
      result += `   Release Year: ${variety.releaseYear}
`;
    }
  });

  result += `\nGenerated: ${response.generatedAt.toLocaleString(language)}`;
  result += `\n\nImportant: Always purchase certified seeds from authorized sources. Follow local agricultural department recommendations for your specific region.`;

  return result;
}

export function getCropList(): string[] {
  return Object.keys(SEED_DATABASE);
}

export function getSeasons(): string[] {
  return ['Kharif', 'Rabi', 'Summer', 'Zaid'];
}

export function getDurationOptions(): string[] {
  return ['Short', 'Medium', 'Long'];
}
