// Crop Monitoring Service - Growth-stage guidance and monitoring
// Based on ICAR crop development stages

export interface CropMonitoringParameters {
  crop: string;
  plantingDate: Date;
  location?: string;
  growthStage?: string;
  soilType?: string;
  irrigation?: string;
  observedSymptoms?: string;
  weatherConditions?: string;
}

export interface GrowthStageGuidance {
  stage: string;
  daysAfterPlanting: string;
  keyActivities: string[];
  irrigation: string;
  nutrientManagement: string[];
  pestMonitoring: string[];
  diseaseMonitoring: string[];
  importantMilestones: string[];
}

export interface CropMonitoringResponse {
  currentStage: string;
  daysSincePlanting: number;
  guidance: GrowthStageGuidance;
  upcomingStages: GrowthStageGuidance[];
  riskAlerts: string[];
  recommendations: string[];
  source: string;
  generatedAt: Date;
}

// Crop growth stage database based on ICAR data
const CROP_GROWTH_STAGES: Record<string, GrowthStageGuidance[]> = {
  'Rice': [
    {
      stage: 'Seedling',
      daysAfterPlanting: '0-21 days',
      keyActivities: ['Nursery management', 'Transplanting', 'Water management'],
      irrigation: 'Maintain 2-3 cm standing water',
      nutrientManagement: ['Apply basal DAP', 'Avoid excessive nitrogen early'],
      pestMonitoring: ['Monitor for stem borer', 'Check for leaf folder'],
      diseaseMonitoring: ['Watch for blast symptoms', 'Monitor seedling blight'],
      importantMilestones: ['Establishment of seedlings', 'Tillering initiation']
    },
    {
      stage: 'Tillering',
      daysAfterPlanting: '21-45 days',
      keyActivities: ['Weeding', 'Top dressing', 'Water management'],
      irrigation: 'Maintain 2-5 cm standing water',
      nutrientManagement: ['Apply first top dressing of urea', 'Monitor nitrogen status'],
      pestMonitoring: ['Monitor stem borer', 'Check for gall midge'],
      diseaseMonitoring: ['Monitor for sheath blight', 'Watch for blast'],
      importantMilestones: ['Maximum tillering', 'Panicle initiation begins']
    },
    {
      stage: 'Panicle Initiation',
      daysAfterPlanting: '45-65 days',
      keyActivities: ['Second top dressing', 'Water management', 'Pest monitoring'],
      irrigation: 'Maintain 5 cm standing water',
      nutrientManagement: ['Apply second urea top dressing', 'Monitor potassium'],
      pestMonitoring: ['Monitor for brown plant hopper', 'Check for stem borer'],
      diseaseMonitoring: ['Monitor for blast', 'Watch for sheath blight'],
      importantMilestones: ['Panicle emergence', 'Booting stage']
    },
    {
      stage: 'Flowering',
      daysAfterPlanting: '65-85 days',
      keyActivities: ['Water management', 'Pest control', 'Drainage preparation'],
      irrigation: 'Maintain 5 cm standing water, then drain before harvest',
      nutrientManagement: ['Avoid late nitrogen', 'Monitor nutrient status'],
      pestMonitoring: ['Monitor for brown plant hopper', 'Check for gall midge'],
      diseaseMonitoring: ['Monitor for false smut', 'Watch for grain discoloration'],
      importantMilestones: ['Anthesis complete', 'Grain filling begins']
    },
    {
      stage: 'Maturity',
      daysAfterPlanting: '85-120 days',
      keyActivities: ['Drain field', 'Harvest preparation', 'Moisture monitoring'],
      irrigation: 'Drain field 15 days before harvest',
      nutrientManagement: ['No fertilizer application', 'Allow crop to mature'],
      pestMonitoring: ['Monitor for rodents', 'Check for birds'],
      diseaseMonitoring: ['Monitor for grain discoloration', 'Watch for storage pests'],
      importantMilestones: ['Grain hardening', 'Harvest maturity']
    }
  ],
  'Cotton': [
    {
      stage: 'Vegetative',
      daysAfterPlanting: '0-45 days',
      keyActivities: ['Thinning', 'Weeding', 'Irrigation'],
      irrigation: 'Irrigate at critical stages, avoid water stress',
      nutrientManagement: ['Apply basal fertilizer', 'Monitor nitrogen'],
      pestMonitoring: ['Monitor for jassids', 'Check for aphids', 'Look for thrips'],
      diseaseMonitoring: ['Monitor for wilt', 'Watch for seedling diseases'],
      importantMilestones: ['Square formation begins', 'Vegetative growth complete']
    },
    {
      stage: 'Squaring',
      daysAfterPlanting: '45-70 days',
      keyActivities: ['Irrigation management', 'Pest monitoring', 'Nutrient application'],
      irrigation: 'Critical irrigation at square formation',
      nutrientManagement: ['Apply nitrogen top dressing', 'Monitor potassium'],
      pestMonitoring: ['Monitor for bollworm', 'Check for whitefly', 'Look for spider mites'],
      diseaseMonitoring: ['Monitor for Alternaria', 'Watch for bacterial blight'],
      importantMilestones: ['First squares appear', 'Flowering begins']
    },
    {
      stage: 'Flowering',
      daysAfterPlanting: '70-100 days',
      keyActivities: ['Irrigation', 'Pest control', 'Plant growth regulation'],
      irrigation: 'Regular irrigation at flowering',
      nutrientManagement: ['Avoid late nitrogen', 'Monitor nutrient status'],
      pestMonitoring: ['Monitor for bollworm', 'Check for pink bollworm', 'Look for whitefly'],
      diseaseMonitoring: ['Monitor for boll rot', 'Watch for fungal infections'],
      importantMilestones: ['Peak flowering', 'Boll formation begins']
    },
    {
      stage: 'Boll Formation',
      daysAfterPlanting: '100-140 days',
      keyActivities: ['Irrigation management', 'Pest control', 'Defoliation'],
      irrigation: 'Reduce irrigation, stop before harvest',
      nutrientManagement: ['No fertilizer application', 'Allow boll maturation'],
      pestMonitoring: ['Monitor for bollworm', 'Check for pink bollworm', 'Look for boll rot'],
      diseaseMonitoring: ['Monitor for boll rot', 'Watch for fungal infections'],
      importantMilestones: ['Boll maturation', 'Boll opening begins']
    },
    {
      stage: 'Maturity',
      daysAfterPlanting: '140-180 days',
      keyActivities: ['Defoliation', 'Harvest preparation', 'Picking'],
      irrigation: 'Stop irrigation before harvest',
      nutrientManagement: ['No fertilizer application'],
      pestMonitoring: ['Monitor for bollworm', 'Check for boll rot'],
      diseaseMonitoring: ['Monitor for storage pests'],
      importantMilestones: ['Boll opening complete', 'Harvest ready']
    }
  ],
  'Wheat': [
    {
      stage: 'Seedling',
      daysAfterPlanting: '0-25 days',
      keyActivities: ['Sowing', 'First irrigation', 'Weeding'],
      irrigation: 'First irrigation 21 days after sowing (CRI stage)',
      nutrientManagement: ['Apply basal DAP', 'Monitor nitrogen'],
      pestMonitoring: ['Monitor for termites', 'Check for shoot fly'],
      diseaseMonitoring: ['Monitor for seedling blight', 'Watch for loose smut'],
      importantMilestones: ['Germination complete', 'Tillering begins']
    },
    {
      stage: 'Tillering',
      daysAfterPlanting: '25-50 days',
      keyActivities: ['Second irrigation', 'Weeding', 'Top dressing'],
      irrigation: 'Second irrigation at tillering stage',
      nutrientManagement: ['Apply first urea top dressing', 'Monitor nitrogen status'],
      pestMonitoring: ['Monitor for aphids', 'Check for brown plant hopper'],
      diseaseMonitoring: ['Monitor for rust', 'Watch for leaf blight'],
      importantMilestones: ['Maximum tillering', 'Jointing begins']
    },
    {
      stage: 'Jointing',
      daysAfterPlanting: '50-70 days',
      keyActivities: ['Third irrigation', 'Pest monitoring', 'Nutrient monitoring'],
      irrigation: 'Third irrigation at jointing stage',
      nutrientManagement: ['Apply second urea top dressing', 'Monitor nutrient status'],
      pestMonitoring: ['Monitor for aphids', 'Check for armyworm'],
      diseaseMonitoring: ['Monitor for rust', 'Watch for Karnal bunt'],
      importantMilestones: ['Stem elongation', 'Booting begins']
    },
    {
      stage: 'Booting',
      daysAfterPlanting: '70-90 days',
      keyActivities: ['Fourth irrigation', 'Pest control', 'Disease monitoring'],
      irrigation: 'Fourth irrigation at booting stage',
      nutrientManagement: ['Monitor nutrient status', 'Avoid late nitrogen'],
      pestMonitoring: ['Monitor for aphids', 'Check for armyworm'],
      diseaseMonitoring: ['Monitor for rust', 'Watch for Karnal bunt', 'Monitor for flag leaf diseases'],
      importantMilestones: ['Booting complete', 'Heading begins']
    },
    {
      stage: 'Flowering',
      daysAfterPlanting: '90-110 days',
      keyActivities: ['Fifth irrigation', 'Disease control', 'Harvest preparation'],
      irrigation: 'Fifth irrigation at flowering stage',
      nutrientManagement: ['No fertilizer application', 'Monitor nutrient status'],
      pestMonitoring: ['Monitor for aphids', 'Check for rodents'],
      diseaseMonitoring: ['Monitor for rust', 'Watch for Karnal bunt', 'Monitor for glume blotch'],
      importantMilestones: ['Anthesis complete', 'Grain filling begins']
    },
    {
      stage: 'Maturity',
      daysAfterPlanting: '110-130 days',
      keyActivities: ['Final irrigation', 'Harvest preparation', 'Moisture monitoring'],
      irrigation: 'Stop irrigation before harvest',
      nutrientManagement: ['No fertilizer application'],
      pestMonitoring: ['Monitor for rodents', 'Check for birds'],
      diseaseMonitoring: ['Monitor for storage pests'],
      importantMilestones: ['Grain hardening', 'Harvest maturity']
    }
  ],
  'Maize': [
    {
      stage: 'Seedling',
      daysAfterPlanting: '0-20 days',
      keyActivities: ['Thinning', 'Weeding', 'First irrigation'],
      irrigation: 'First irrigation 3 weeks after sowing',
      nutrientManagement: ['Apply basal fertilizer', 'Monitor nitrogen'],
      pestMonitoring: ['Monitor for stem borer', 'Check for shoot fly'],
      diseaseMonitoring: ['Monitor for seedling blight', 'Watch for downy mildew'],
      importantMilestones: ['Germination complete', 'Knee-high stage begins']
    },
    {
      stage: 'Vegetative',
      daysAfterPlanting: '20-45 days',
      keyActivities: ['Weeding', 'Second irrigation', 'Top dressing'],
      irrigation: 'Second irrigation at knee-high stage',
      nutrientManagement: ['Apply nitrogen top dressing', 'Monitor nutrient status'],
      pestMonitoring: ['Monitor for stem borer', 'Check for fall armyworm'],
      diseaseMonitoring: ['Monitor for turcicum leaf blight', 'Watch for common rust'],
      importantMilestones: ['Knee-high stage', 'Tasseling begins']
    },
    {
      stage: 'Flowering',
      daysAfterPlanting: '45-65 days',
      keyActivities: ['Irrigation', 'Pest control', 'Nutrient monitoring'],
      irrigation: 'Irrigation at flowering critical',
      nutrientManagement: ['Monitor nutrient status', 'Avoid late nitrogen'],
      pestMonitoring: ['Monitor for stem borer', 'Check for fall armyworm'],
      diseaseMonitoring: ['Monitor for turcicum leaf blight', 'Watch for common rust'],
      importantMilestones: ['Tasseling complete', 'Silking complete']
    },
    {
      stage: 'Grain Filling',
      daysAfterPlanting: '65-90 days',
      keyActivities: ['Irrigation management', 'Pest monitoring', 'Harvest preparation'],
      irrigation: 'Reduce irrigation, stop before harvest',
      nutrientManagement: ['No fertilizer application'],
      pestMonitoring: ['Monitor for stem borer', 'Check for birds'],
      diseaseMonitoring: ['Monitor for ear rot', 'Watch for fungal infections'],
      importantMilestones: ['Grain filling complete', 'Dent stage']
    },
    {
      stage: 'Maturity',
      daysAfterPlanting: '90-110 days',
      keyActivities: ['Harvest preparation', 'Moisture monitoring'],
      irrigation: 'Stop irrigation before harvest',
      nutrientManagement: ['No fertilizer application'],
      pestMonitoring: ['Monitor for rodents', 'Check for birds'],
      diseaseMonitoring: ['Monitor for storage pests'],
      importantMilestones: ['Physiological maturity', 'Harvest ready']
    }
  ]
};

