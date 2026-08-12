import { GoogleGenAI } from '@google/genai';
import { supportedLanguages } from '../config/languages';
import { generateVoiceReply } from './elevenlabs';

export interface VoiceResponse {
  text: string;
  audioUrl: string | null;
}

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export function generateAgriculturalResponse(question: string, language: string = 'en'): string {
  const normalizedQuestion = question.trim();
  const lowerQuestion = normalizedQuestion.toLowerCase();

  if (!normalizedQuestion) {
    return 'Please tell me which crop, field condition, or farm issue you want help with.';
  }

  if (lowerQuestion.includes('before sowing') || lowerQuestion.includes('sowing') || lowerQuestion.includes('what should i do before')) {
    return 'Before sowing, check the soil moisture, prepare the field properly, and choose a crop that matches your soil type and season. Use good-quality seed, level the field well, and avoid sowing in waterlogged or compacted soil.';
  }

  if (lowerQuestion.includes('crop') && (lowerQuestion.includes('grow') || lowerQuestion.includes('plant') || lowerQuestion.includes('which crop'))) {
    return 'Choose a crop based on soil type, rainfall pattern, season, and market demand. Start by checking soil fertility and moisture, then select a crop that matches your local conditions and your farmer risk profile.';
  }

  if (lowerQuestion.includes('soil') && (lowerQuestion.includes('analysis') || lowerQuestion.includes('test') || lowerQuestion.includes('condition'))) {
    return 'Soil analysis helps you understand nutrient levels, pH, and moisture before making crop and fertilizer decisions. It is useful for selecting suitable crops, planning fertilizer use, and preparing the field before sowing.';
  }

  if (lowerQuestion.includes('fertilizer') || lowerQuestion.includes('nutrient') || lowerQuestion.includes('urea') || lowerQuestion.includes('dap')) {
    return 'Use fertilizer based on a soil test or field condition, not guesswork. Apply nutrients according to the crop stage, soil needs, and expected yield. Avoid over-application, because it may increase cost and harm soil health.';
  }

  if (lowerQuestion.includes('pest') || lowerQuestion.includes('disease') || lowerQuestion.includes('yellow') || lowerQuestion.includes('leaf')) {
    return 'First inspect the affected leaves, stems, and roots. Check whether the issue is due to water stress, nutrient deficiency, or pest pressure. Remove weak or infected plants, improve field hygiene, and use integrated pest management before deciding on chemical control.';
  }

  if (lowerQuestion.includes('irrigate') || lowerQuestion.includes('water') || lowerQuestion.includes('rain')) {
    return 'Irrigate according to soil moisture and crop stage, not just by habit. Avoid watering during heavy midday heat, and plan irrigation around the forecast so the field does not stay waterlogged or dry for long periods.';
  }

  if (lowerQuestion.includes('seed') || lowerQuestion.includes('germination')) {
    return 'Use clean, healthy, and certified seed for better germination. Store seed properly, check the seed rate, and choose seed suitable for your soil and season before sowing.';
  }

  if (lowerQuestion.includes('improve soil') || lowerQuestion.includes('soil health')) {
    return 'To improve soil health, add organic matter, avoid excessive tillage, and apply fertilizers only where the soil test supports it. Good drainage and moisture management also help maintain healthy soil.';
  }

  if (language === 'hi' || language.startsWith('hi')) {
    return 'कृपया अपने फसल, मिट्टी, मौसम और बीज की स्थिति के आधार पर सही निर्णय लें। अगर आप खेत की स्थिति, मिट्टी की नमी और फसल के चरण को समझें, तो बेहतर परिणाम मिलेंगे।';
  }

  if (language === 'te' || language.startsWith('te')) {
    return 'మీ పంట, నేల పరిస్థితి, వర్షం మరియు బీజాల పరిస్థితిని చూసి నిర్ణయం తీసుకోండి. నేల తేమ, సారాన్ని మరియు పంటా దశను గమనించడం వల్ల మంచి ఫలితం వస్తుంది.';
  }

  return 'Please tell me which crop you are growing, your soil type, and the season. That information will help me give a more useful farm recommendation.';
}

export async function generateAssistantResponse(question: string, language: string = 'en'): Promise<string> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw new Error('Please tell me which crop, field condition, or farm issue you want help with.');
  }

  if (!geminiClient) {
    return generateAgriculturalResponse(trimmedQuestion, language);
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are AgriYuvan, an expert agricultural assistant for Indian farmers. Answer in ${language} with practical, field-safe recommendations for crop planning, soil health, irrigation, pest management, seed selection, and market decisions. Keep the response concise, actionable, and specific to real farm conditions. User question: ${trimmedQuestion}`,
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }
  } catch (error) {
    console.error('Gemini agricultural response failed, using fallback response:', error);
  }

  return generateAgriculturalResponse(trimmedQuestion, language);
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
