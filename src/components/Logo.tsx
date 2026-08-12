import { Sprout } from 'lucide-react';

export default function Logo({ compact }: { compact?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.5rem' : '0.75rem' }}>
      <div
        aria-hidden="true"
        style={{
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          borderRadius: 12,
          background: '#ecf7ee',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid #d1e7d6',
        }}
      >
        <Sprout size={compact ? 20 : 24} color="#166534" />
      </div>
      <div>
        <div style={{ fontSize: compact ? '1rem' : '1.2rem', fontWeight: 700, letterSpacing: 0.5, color: '#0f172a' }}>
          AgriYUVAN
        </div>
        {!compact ? (
          <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>Your Complete Farming Companion</div>
        ) : null}
      </div>
    </div>
  );
}
