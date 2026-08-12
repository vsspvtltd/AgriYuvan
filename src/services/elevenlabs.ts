import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function generateVoiceReply(message: string) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('Voice service is not configured. Please add VITE_ELEVENLABS_API_KEY to the local environment.');
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const voiceId = '21m00Tcm4TlvDq8ikWAM';
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: message,
      modelId: 'eleven_monolingual_v1',
      voiceSettings: {
        stability: 0.4,
        similarityBoost: 0.9,
      },
    });

    const audioBlob = await new Response(audioStream as ReadableStream<Uint8Array>).blob();

    return {
      text: message,
      audioUrl: URL.createObjectURL(audioBlob),
    };
  } catch (error) {
    console.error('ElevenLabs voice generation failed:', error);
    throw new Error('The answer was generated, but voice playback could not be started.');
  }
}
