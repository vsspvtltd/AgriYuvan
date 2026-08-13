import { GoogleGenAI } from '@google/genai';
import { supportedLanguages } from '../config/languages';
import { generateVoiceReply } from './elevenlabs';

export interface VoiceResponse {
  text: string;
  audioUrl: string | null;
}

export interface AssistantResponse {
  text: string;
  sources?: string[];
}

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const AGRICULTURAL_SYSTEM_INSTRUCTION = `You are AgriYUVAN, an agriculture assistance system designed to help farmers.

Your job is to provide practical, simple, evidence-based agricultural guidance.

Never guess agricultural facts.

For information that may change over time, use Google Search grounding and verify the information.

Prioritize reliable sources in this order whenever applicable:

1. Indian central government agricultural departments
2. ICAR and ICAR institutes
3. State agriculture departments
4. Agricultural universities
5. IMD for weather information
6. Official government agricultural schemes and portals
7. Government extension/advisory services
8. Reputable agricultural research and extension organizations

Do not rely on random blogs when official information is available.

Never invent:

- crop prices
- mandi prices
- weather
- rainfall
- government schemes
- subsidy amounts
- fertilizer doses
- pesticide doses
- fungicide doses
- herbicide doses
- disease diagnoses
- crop yields
- seed varieties
- scientific claims
- government regulations
- agricultural advisories

If information cannot be verified, clearly say that it could not be verified.

For chemical, pesticide, fungicide, herbicide, fertilizer, or crop-protection questions:

- Never invent a dosage.
- Never invent an application schedule.
- Prefer official label recommendations and agricultural-extension guidance.
- If the answer depends on the specific product, crop, formulation, concentration, or pest, ask for those details.
- Recommend consulting a local agriculture officer/agricultural expert when field-specific diagnosis is required.

For disease questions:

Ask for:

- crop
- variety if known
- crop growth stage
- affected plant part
- symptoms
- duration
- location
- weather conditions if relevant
- photo when necessary

Do not claim a disease is confirmed without sufficient evidence.

Use language such as:
"This may be..."
or
"These symptoms can be associated with..."
when diagnosis is uncertain.

For crop recommendations:

Do not immediately recommend a crop.

Consider:

- district/state
- soil type
- soil pH if available
- irrigation availability
- rainfall
- current season
- temperature
- crop duration
- previous crop
- land size
- farmer objective
- local market conditions when verified

If critical information is missing, ask the farmer for it.

For weather:

Never guess weather.

Use real weather data when an appropriate weather service is available.

For location-specific questions:

Use the user's existing location information if the application already provides it.

Do not create a second location system unnecessarily.

For current information:

Examples include:

- today's market price
- tomorrow's weather
- current rainfall
- current government scheme
- latest agricultural advisory
- current subsidy
- current mandi price
- current crop recommendation
- current regulations

These must not be answered from static model knowledge.

Use real current data/grounding when available.

If current data cannot be verified, explicitly say:

'I couldn't verify the latest information for your location.'

Always answer in simple, farmer-friendly language.

Avoid unnecessary technical terminology.

Give practical steps.

If important information is missing, ask a short follow-up question rather than guessing.

Format your response as:

Answer:
[Simple direct answer]

Practical steps:
1. ...
2. ...
3. ...

Important:
[Important warning or condition if applicable]

Sources:
- [actual source if grounding was used]`;

