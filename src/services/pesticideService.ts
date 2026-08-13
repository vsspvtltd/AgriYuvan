// Pesticide Guidance Service - IPM-focused pest management
// Does NOT invent pesticide dosages or products
// Uses verified agricultural extension guidance

export interface PestParameters {
  crop: string;
  pest?: string;
  disease?: string;
  symptoms?: string;
  growthStage?: string;
  location?: string;
  severity?: 'Low' | 'Medium' | 'High';
}

export interface IPMRecommendation {
  identification: string;
  prevention: string[];
  culturalControl: string[];
  mechanicalControl: string[];
  biologicalControl: string[];
  chemicalControl?: {
    products: string[];
    activeIngredients: string[];
    precautions: string[];
    disclaimer: string;
  };
  monitoring: string[];
  source: string;
  requiresExpertDiagnosis: boolean;
}

export interface PesticideResponse {
  recommendation: IPMRecommendation;
  error?: string;
  generatedAt: Date;
}

// IPM database based on ICAR and agricultural extension guidelines
const IPM_DATABASE: Record<string, {
  pests: Record<string, IPMRecommendation>;
  diseases: Record<string, IPMRecommendation>;
}> = {
  'Cotton': {
    pests: {
      'Bollworm': {
        identification: 'Bollworm larvae feed on squares, flowers, and bolls. Look for frass entry holes and damaged bolls.',
        prevention: ['Use resistant varieties', 'Destroy crop residues', 'Avoid late sowing', 'Maintain proper plant spacing'],
        culturalControl: ['Deep summer ploughing', 'Crop rotation with non-host crops', 'Remove infested plant parts'],
        mechanicalControl: ['Handpick and destroy larvae', 'Install pheromone traps', 'Use light traps'],
        biologicalControl: ['Conserve natural enemies like Trichogramma', 'Release Chrysoperla predators', 'Use NPV virus sprays'],
        monitoring: ['Monitor squares and bolls weekly', 'Check for frass entry holes', 'Count larvae per plant'],
        source: 'ICAR-CICR / State Agricultural Departments',
        requiresExpertDiagnosis: false
      },
      'Whitefly': {
        identification: 'Small white insects on underside of leaves. Leaves may show yellowing and sooty mold.',
        prevention: ['Use yellow sticky traps', 'Avoid excessive nitrogen', 'Control weeds'],
        culturalControl: ['Remove infested leaves', 'Avoid overcrowding', 'Proper irrigation management'],
        mechanicalControl: ['Install yellow sticky traps', 'Remove heavily infested plants'],
        biologicalControl: ['Conserve lady beetles', 'Release Encarsia formosa parasitoids', 'Use neem-based sprays'],
        monitoring: ['Check underside of leaves', 'Monitor population weekly', 'Look for sooty mold'],
        source: 'ICAR-CICR / State Agricultural Departments',
        requiresExpertDiagnosis: false
      }
    },
    diseases: {
      'Wilt': {
        identification: 'Sudden wilting of plants, yellowing of leaves, vascular discoloration in stem.',
        prevention: ['Use disease-free seeds', 'Crop rotation', 'Avoid waterlogging', 'Use resistant varieties'],
        culturalControl: ['Remove infected plants', 'Deep ploughing', 'Soil solarization'],
        mechanicalControl: ['Remove and destroy infected plants', 'Sterilize tools'],
        biologicalControl: ['Use Trichoderma-based seed treatment', 'Apply biocontrol agents'],
        monitoring: ['Check for wilting symptoms', 'Monitor vascular tissue', 'Track disease spread'],
        source: 'ICAR-CICR / State Agricultural Departments',
        requiresExpertDiagnosis: true
      }
    }
  },
  'Rice': {
    pests: {
      'Stem Borer': {
        identification: 'Dead hearts in tillers, white heads at maturity, larvae bore into stems.',
        prevention: ['Use resistant varieties', 'Early planting', 'Remove stubble', 'Clip leaf tips'],
        culturalControl: ['Remove and destroy stubble', 'Field sanitation', 'Synchronous planting'],
        mechanicalControl: ['Use pheromone traps', 'Install light traps', 'Handpick egg masses'],
        biologicalControl: ['Release Trichogramma cards', 'Conserve natural enemies', 'Use Bt formulations'],
        monitoring: ['Check for dead hearts', 'Monitor egg masses', 'Count adults per trap'],
        source: 'ICAR-IIRR / State Agricultural Departments',
        requiresExpertDiagnosis: false
      },
      'Brown Plant Hopper': {
        identification: 'Hopper burn symptoms, yellowing and drying of plants from base upward.',
        prevention: ['Use resistant varieties', 'Avoid excessive nitrogen', 'Maintain proper water management'],
        culturalControl: ['Drain fields periodically', 'Remove weeds', 'Avoid close spacing'],
        mechanicalControl: ['Sweep nets to monitor', 'Remove infected plants'],
        biologicalControl: ['Conserve spiders and mirid bugs', 'Use fungal pathogens'],
        monitoring: ['Check base of plants', 'Monitor population weekly', 'Look for honeydew'],
        source: 'ICAR-IIRR / State Agricultural Departments',
        requiresExpertDiagnosis: false
      }
    },
    diseases: {
      'Blast': {
        identification: 'Diamond-shaped spots on leaves, neck rot, rotten necks in panicles.',
        prevention: ['Use resistant varieties', 'Avoid excessive nitrogen', 'Proper water management'],
        culturalControl: ['Avoid late planting', 'Remove infected plants', 'Balanced fertilization'],
        mechanicalControl: ['Remove infected plant parts', 'Maintain field sanitation'],
        biologicalControl: ['Use Trichoderma formulations', 'Apply Pseudomonas fluorescens'],
        monitoring: ['Check for leaf spots', 'Monitor neck symptoms', 'Track disease progression'],
        source: 'ICAR-IIRR / State Agricultural Departments',
        requiresExpertDiagnosis: true
      }
    }
  },
  'Tomato': {
    pests: {
      'Fruit Borer': {
        identification: 'Larvae bore into fruits, entry holes with frass, damaged fruits rot.',
        prevention: ['Use nylon netting', 'Remove infested fruits', 'Crop rotation'],
        culturalControl: ['Destroy crop residues', 'Remove infested fruits', 'Field sanitation'],
        mechanicalControl: ['Handpick larvae', 'Install pheromone traps', 'Use light traps'],
        biologicalControl: ['Release Trichogramma', 'Use Bt formulations', 'Conserve natural enemies'],
        monitoring: ['Check fruits for entry holes', 'Monitor larvae population', 'Track fruit damage'],
        source: 'ICAR-IIHR / State Agricultural Departments',
        requiresExpertDiagnosis: false
      }
    },
    diseases: {
      'Early Blight': {
        identification: 'Brown spots on older leaves with concentric rings, yellowing of leaves.',
        prevention: ['Use disease-free seeds', 'Avoid overhead irrigation', 'Proper spacing'],
        culturalControl: ['Remove infected leaves', 'Crop rotation', 'Avoid waterlogging'],
        mechanicalControl: ['Prune lower leaves', 'Improve air circulation'],
        biologicalControl: ['Use Trichoderma formulations', 'Apply biocontrol agents'],
        monitoring: ['Check lower leaves', 'Monitor spot development', 'Track disease spread'],
        source: 'ICAR-IIHR / State Agricultural Departments',
        requiresExpertDiagnosis: true
      },
      'Late Blight': {
        identification: 'Water-soaked lesions on leaves, white fungal growth, rapid plant death.',
        prevention: ['Use resistant varieties', 'Avoid overhead irrigation', 'Proper spacing'],
        culturalControl: ['Remove infected plants', 'Improve drainage', 'Avoid wet foliage'],
        mechanicalControl: ['Remove infected plant parts', 'Improve air circulation'],
        biologicalControl: ['Use copper-based fungicides', 'Apply biocontrol agents'],
        monitoring: ['Check for water-soaked spots', 'Monitor white fungal growth', 'Track spread'],
        source: 'ICAR-IIHR / State Agricultural Departments',
        requiresExpertDiagnosis: true
      }
    }
  }
};