export function getCropMonitoring(params: CropMonitoringParameters): CropMonitoringResponse {
  // Validate inputs
  const validatedParams = validateMonitoringParameters(params);
  
  // Calculate days since planting
  const daysSincePlanting = calculateDaysSincePlanting(validatedParams.plantingDate);
  
  // Get growth stages for the crop
  const cropStages = CROP_GROWTH_STAGES[validatedParams.crop];
  
  if (!cropStages) {
    return {
      currentStage: 'Unknown',
      daysSincePlanting,
      guidance: generateGenericGuidance(validatedParams),
      upcomingStages: [],
      riskAlerts: [`No specific growth stage data available for ${validatedParams.crop}. Please consult local agriculture department.`],
      recommendations: ['Contact local Krishi Vigyan Kendra for crop-specific monitoring guidance'],
      source: 'General Agricultural Guidelines',
      generatedAt: new Date()
    };
  }

  // Determine current stage based on days since planting
  const currentStageIndex = determineCurrentStage(daysSincePlanting, cropStages);
  const currentStage = cropStages[currentStageIndex];
  
  // Get upcoming stages
  const upcomingStages = cropStages.slice(currentStageIndex + 1);
  
  // Generate risk alerts based on observed symptoms and conditions
  const riskAlerts = generateRiskAlerts(validatedParams, currentStage);
  
  // Generate recommendations
  const recommendations = generateRecommendations(validatedParams, currentStage, upcomingStages);

  return {
    currentStage: currentStage.stage,
    daysSincePlanting,
    guidance: currentStage,
    upcomingStages,
    riskAlerts,
    recommendations,
    source: 'ICAR Crop Development Stages',
    generatedAt: new Date()
  };
}

