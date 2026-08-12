import { LanguageOption } from '../config/languages';

export default function LanguageCard({
  language,
  selected,
  onSelect,
}: {
  language: LanguageOption;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(language.code)}
      className={`lang-item ${selected ? 'lang-item-selected' : ''}`}
      aria-pressed={selected}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{language.nativeLabel}</div>
          <div style={{ fontSize: '0.9rem', color: '#475569' }}>{language.label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: selected ? '#166534' : '#e5e7eb', color: selected ? '#ffffff' : '#475569' }}>
          {selected ? '✓' : '🌾'}
        </div>
      </div>
    </button>
  );
}