function categorizeQuestion(question: string): {
  category: string;
  requiresGrounding: boolean;
  requiresLocation: boolean;
  missingInfo?: string[];
} {
  const lowerQ = question.toLowerCase();
  
  // Current information questions
  if (lowerQ.includes('today') || lowerQ.includes('current') || lowerQ.includes('latest') || 
      lowerQ.includes('price') || lowerQ.includes('market') || lowerQ.includes('mandi') ||
      lowerQ.includes('scheme') || lowerQ.includes('subsidy') || lowerQ.includes('advisory')) {
    return { category: 'current_info', requiresGrounding: true, requiresLocation: true };
  }
  
  // Weather questions
  if (lowerQ.includes('weather') || lowerQ.includes('rain') || lowerQ.includes('temperature') ||
      lowerQ.includes('forecast') || lowerQ.includes('tomorrow') || lowerQ.includes('humidity')) {
    return { category: 'weather', requiresGrounding: true, requiresLocation: true };
  }
  
  // Disease/pest questions
  if (lowerQ.includes('disease') || lowerQ.includes('pest') || lowerQ.includes('insect') ||
      lowerQ.includes('fungus') || lowerQ.includes('spot') || lowerQ.includes('yellow') ||
      lowerQ.includes('wilt') || lowerQ.includes('damage')) {
    const missingInfo: string[] = [];
    if (!lowerQ.includes('crop')) missingInfo.push('crop');
    if (!lowerQ.includes('symptom')) missingInfo.push('symptoms');
    return { 
      category: 'disease_pest', 
      requiresGrounding: false, 
      requiresLocation: false,
      missingInfo: missingInfo.length > 0 ? missingInfo : undefined
    };
  }
  
  // Fertilizer/chemical questions
  if (lowerQ.includes('fertilizer') || lowerQ.includes('urea') || lowerQ.includes('dap') ||
      lowerQ.includes('pesticide') || lowerQ.includes('herbicide') || lowerQ.includes('fungicide') ||
      lowerQ.includes('chemical') || lowerQ.includes('dose') || lowerQ.includes('application')) {
    const missingInfo: string[] = [];
    if (!lowerQ.includes('crop')) missingInfo.push('crop');
    if (!lowerQ.includes('soil')) missingInfo.push('soil information');
    return { 
      category: 'fertilizer_chemical', 
      requiresGrounding: false, 
      requiresLocation: false,
      missingInfo: missingInfo.length > 0 ? missingInfo : undefined
    };
  }
  
  // Crop recommendation questions
  if (lowerQ.includes('which crop') || lowerQ.includes('what crop') || lowerQ.includes('recommend') ||
      lowerQ.includes('suitable') || lowerQ.includes('grow')) {
    const missingInfo: string[] = [];
    if (!lowerQ.includes('soil')) missingInfo.push('soil type');
    if (!lowerQ.includes('district') && !lowerQ.includes('state') && !lowerQ.includes('location')) missingInfo.push('district/state');
    if (!lowerQ.includes('irrigat')) missingInfo.push('irrigation availability');
    return { 
      category: 'crop_recommendation', 
      requiresGrounding: true, 
      requiresLocation: true,
      missingInfo: missingInfo.length > 0 ? missingInfo : undefined
    };
  }
  
  // Sowing questions
  if (lowerQ.includes('sowing') || lowerQ.includes('before sowing') || lowerQ.includes('seed')) {
    const missingInfo: string[] = [];
    if (!lowerQ.includes('crop')) missingInfo.push('crop');
    if (!lowerQ.includes('soil')) missingInfo.push('soil type');
    return { 
      category: 'sowing', 
      requiresGrounding: false, 
      requiresLocation: false,
      missingInfo: missingInfo.length > 0 ? missingInfo : undefined
    };
  }
  
  // General agricultural knowledge
  return { category: 'general', requiresGrounding: false, requiresLocation: false };
}