export function getPesticideGuidance(params: PestParameters): PesticideResponse {
  // Validate inputs
  const validatedParams = validatePestParameters(params);
  
  // Check if crop is supported
  const cropData = IPM_DATABASE[validatedParams.crop];
  
  if (!cropData) {
    return {
      recommendation: generateGenericGuidance(validatedParams),
      error: `No specific IPM data available for ${validatedParams.crop}. Please consult your local agriculture department or Krishi Vigyan Kendra for crop-specific guidance.`,
      generatedAt: new Date()
    };
  }

  // Determine if it's a pest or disease
  if (validatedParams.pest) {
    const pestData = cropData.pests[validatedParams.pest];
    if (pestData) {
      return {
        recommendation: pestData,
        generatedAt: new Date()
      };
    }
  }

  if (validatedParams.disease) {
    const diseaseData = cropData.diseases[validatedParams.disease];
    if (diseaseData) {
      return {
        recommendation: diseaseData,
        generatedAt: new Date()
      };
    }
  }

  // If specific pest/disease not found but symptoms provided
  if (validatedParams.symptoms) {
    return {
      recommendation: generateSymptomBasedGuidance(validatedParams, cropData),
      generatedAt: new Date()
    };
  }

  // General guidance for the crop
  return {
    recommendation: generateCropSpecificGuidance(validatedParams, cropData),
    generatedAt: new Date()
  };
}

