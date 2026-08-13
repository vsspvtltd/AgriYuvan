// Fertilizer Guidance Service - Calculates fertilizer recommendations based on soil test
// Uses ICAR and state agricultural department recommendations

export interface FertilizerParameters {
  crop: string;
  cropStage?: string;
  soilNitrogen?: number; // kg/ha
  soilPhosphorus?: number; // kg/ha
  soilPotassium?: number; // kg/ha
  soilPh?: number;
  area: number; // acres
  targetYield?: number; // quintals/ha
  state?: string;
  soilType?: string;
}

export interface NutrientRequirement {
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
}

export interface FertilizerRecommendation {
  crop: string;
  area: number;
  nutrientRequirement: NutrientRequirement;
  recommendedFertilizers: FertilizerApplication[];
  timing: string[];
  precautions: string[];
  calculationExplanation: string;
  source: string;
  requiresSoilTest: boolean;
}

export interface FertilizerApplication {
  fertilizer: string;
  nutrient: string;
  quantity: number; // kg/ha
  quantityPerAcre: number; // kg/acre
  totalQuantity: number; // kg for total area
  applicationStage: string;
}

export interface FertilizerResponse {
  recommendation: FertilizerRecommendation;
  error?: string;
  generatedAt: Date;
}

// ICAR nutrient requirement database (simplified)
const CROP_NUTRIENT_REQUIREMENTS: Record<string, { 
  n: number; 
  p: number; 
  k: number; 
  stages: string[] 
}> = {
  'Rice': { n: 100, p: 50, k: 50, stages: ['Basal', 'Tillering', 'Panicle initiation'] },
  'Wheat': { n: 120, p: 60, k: 40, stages: ['Basal', 'First irrigation', 'Second irrigation'] },
  'Cotton': { n: 80, p: 40, k: 40, stages: ['Basal', 'Square formation', 'Boll formation'] },
  'Maize': { n: 100, p: 60, k: 40, stages: ['Basal', 'Knee-high', 'Tasseling'] },
  'Groundnut': { n: 20, p: 40, k: 60, stages: ['Basal', 'Flowering', 'Pod filling'] },
  'Soybean': { n: 20, p: 50, k: 30, stages: ['Basal', 'Flowering', 'Pod filling'] },
  'Sugarcane': { n: 150, p: 60, k: 100, stages: ['Basal', 'After 3 months', 'After 6 months'] },
  'Chickpea': { n: 20, p: 40, k: 20, stages: ['Basal', 'Flowering'] },
  'Mustard': { n: 80, p: 40, k: 20, stages: ['Basal', 'Flowering'] },
  'Turmeric': { n: 60, p: 40, k: 60, stages: ['Basal', 'After 2 months', 'After 4 months'] }
};

// Fertilizer nutrient content
const FERTILIZER_CONTENT: Record<string, { n: number; p: number; k: number }> = {
  'Urea': { n: 46, p: 0, k: 0 },
  'DAP': { n: 18, p: 46, k: 0 },
  'MOP': { n: 0, p: 0, k: 60 },
  'SSP': { n: 0, p: 16, k: 0 },
  'NPK 10:26:26': { n: 10, p: 26, k: 26 },
  'NPK 12:32:16': { n: 12, p: 32, k: 16 },
  'NPK 19:19:19': { n: 19, p: 19, k: 19 },
  'Complex 15:15:15': { n: 15, p: 15, k: 15 }
};