function validateMonitoringParameters(params: CropMonitoringParameters): CropMonitoringParameters {
  return {
    crop: params.crop,
    plantingDate: params.plantingDate,
    location: params.location,
    growthStage: params.growthStage,
    soilType: params.soilType,
    irrigation: params.irrigation,
    observedSymptoms: params.observedSymptoms,
    weatherConditions: params.weatherConditions
  };
}

function calculateDaysSincePlanting(plantingDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - plantingDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function determineCurrentStage(daysSincePlanting: number, stages: GrowthStageGuidance[]): number {
  for (let i = 0; i < stages.length; i++) {
    const stageDays = parseDayRange(stages[i].daysAfterPlanting);
    if (daysSincePlanting >= stageDays.min && daysSincePlanting <= stageDays.max) {
      return i;
    }
  }
  // If beyond last stage, return last stage
  return stages.length - 1;
}

function parseDayRange(rangeStr: string): { min: number; max: number } {
  const match = rangeStr.match(/(\d+)-(\d+)/);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  return { min: 0, max: 999 };
}

function generateRiskAlerts(params: CropMonitoringParameters, currentStage: GrowthStageGuidance): string[] {
  const alerts: string[] = [];

  // Check observed symptoms
  if (params.observedSymptoms) {
    alerts.push(`Observed symptoms: ${params.observedSymptoms}. Expert diagnosis recommended.`);
  }

  // Check weather conditions
  if (params.weatherConditions) {
    if (params.weatherConditions.toLowerCase().includes('rain') && 
        currentStage.stage === 'Flowering') {
      alerts.push('Heavy rain during flowering may affect pollination and grain set.');
    }
    if (params.weatherConditions.toLowerCase().includes('drought') && 
        (currentStage.stage === 'Flowering' || currentStage.stage === 'Grain Filling')) {
      alerts.push('Drought stress during critical stages may significantly reduce yield.');
    }
  }

  // Check irrigation status
  if (params.irrigation === 'Low' && currentStage.stage === 'Flowering') {
    alerts.push('Low irrigation during flowering may affect yield. Ensure adequate water.');
  }

  return alerts;
}

function generateRecommendations(
  params: CropMonitoringParameters,
  currentStage: GrowthStageGuidance,
  upcomingStages: GrowthStageGuidance[]
): string[] {
  const recommendations: string[] = [];

  // Current stage recommendations
  recommendations.push(`Current priority: ${currentStage.stage} stage activities`);
  currentStage.keyActivities.forEach(activity => {
    recommendations.push(`- ${activity}`);
  });

  // Upcoming stage preparation
  if (upcomingStages.length > 0) {
    recommendations.push(`Prepare for upcoming stage: ${upcomingStages[0].stage}`);
  }

  // General recommendations
  recommendations.push('Monitor crop health regularly');
  recommendations.push('Follow irrigation schedule');
  recommendations.push('Watch for pest and disease symptoms');
  recommendations.push('Maintain field records');

  if (params.observedSymptoms) {
    recommendations.push('Consult local agriculture expert for symptom diagnosis');
  }

  return recommendations;
}

function generateGenericGuidance(_params: CropMonitoringParameters): GrowthStageGuidance {
  return {
    stage: 'General',
    daysAfterPlanting: 'Variable',
    keyActivities: ['Regular monitoring', 'Irrigation management', 'Pest monitoring'],
    irrigation: 'Based on crop requirements',
    nutrientManagement: ['Follow soil test recommendations', 'Monitor crop health'],
    pestMonitoring: ['Regular field scouting', 'Monitor pest population'],
    diseaseMonitoring: ['Monitor for disease symptoms', 'Track disease spread'],
    importantMilestones: ['Germination', 'Flowering', 'Maturity']
  };
}

export function formatCropMonitoring(response: CropMonitoringResponse, language: string = 'en'): string {
  let result = `Crop Monitoring Report
======================

Crop: ${response.currentStage}
Days Since Planting: ${response.daysSincePlanting}
Source: ${response.source}
Generated: ${response.generatedAt.toLocaleString(language)}

Current Stage: ${response.guidance.stage}
Days After Planting: ${response.guidance.daysAfterPlanting}

Key Activities:
`;
  response.guidance.keyActivities.forEach((activity, index) => {
    result += `${index + 1}. ${activity}\n`;
  });

  result += `\nIrrigation: ${response.guidance.irrigation}

Nutrient Management:
`;
  response.guidance.nutrientManagement.forEach((nutrient, index) => {
    result += `${index + 1}. ${nutrient}\n`;
  });

  result += `\nPest Monitoring:
`;
  response.guidance.pestMonitoring.forEach((pest, index) => {
    result += `${index + 1}. ${pest}\n`;
  });

  result += `\nDisease Monitoring:
`;
  response.guidance.diseaseMonitoring.forEach((disease, index) => {
    result += `${index + 1}. ${disease}\n`;
  });

  result += `\nImportant Milestones:
`;
  response.guidance.importantMilestones.forEach((milestone, index) => {
    result += `${index + 1}. ${milestone}\n`;
  });

  if (response.riskAlerts.length > 0) {
    result += `\n⚠️ Risk Alerts:
`;
    response.riskAlerts.forEach(alert => result += `- ${alert}\n`);
  }

  result += `\nRecommendations:
`;
  response.recommendations.forEach((rec, index) => {
    result += `${index + 1}. ${rec}\n`;
  });

  if (response.upcomingStages.length > 0) {
    result += `\nUpcoming Stages:
`;
    response.upcomingStages.slice(0, 2).forEach((stage, index) => {
      result += `${index + 1}. ${stage.stage} (${stage.daysAfterPlanting})\n`;
    });
  }

  result += `\nImportant: This guidance is based on general crop development stages. For specific local conditions, consult your local agriculture department or Krishi Vigyan Kendra.`;

  return result;
}

export function getCropList(): string[] {
  return Object.keys(CROP_GROWTH_STAGES);
}

export function getGrowthStages(crop: string): string[] {
  const stages = CROP_GROWTH_STAGES[crop];
  return stages ? stages.map(s => s.stage) : [];
}