function validatePestParameters(params: PestParameters): PestParameters {
  return {
    crop: params.crop,
    pest: params.pest,
    disease: params.disease,
    symptoms: params.symptoms,
    growthStage: params.growthStage,
    location: params.location,
    severity: params.severity || 'Medium'
  };
}

function generateGenericGuidance(params: PestParameters): IPMRecommendation {
  return {
    identification: `Specific pest/disease identification for ${params.crop} requires expert diagnosis.`,
    prevention: [
      'Use resistant varieties when available',
      'Maintain field sanitation',
      'Follow proper crop rotation',
      'Avoid excessive nitrogen fertilization',
      'Maintain proper water management'
    ],
    culturalControl: [
      'Remove crop residues after harvest',
      'Deep ploughing before sowing',
      'Proper plant spacing',
      'Balanced fertilization'
    ],
    mechanicalControl: [
      'Handpick pests when feasible',
      'Use traps for monitoring',
      'Remove infected plant parts'
    ],
    biologicalControl: [
      'Conserve natural enemies',
      'Use biocontrol agents where available',
      'Avoid broad-spectrum pesticides'
    ],
    monitoring: [
      'Regular field scouting',
      'Monitor pest population',
      'Track disease symptoms',
      'Record observations'
    ],
    source: 'General IPM Principles',
    requiresExpertDiagnosis: true
  };
}

function generateSymptomBasedGuidance(params: PestParameters, _cropData: any): IPMRecommendation {
  const guidance = generateGenericGuidance(params);
  guidance.identification = `Based on symptoms: ${params.symptoms}. This may indicate several possible issues. Expert diagnosis recommended for accurate identification.`;
  return guidance;
}