export function getFertilizerRecommendation(params: FertilizerParameters): FertilizerResponse {
  // Validate inputs
  const validatedParams = validateFertilizerParameters(params);
  
  // Check if soil test data is available
  const hasSoilTest = validatedParams.soilNitrogen !== undefined || 
                      validatedParams.soilPhosphorus !== undefined || 
                      validatedParams.soilPotassium !== undefined;
  
  if (!hasSoilTest) {
    return {
      recommendation: generateGeneralRecommendation(validatedParams),
      generatedAt: new Date()
    };
  }

  // Calculate nutrient requirements based on soil test
  const nutrientReq = calculateNutrientRequirement(validatedParams);
  
  // Calculate fertilizer applications
  const fertilizerApps = calculateFertilizerApplications(nutrientReq, validatedParams);
  
  // Generate timing recommendations
  const timing = generateTiming(validatedParams.crop);
  
  // Generate precautions
  const precautions = generatePrecautions(validatedParams.crop);
  
  // Generate calculation explanation
  const explanation = generateCalculationExplanation(validatedParams, nutrientReq, fertilizerApps);

  const recommendation: FertilizerRecommendation = {
    crop: validatedParams.crop,
    area: validatedParams.area,
    nutrientRequirement: nutrientReq,
    recommendedFertilizers: fertilizerApps,
    timing,
    precautions,
    calculationExplanation: explanation,
    source: 'ICAR Fertilizer Recommendations',
    requiresSoilTest: true
  };

  return {
    recommendation,
    generatedAt: new Date()
  };
}

function validateFertilizerParameters(params: FertilizerParameters): FertilizerParameters {
  return {
    crop: params.crop,
    cropStage: params.cropStage,
    soilNitrogen: params.soilNitrogen !== undefined ? Math.max(0, params.soilNitrogen) : undefined,
    soilPhosphorus: params.soilPhosphorus !== undefined ? Math.max(0, params.soilPhosphorus) : undefined,
    soilPotassium: params.soilPotassium !== undefined ? Math.max(0, params.soilPotassium) : undefined,
    soilPh: params.soilPh,
    area: Math.max(0.1, params.area),
    targetYield: params.targetYield,
    state: params.state,
    soilType: params.soilType
  };
}

function calculateNutrientRequirement(params: FertilizerParameters): NutrientRequirement {
  const cropData = CROP_NUTRIENT_REQUIREMENTS[params.crop];
  
  if (!cropData) {
    return { nitrogen: 0, phosphorus: 0, potassium: 0 };
  }

  let n = cropData.n;
  let p = cropData.p;
  let k = cropData.k;

  // Adjust based on soil test values
  if (params.soilNitrogen !== undefined) {
    const nStatus = getSoilNutrientStatus(params.soilNitrogen, 'nitrogen');
    if (nStatus === 'high') n = n * 0.5;
    else if (nStatus === 'medium') n = n * 0.75;
  }

  if (params.soilPhosphorus !== undefined) {
    const pStatus = getSoilNutrientStatus(params.soilPhosphorus, 'phosphorus');
    if (pStatus === 'high') p = p * 0.5;
    else if (pStatus === 'medium') p = p * 0.75;
  }

  if (params.soilPotassium !== undefined) {
    const kStatus = getSoilNutrientStatus(params.soilPotassium, 'potassium');
    if (kStatus === 'high') k = k * 0.5;
    else if (kStatus === 'medium') k = k * 0.75;
  }

  // Adjust based on target yield if provided
  if (params.targetYield) {
    const baseYield = 50; // quintals/ha baseline
    const yieldRatio = params.targetYield / baseYield;
    n = n * yieldRatio;
    p = p * yieldRatio;
    k = k * yieldRatio;
  }

  return {
    nitrogen: Math.round(n),
    phosphorus: Math.round(p),
    potassium: Math.round(k)
  };
}

function getSoilNutrientStatus(value: number, nutrient: string): 'low' | 'medium' | 'high' {
  const ranges: Record<string, { low: number; medium: number }> = {
    nitrogen: { low: 280, medium: 560 },
    phosphorus: { low: 10, medium: 25 },
    potassium: { low: 120, medium: 280 }
  };

  const range = ranges[nutrient];
  if (!range) return 'medium';

  if (value <= range.low) return 'low';
  if (value <= range.medium) return 'medium';
  return 'high';
}

