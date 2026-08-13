// Soil Analysis Service - Validates and interprets soil parameters
// Based on ICAR and Soil Health Card standards

export interface SoilParameters {
  ph?: number;
  nitrogen?: number; // kg/ha
  phosphorus?: number; // kg/ha
  potassium?: number; // kg/ha
  organicCarbon?: number; // %
  electricalConductivity?: number; // dS/m
  soilType?: string;
  moisture?: string;
  location?: string;
  crop?: string;
}

export interface SoilAnalysis {
  parameters: SoilParameters;
  interpretations: SoilInterpretation;
  limitations: string[];
  recommendations: string[];
  suitableCrops?: string[];
  source: string;
  analyzedAt: Date;
}

export interface SoilInterpretation {
  ph: { value: number; status: string; meaning: string };
  nitrogen: { value: number; status: string; meaning: string };
  phosphorus: { value: number; status: string; meaning: string };
  potassium: { value: number; status: string; meaning: string };
  organicCarbon: { value: number; status: string; meaning: string };
  electricalConductivity?: { value: number; status: string; meaning: string };
}

// ICAR Soil Health Card reference ranges
const PH_RANGES = {
  acidic: { max: 5.5, status: 'Acidic', meaning: 'Soil is acidic. Lime application may be needed for most crops.' },
  moderatelyAcidic: { max: 6.5, status: 'Moderately Acidic', meaning: 'Slightly acidic. Suitable for many crops with appropriate management.' },
  neutral: { max: 7.5, status: 'Neutral', meaning: 'Ideal pH for most crops. Nutrient availability is optimal.' },
  moderatelyAlkaline: { max: 8.5, status: 'Moderately Alkaline', meaning: 'Slightly alkaline. Some micronutrients may be less available.' },
  alkaline: { max: 10, status: 'Alkaline', meaning: 'Alkaline soil. May require gypsum or organic amendments.' }
};

const NITROGEN_RANGES = {
  low: { max: 280, status: 'Low', meaning: 'Nitrogen is deficient. Higher nitrogen fertilization required.' },
  medium: { max: 560, status: 'Medium', meaning: 'Nitrogen is moderate. Standard nitrogen application recommended.' },
  high: { max: 1000, status: 'High', meaning: 'Nitrogen is sufficient. Reduce nitrogen application.' }
};

const PHOSPHORUS_RANGES = {
  low: { max: 10, status: 'Low', meaning: 'Phosphorus is deficient. Phosphatic fertilization needed.' },
  medium: { max: 25, status: 'Medium', meaning: 'Phosphorus is moderate. Balanced P application recommended.' },
  high: { max: 100, status: 'High', meaning: 'Phosphorus is sufficient. Reduce phosphorus application.' }
};

const POTASSIUM_RANGES = {
  low: { max: 120, status: 'Low', meaning: 'Potassium is deficient. Potassic fertilization needed.' },
  medium: { max: 280, status: 'Medium', meaning: 'Potassium is moderate. Balanced K application recommended.' },
  high: { max: 600, status: 'High', meaning: 'Potassium is sufficient. Reduce potassium application.' }
};

const ORGANIC_CARBON_RANGES = {
  low: { max: 0.5, status: 'Low', meaning: 'Organic matter is low. Add organic manure/compost.' },
  medium: { max: 0.75, status: 'Medium', meaning: 'Organic matter is moderate. Maintain organic inputs.' },
  high: { max: 2.0, status: 'High', meaning: 'Organic matter is good. Continue soil health practices.' }
};

const EC_RANGES = {
  normal: { max: 2.0, status: 'Normal', meaning: 'Salinity is within acceptable limits.' },
  moderatelySaline: { max: 4.0, status: 'Moderately Saline', meaning: 'Moderate salinity. Salt-sensitive crops may be affected.' },
  saline: { max: 10, status: 'Saline', meaning: 'High salinity. Salt-tolerant crops recommended. Leaching may be needed.' }
};