function generateCropSpecificGuidance(params: PestParameters, _cropData: any): IPMRecommendation {
  const guidance = generateGenericGuidance(params);
  guidance.identification = `General IPM guidance for ${params.crop}. For specific pest or disease issues, please provide the pest name, disease name, or describe the symptoms.`;
  
  // Add crop-specific monitoring
  if (params.crop === 'Cotton') {
    guidance.monitoring.push('Monitor squares and bolls', 'Check for bollworm damage', 'Look for whitefly on leaf undersides');
  } else if (params.crop === 'Rice') {
    guidance.monitoring.push('Check for dead hearts', 'Monitor hopper burn symptoms', 'Look for blast spots on leaves');
  } else if (params.crop === 'Tomato') {
    guidance.monitoring.push('Check fruits for borer damage', 'Monitor for leaf spots', 'Look for fungal growth');
  }

  return guidance;
}

export function formatPesticideGuidance(response: PesticideResponse, language: string = 'en'): string {
  if (response.error) {
    return response.error;
  }

  const rec = response.recommendation;
  let result = `IPM Guidance Report
==================

Identification:
${rec.identification}

`;

  if (rec.requiresExpertDiagnosis) {
    result += `⚠️ IMPORTANT: Expert diagnosis recommended for accurate identification and treatment.
`;
  }

  result += `Prevention Measures:
`;
  rec.prevention.forEach((measure, index) => {
    result += `${index + 1}. ${measure}\n`;
  });

  result += `\nCultural Control:
`;
  rec.culturalControl.forEach((control, index) => {
    result += `${index + 1}. ${control}\n`;
  });

  result += `\nMechanical Control:
`;
  rec.mechanicalControl.forEach((control, index) => {
    result += `${index + 1}. ${control}\n`;
  });

  result += `\nBiological Control:
`;
  rec.biologicalControl.forEach((control, index) => {
    result += `${index + 1}. ${control}\n`;
  });

  if (rec.chemicalControl) {
    result += `\nChemical Control:
`;
    result += `Products: ${rec.chemicalControl.products.join(', ') || 'Consult local agriculture department'}
`;
    result += `Active Ingredients: ${rec.chemicalControl.activeIngredients.join(', ') || 'Consult product label'}
`;
    result += `Precautions:
`;
    rec.chemicalControl.precautions.forEach(prec => result += `- ${prec}\n`);
    result += `\n${rec.chemicalControl.disclaimer}\n`;
  }

  result += `\nMonitoring:
`;
  rec.monitoring.forEach((monitor, index) => {
    result += `${index + 1}. ${monitor}\n`;
  });

  result += `\nSource: ${rec.source}
Generated: ${response.generatedAt.toLocaleString(language)}

IMPORTANT: 
- Always follow product label instructions
- Consult local agriculture department for registered products
- Use pesticides only when necessary and at recommended doses
- Follow safety precautions during application
- Observe pre-harvest intervals
- For specific product recommendations and doses, contact your local agriculture officer or Krishi Vigyan Kendra`;

  return result;
}

export function getCropList(): string[] {
  return Object.keys(IPM_DATABASE);
}

export function getPestList(crop: string): string[] {
  const cropData = IPM_DATABASE[crop];
  return cropData ? Object.keys(cropData.pests) : [];
}

export function getDiseaseList(crop: string): string[] {
  const cropData = IPM_DATABASE[crop];
  return cropData ? Object.keys(cropData.diseases) : [];
}

export function getGrowthStages(crop: string): string[] {
  const stages: Record<string, string[]> = {
    'Cotton': ['Vegetative', 'Squaring', 'Flowering', 'Boll formation', 'Maturity'],
    'Rice': ['Seedling', 'Tillering', 'Panicle initiation', 'Flowering', 'Maturity'],
    'Tomato': ['Seedling', 'Vegetative', 'Flowering', 'Fruit set', 'Maturity'],
    'Wheat': ['Seedling', 'Tillering', 'Jointing', 'Booting', 'Maturity'],
    'Maize': ['Seedling', 'Vegetative', 'Tasseling', 'Silking', 'Maturity']
  };
  return stages[crop] || ['Early', 'Mid', 'Late'];
}