function calculateFertilizerApplications(
  requirement: NutrientRequirement,
  params: FertilizerParameters
): FertilizerApplication[] {
  const applications: FertilizerApplication[] = [];

  // Nitrogen - typically from Urea
  if (requirement.nitrogen > 0) {
    const ureaQuantity = Math.round((requirement.nitrogen / FERTILIZER_CONTENT['Urea'].n) * 100) / 100;
    const ureaPerAcre = Math.round((ureaQuantity / 2.47) * 100) / 100; // Convert ha to acre
    const totalUrea = Math.round(ureaPerAcre * params.area);

    applications.push({
      fertilizer: 'Urea',
      nutrient: 'Nitrogen',
      quantity: ureaQuantity,
      quantityPerAcre: ureaPerAcre,
      totalQuantity: totalUrea,
      applicationStage: 'Split application recommended'
    });
  }

  // Phosphorus - typically from DAP or SSP
  if (requirement.phosphorus > 0) {
    const dapQuantity = Math.round((requirement.phosphorus / FERTILIZER_CONTENT['DAP'].p) * 100) / 100;
    const dapPerAcre = Math.round((dapQuantity / 2.47) * 100) / 100;
    const totalDap = Math.round(dapPerAcre * params.area);

    applications.push({
      fertilizer: 'DAP',
      nutrient: 'Phosphorus',
      quantity: dapQuantity,
      quantityPerAcre: dapPerAcre,
      totalQuantity: totalDap,
      applicationStage: 'Basal application'
    });
  }

  // Potassium - typically from MOP
  if (requirement.potassium > 0) {
    const mopQuantity = Math.round((requirement.potassium / FERTILIZER_CONTENT['MOP'].k) * 100) / 100;
    const mopPerAcre = Math.round((mopQuantity / 2.47) * 100) / 100;
    const totalMop = Math.round(mopPerAcre * params.area);

    applications.push({
      fertilizer: 'MOP',
      nutrient: 'Potassium',
      quantity: mopQuantity,
      quantityPerAcre: mopPerAcre,
      totalQuantity: totalMop,
      applicationStage: 'Basal or split application'
    });
  }

  return applications;
}

function generateTiming(crop: string): string[] {
  const cropData = CROP_NUTRIENT_REQUIREMENTS[crop];
  return cropData ? cropData.stages : ['Basal', 'Mid-season'];
}

function generatePrecautions(crop: string): string[] {
  const precautions: string[] = [
    'Always follow soil test report recommendations',
    'Apply fertilizers based on crop stage',
    'Avoid over-application to prevent environmental damage',
    'Use proper application methods (broadcast, placement, foliar)',
    'Maintain proper irrigation after fertilizer application'
  ];

  if (crop === 'Rice' || crop === 'Wheat') {
    precautions.push('Avoid nitrogen application before heavy rain to prevent leaching');
  }

  if (crop === 'Cotton') {
    precautions.push('Be careful with nitrogen during boll formation');
  }

  precautions.push('Consult local agriculture department for region-specific recommendations');

  return precautions;
}

function generateCalculationExplanation(
  params: FertilizerParameters,
  req: NutrientRequirement,
  apps: FertilizerApplication[]
): string {
  let explanation = `Nutrient Requirement Calculation:\n`;
  explanation += `Crop: ${params.crop}, Area: ${params.area} acres\n`;
  
  if (params.targetYield) {
    explanation += `Target Yield: ${params.targetYield} quintals/ha\n`;
  }

  explanation += `\nRequired Nutrients (kg/ha):\n`;
  explanation += `Nitrogen: ${req.nitrogen} kg/ha\n`;
  explanation += `Phosphorus: ${req.phosphorus} kg/ha\n`;
  explanation += `Potassium: ${req.potassium} kg/ha\n`;

  if (params.soilNitrogen !== undefined) {
    explanation += `\nSoil Test Nitrogen: ${params.soilNitrogen} kg/ha (adjusted requirement)\n`;
  }
  if (params.soilPhosphorus !== undefined) {
    explanation += `Soil Test Phosphorus: ${params.soilPhosphorus} kg/ha (adjusted requirement)\n`;
  }
  if (params.soilPotassium !== undefined) {
    explanation += `Soil Test Potassium: ${params.soilPotassium} kg/ha (adjusted requirement)\n`;
  }

  explanation += `\nFertilizer Calculations:\n`;
  apps.forEach(app => {
    explanation += `${app.fertilizer}: ${app.quantity} kg/ha = ${app.quantityPerAcre} kg/acre\n`;
    explanation += `Total for ${params.area} acres: ${app.totalQuantity} kg\n`;
  });

  return explanation;
}

