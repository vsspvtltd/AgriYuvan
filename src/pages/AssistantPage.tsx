import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Volume2, Square } from 'lucide-react';
import { generateAssistantResponse, speakText } from '../services/voice';
import Logo from '../components/Logo';

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const handleStopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    setLoading(true);
    setError('');
    setVoiceError('');
    setAudioUrl(null);

    try {
      const generatedResponse = await generateAssistantResponse(question, i18n.language);
      setResponse(generatedResponse);

      try {
        const result = await speakText(generatedResponse, i18n.language);
        setAudioUrl(result.audioUrl);
      } catch (voiceFailure) {
        const message = voiceFailure instanceof Error ? voiceFailure.message : 'The answer was generated, but voice playback could not be started.';
        setVoiceError(message);
        console.error('Assistant voice playback failed:', voiceFailure);
      }
    } catch (assistantFailure) {
      const message = assistantFailure instanceof Error ? assistantFailure.message : 'Unable to get an assistant response right now. Please try again.';
      setError(message);
      console.error('Assistant response generation failed:', assistantFailure);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUrl || !audioRef.current) return;

    try {
      await audioRef.current.play();
    } catch (playError) {
      console.error('Audio playback failed:', playError);
      setVoiceError('The answer was generated, but voice playback could not be started.');
    }
  };

  return (
    <div className="container page">
      <section className="hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1>{t('assistant.title')}</h1>
            <p style={{ margin: '0.75rem 0 0', color: '#475569' }}>{t('assistant.subtitle')}</p>
          </div>
          <Logo compact />
        </div>
      </section>

      <section className="card assistant-card">
        <div className="assistant-controls">
          <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('assistant.promptLabel')}</div>
              <textarea
                className="input"
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('assistant.placeholder')}
              />
            </label>
            {error ? <div className="assistant-message assistant-message--error">{error}</div> : null}
            {voiceError ? <div className="assistant-message assistant-message--warning">{voiceError}</div> : null}
            <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
              <Send size={16} style={{ marginRight: '0.4rem' }} />
              {loading ? t('common.loading') : t('assistant.send')}
            </button>
          </form>
        </div>

        <div className="assistant-response">
          {response ? (
            <>
              <div className="status-pill">{t('assistant.response')}</div>
              <p style={{ marginTop: '0.75rem', color: '#0f172a', lineHeight: 1.7 }}>{response}</p>
              {audioUrl ? (
                <div className="assistant-audio-controls">
                  <button type="button" className="btn btn-secondary" onClick={handlePlayAudio}>
                    <Volume2 size={16} style={{ marginRight: '0.4rem' }} />
                    Listen to response
                  </button>
                  <button type="button" className="btn btn-ghost assistant-stop-btn" onClick={handleStopVoice}>
                    <Square size={14} style={{ marginRight: '0.4rem' }} />
                    Stop voice
                  </button>
                  <audio ref={audioRef} controls src={audioUrl} style={{ width: '100%' }} />
                </div>
              ) : null}
            </>
          ) : (
            <div style={{ color: '#64748b' }}>{t('assistant.sample')}</div>
          )}
        </div>
      </section>
    </div>
  );
}