async function generateGeminiResponseWithGrounding(
  question: string, 
  language: string,
  useGrounding: boolean
): Promise<{ text: string; sources?: string[] }> {
  if (!geminiClient) {
    throw new Error('Gemini client not configured');
  }

  try {
    const config: any = {
      model: 'gemini-2.5-flash',
      contents: `${AGRICULTURAL_SYSTEM_INSTRUCTION}\n\nUser question: ${question}\n\nAnswer in ${language}.`,
    };

    if (useGrounding) {
      config.config = {
        tools: [
          {
            googleSearch: {}
          }
        ]
      };
    }

    const response = await geminiClient.models.generateContent(config);
    const text = response.text?.trim();
    
    if (!text) {
      throw new Error('No response text from Gemini');
    }

    // Extract sources if grounding was used
    let sources: string[] | undefined;
    if (useGrounding && response.candidates?.[0]?.groundingMetadata) {
      const groundingMetadata = response.candidates[0].groundingMetadata as any;
      if (groundingMetadata.searchEntries && groundingMetadata.searchEntries.length > 0) {
        sources = groundingMetadata.searchEntries
          .slice(0, 5)
          .map((entry: any) => entry.title || entry.uri)
          .filter(Boolean);
      } else if (groundingMetadata.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
        // Alternative structure for some API versions
        sources = groundingMetadata.groundingChunks
          .slice(0, 5)
          .map((chunk: any) => chunk.source || chunk.uri)
          .filter(Boolean);
      }
    }

    return { text, sources };
  } catch (error) {
    console.error('Gemini response failed:', error);
    throw error;
  }
}

export async function generateAssistantResponse(question: string, language: string = 'en'): Promise<string> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw new Error('Please tell me which crop, field condition, or farm issue you want help with.');
  }

  // Categorize the question
  const categorization = categorizeQuestion(trimmedQuestion);
  
  // If critical information is missing, ask for it
  if (categorization.missingInfo && categorization.missingInfo.length > 0) {
    const missingInfoText = categorization.missingInfo.join(', ');
    return `To give you a useful answer, I need to know: ${missingInfoText}. Please provide these details.`;
  }

  if (!geminiClient) {
    // Conservative fallback when Gemini is not available
    return generateConservativeFallback(trimmedQuestion, categorization.category, language);
  }

  try {
    const { text, sources } = await generateGeminiResponseWithGrounding(
      trimmedQuestion,
      language,
      categorization.requiresGrounding
    );

    // Append sources if available
    if (sources && sources.length > 0) {
      const sourcesText = sources.map(s => `- ${s}`).join('\n');
      return `${text}\n\nSources:\n${sourcesText}`;
    }

    return text;
  } catch (error) {
    console.error('Gemini agricultural response failed, using conservative fallback:', error);
    return generateConservativeFallback(trimmedQuestion, categorization.category, language);
  }
}

function generateConservativeFallback(_question: string, category: string, language: string): string {
  // For current information questions, never guess
  if (category === 'current_info' || category === 'weather') {
    return 'I couldn\'t verify the latest information for your location. Please check with your local agriculture department, IMD weather service, or official government portals for current data.';
  }

  // For chemical/disease questions, be conservative
  if (category === 'fertilizer_chemical' || category === 'disease_pest') {
    return 'For accurate guidance on chemicals, pesticides, or disease diagnosis, please consult a local agriculture officer or agricultural expert. They can provide field-specific recommendations based on actual conditions.';
  }

  // For location-specific questions
  if (category === 'crop_recommendation') {
    return 'For crop recommendations, please provide your district/state, soil type, and irrigation availability. Your local agriculture department or Krishi Vigyan Kendra can provide location-specific guidance.';
  }

  // General conservative fallback
  if (language === 'hi' || language.startsWith('hi')) {
    return 'मैं वर्तमान में सटीक जानकारी सत्यापित नहीं कर सकता। कृपया अपने स्थानीय कृषि विभाग या कृषि विशेषज्ञ से संपर्क करें।';
  }

  if (language === 'te' || language.startsWith('te')) {
    return 'నేను ప్రస్తుతం ఖచ్చితమైన సమాచారాన్ని ధృవీకరించలేను. దయచేసి మీ స్థానిక వ్యవసాయ శాఖ లేదా వ్యవసాయ నిపుణులను సంప్రదించండి.';
  }

  return 'I couldn\'t verify the latest information. Please consult your local agriculture department or agricultural expert for accurate guidance.';
}

export async function speakText(text: string, _language: string): Promise<VoiceResponse> {
  const voiceResult = await generateVoiceReply(text);
  return {
    text: voiceResult.text,
    audioUrl: voiceResult.audioUrl,
  };
}

export function getSupportedVoiceLanguages() {
  return supportedLanguages.map((language) => language.code);
}