export function analyzeSoil(parameters: SoilParameters): SoilAnalysis {
  // Validate inputs
  const validatedParams = validateSoilParameters(parameters);
  
  // Interpret each parameter
  const interpretations: SoilInterpretation = {
    ph: interpretPH(validatedParams.ph),
    nitrogen: interpretNitrogen(validatedParams.nitrogen),
    phosphorus: interpretPhosphorus(validatedParams.phosphorus),
    potassium: interpretPotassium(validatedParams.potassium),
    organicCarbon: interpretOrganicCarbon(validatedParams.organicCarbon)
  };

  if (validatedParams.electricalConductivity !== undefined) {
    interpretations.electricalConductivity = interpretEC(validatedParams.electricalConductivity);
  }

  // Identify limitations
  const limitations = identifyLimitations(interpretations, validatedParams);

  // Generate recommendations
  const recommendations = generateRecommendations(interpretations, validatedParams);

  // Suggest suitable crops if enough data available
  const suitableCrops = suggestCrops(interpretations, validatedParams);

  return {
    parameters: validatedParams,
    interpretations,
    limitations,
    recommendations,
    suitableCrops,
    source: 'ICAR Soil Health Card Standards',
    analyzedAt: new Date()
  };
}

function validateSoilParameters(params: SoilParameters): SoilParameters {
  const validated: SoilParameters = { ...params };

  if (validated.ph !== undefined) {
    validated.ph = Math.max(0, Math.min(14, validated.ph));
  }
  if (validated.nitrogen !== undefined) {
    validated.nitrogen = Math.max(0, Math.min(2000, validated.nitrogen));
  }
  if (validated.phosphorus !== undefined) {
    validated.phosphorus = Math.max(0, Math.min(200, validated.phosphorus));
  }
  if (validated.potassium !== undefined) {
    validated.potassium = Math.max(0, Math.min(1000, validated.potassium));
  }
  if (validated.organicCarbon !== undefined) {
    validated.organicCarbon = Math.max(0, Math.min(5, validated.organicCarbon));
  }
  if (validated.electricalConductivity !== undefined) {
    validated.electricalConductivity = Math.max(0, Math.min(20, validated.electricalConductivity));
  }

  return validated;
}

function interpretPH(ph?: number): { value: number; status: string; meaning: string } {
  if (ph === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'pH data not provided.' };
  }

  for (const [, range] of Object.entries(PH_RANGES)) {
    if (ph <= range.max) {
      return { value: ph, status: range.status, meaning: range.meaning };
    }
  }

  return { value: ph, status: 'Very Alkaline', meaning: 'Extremely alkaline soil. Requires significant soil amendment.' };
}

function interpretNitrogen(n?: number): { value: number; status: string; meaning: string } {
  if (n === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'Nitrogen data not provided.' };
  }

  for (const [, range] of Object.entries(NITROGEN_RANGES)) {
    if (n <= range.max) {
      return { value: n, status: range.status, meaning: range.meaning };
    }
  }

  return { value: n, status: 'Very High', meaning: 'Nitrogen is very high. Avoid nitrogen application.' };
}

function interpretPhosphorus(p?: number): { value: number; status: string; meaning: string } {
  if (p === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'Phosphorus data not provided.' };
  }

  for (const [, range] of Object.entries(PHOSPHORUS_RANGES)) {
    if (p <= range.max) {
      return { value: p, status: range.status, meaning: range.meaning };
    }
  }

  return { value: p, status: 'Very High', meaning: 'Phosphorus is very high. Avoid phosphorus application.' };
}

function interpretPotassium(k?: number): { value: number; status: string; meaning: string } {
  if (k === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'Potassium data not provided.' };
  }

  for (const [, range] of Object.entries(POTASSIUM_RANGES)) {
    if (k <= range.max) {
      return { value: k, status: range.status, meaning: range.meaning };
    }
  }

  return { value: k, status: 'Very High', meaning: 'Potassium is very high. Avoid potassium application.' };
}