function generateGeneralRecommendation(params: FertilizerParameters): FertilizerRecommendation {
  const cropData = CROP_NUTRIENT_REQUIREMENTS[params.crop];
  
  let explanation = `General Fertilizer Recommendation for ${params.crop}:\n`;
  explanation += `Area: ${params.area} acres\n`;
  explanation += `\nNote: This is a general recommendation. For accurate fertilizer requirements, a soil test is strongly recommended.\n`;
  explanation += `Contact your local agriculture department or Krishi Vigyan Kendra for soil testing services.\n`;

  if (cropData) {
    explanation += `\nGeneral nutrient requirement (without soil test):\n`;
    explanation += `Nitrogen: ${cropData.n} kg/ha\n`;
    explanation += `Phosphorus: ${cropData.p} kg/ha\n`;
    explanation += `Potassium: ${cropData.k} kg/ha\n`;
  }

  return {
    crop: params.crop,
    area: params.area,
    nutrientRequirement: { nitrogen: 0, phosphorus: 0, potassium: 0 },
    recommendedFertilizers: [],
    timing: cropData ? cropData.stages : [],
    precautions: [
      'Soil test is required for accurate fertilizer recommendation',
      'Contact local agriculture department for soil testing',
      'General recommendations may lead to over/under application'
    ],
    calculationExplanation: explanation,
    source: 'ICAR General Guidelines',
    requiresSoilTest: true
  };
}

export function formatFertilizerRecommendation(response: FertilizerResponse, language: string = 'en'): string {
  if (response.error) {
    return response.error;
  }

  const rec = response.recommendation;
  let result = `Fertilizer Recommendation Report
================================

Crop: ${rec.crop}
Area: ${rec.area} acres
Source: ${rec.source}
Generated: ${response.generatedAt.toLocaleString(language)}

`;

  if (rec.requiresSoilTest && rec.recommendedFertilizers.length === 0) {
    result += `IMPORTANT: Soil Test Required
===============================

${rec.calculationExplanation}

Recommended Actions:
`;
    rec.precautions.forEach(prec => result += `- ${prec}\n`);
    return result;
  }

  result += `Nutrient Requirement (kg/ha):
- Nitrogen: ${rec.nutrientRequirement.nitrogen} kg/ha
- Phosphorus: ${rec.nutrientRequirement.phosphorus} kg/ha
- Potassium: ${rec.nutrientRequirement.potassium} kg/ha

Recommended Fertilizers:
`;

  rec.recommendedFertilizers.forEach((app, index) => {
    result += `${index + 1}. ${app.fertilizer}
   - Nutrient: ${app.nutrient}
   - Rate: ${app.quantity} kg/ha (${app.quantityPerAcre} kg/acre)
   - Total for ${rec.area} acres: ${app.totalQuantity} kg
   - Application Stage: ${app.applicationStage}
`;
  });

  result += `\nApplication Timing:
`;
  rec.timing.forEach((time, index) => {
    result += `${index + 1}. ${time}\n`;
  });

  result += `\nCalculation Explanation:
${rec.calculationExplanation}

Precautions:
`;
  rec.precautions.forEach(prec => result += `- ${prec}\n`);

  result += `\nImportant: Always follow product label instructions and local agricultural department recommendations. Fertilizer rates may vary based on specific soil conditions, variety, and local climate.`;

  return result;
}

export function getCropList(): string[] {
  return Object.keys(CROP_NUTRIENT_REQUIREMENTS);
}

export function getCropStages(crop: string): string[] {
  const cropData = CROP_NUTRIENT_REQUIREMENTS[crop];
  return cropData ? cropData.stages : ['Basal', 'Mid-season', 'Late season'];
}