function interpretOrganicCarbon(oc?: number): { value: number; status: string; meaning: string } {
  if (oc === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'Organic carbon data not provided.' };
  }

  for (const [, range] of Object.entries(ORGANIC_CARBON_RANGES)) {
    if (oc <= range.max) {
      return { value: oc, status: range.status, meaning: range.meaning };
    }
  }

  return { value: oc, status: 'Very High', meaning: 'Organic matter is very high. Excellent soil health.' };
}

function interpretEC(ec?: number): { value: number; status: string; meaning: string } {
  if (ec === undefined) {
    return { value: 0, status: 'Unknown', meaning: 'Electrical conductivity data not provided.' };
  }

  for (const [, range] of Object.entries(EC_RANGES)) {
    if (ec <= range.max) {
      return { value: ec, status: range.status, meaning: range.meaning };
    }
  }

  return { value: ec, status: 'Very Saline', meaning: 'Extremely saline soil. Major soil amendment required.' };
}

function identifyLimitations(interpretations: SoilInterpretation, _params: SoilParameters): string[] {
  const limitations: string[] = [];

  if (interpretations.ph.status === 'Acidic' || interpretations.ph.status === 'Alkaline') {
    limitations.push(`pH is ${interpretations.ph.status} - may limit nutrient availability`);
  }

  if (interpretations.nitrogen.status === 'Low') {
    limitations.push('Low nitrogen may limit crop growth');
  }

  if (interpretations.phosphorus.status === 'Low') {
    limitations.push('Low phosphorus may affect root development');
  }

  if (interpretations.potassium.status === 'Low') {
    limitations.push('Low potassium may affect disease resistance and yield');
  }

  if (interpretations.organicCarbon.status === 'Low') {
    limitations.push('Low organic matter affects soil structure and water retention');
  }

  if (interpretations.electricalConductivity?.status === 'Saline' || interpretations.electricalConductivity?.status === 'Very Saline') {
    limitations.push('High salinity limits crop options and requires management');
  }

  return limitations;
}

function generateRecommendations(interpretations: SoilInterpretation, _params: SoilParameters): string[] {
  const recommendations: string[] = [];

  if (interpretations.ph.status === 'Acidic') {
    recommendations.push('Consider lime application to raise pH. Consult local agriculture department for specific rates.');
  } else if (interpretations.ph.status === 'Alkaline' || interpretations.ph.status === 'Very Alkaline') {
    recommendations.push('Consider gypsum or organic amendments to lower pH. Consult local agriculture department for specific rates.');
  }

  if (interpretations.nitrogen.status === 'Low') {
    recommendations.push('Apply nitrogenous fertilizers based on crop requirement. Split applications are recommended for better efficiency.');
  }

  if (interpretations.phosphorus.status === 'Low') {
    recommendations.push('Apply phosphatic fertilizers. Band placement near seeds improves availability.');
  }

  if (interpretations.potassium.status === 'Low') {
    recommendations.push('Apply potassic fertilizers. Potassium is important for disease resistance and quality.');
  }

  if (interpretations.organicCarbon.status === 'Low') {
    recommendations.push('Incorporate organic manure, compost, or green manure to improve soil health.');
  }

  if (interpretations.electricalConductivity?.status === 'Saline' || interpretations.electricalConductivity?.status === 'Very Saline') {
    recommendations.push('Improve drainage, consider salt-tolerant crops, and apply gypsum if recommended by soil test.');
  }

  recommendations.push('Follow soil test report recommendations for specific crop and target yield.');
  recommendations.push('Contact local Krishi Vigyan Kendra for personalized guidance.');

  return recommendations;
}

function suggestCrops(interpretations: SoilInterpretation, params: SoilParameters): string[] | undefined {
  // Only suggest crops if we have sufficient data
  if (!params.ph || !params.soilType) {
    return undefined;
  }

  const suitableCrops: string[] = [];

  // pH-based suggestions
  if (interpretations.ph.status === 'Neutral' || interpretations.ph.status === 'Moderately Acidic') {
    suitableCrops.push('Most crops including cereals, pulses, vegetables');
  } else if (interpretations.ph.status === 'Acidic') {
    suitableCrops.push('Tea, coffee, potato, pineapple (acid-tolerant crops)');
  } else if (interpretations.ph.status === 'Alkaline') {
    suitableCrops.push('Cotton, sugarcane, wheat, barley (alkaline-tolerant crops)');
  }

  // Soil type-based suggestions
  if (params.soilType?.toLowerCase().includes('black')) {
    suitableCrops.push('Cotton, soybean, maize, sorghum');
  } else if (params.soilType?.toLowerCase().includes('red')) {
    suitableCrops.push('Groundnut, millets, pulses');
  } else if (params.soilType?.toLowerCase().includes('alluvial')) {
    suitableCrops.push('Rice, wheat, sugarcane, vegetables');
  }

  return suitableCrops.length > 0 ? suitableCrops : undefined;
}

export function formatSoilAnalysis(analysis: SoilAnalysis, language: string = 'en'): string {
  let result = `Soil Analysis Report
====================

Soil Parameters:
`;
  if (analysis.parameters.ph !== undefined) result += `pH: ${analysis.parameters.ph}\n`;
  if (analysis.parameters.nitrogen !== undefined) result += `Nitrogen: ${analysis.parameters.nitrogen} kg/ha\n`;
  if (analysis.parameters.phosphorus !== undefined) result += `Phosphorus: ${analysis.parameters.phosphorus} kg/ha\n`;
  if (analysis.parameters.potassium !== undefined) result += `Potassium: ${analysis.parameters.potassium} kg/ha\n`;
  if (analysis.parameters.organicCarbon !== undefined) result += `Organic Carbon: ${analysis.parameters.organicCarbon}%\n`;
  if (analysis.parameters.electricalConductivity !== undefined) result += `Electrical Conductivity: ${analysis.parameters.electricalConductivity} dS/m\n`;
  if (analysis.parameters.soilType) result += `Soil Type: ${analysis.parameters.soilType}\n`;

  result += `\nInterpretations:
`;
  result += `pH: ${analysis.interpretations.ph.status} - ${analysis.interpretations.ph.meaning}\n`;
  result += `Nitrogen: ${analysis.interpretations.nitrogen.status} - ${analysis.interpretations.nitrogen.meaning}\n`;
  result += `Phosphorus: ${analysis.interpretations.phosphorus.status} - ${analysis.interpretations.phosphorus.meaning}\n`;
  result += `Potassium: ${analysis.interpretations.potassium.status} - ${analysis.interpretations.potassium.meaning}\n`;
  result += `Organic Carbon: ${analysis.interpretations.organicCarbon.status} - ${analysis.interpretations.organicCarbon.meaning}\n`;
  if (analysis.interpretations.electricalConductivity) {
    result += `Electrical Conductivity: ${analysis.interpretations.electricalConductivity.status} - ${analysis.interpretations.electricalConductivity.meaning}\n`;
  }

  if (analysis.limitations.length > 0) {
    result += `\nIdentified Limitations:\n`;
    analysis.limitations.forEach(limit => result += `- ${limit}\n`);
  }

  result += `\nRecommendations:\n`;
  analysis.recommendations.forEach(rec => result += `- ${rec}\n`);

  if (analysis.suitableCrops && analysis.suitableCrops.length > 0) {
    result += `\nSuitable Crops:\n`;
    analysis.suitableCrops.forEach(crop => result += `- ${crop}\n`);
  }

  result += `\nSource: ${analysis.source}
Analyzed: ${analysis.analyzedAt.toLocaleString(language)}`;

  return result;
}
