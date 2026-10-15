import React, { ReactNode } from 'react';

/* ── DashHeader ──────────────────────────────────────────────── */
export const DashHeader: React.FC<{
  title: string;
  subtitle: string;
  action?: ReactNode;
}> = ({ title, subtitle, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28,
    flexWrap: 'wrap', gap: 12,
  }}>
    <div>
      <h2 style={{ fontSize: 'clamp(1.25rem,3vw,1.65rem)', fontWeight: 800, color: 'var(--char)' }}>
        {title}
      </h2>
      <div style={{ fontSize: '.84rem', color: 'var(--char-l)', marginTop: 3 }}>{subtitle}</div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ── PanelCard ───────────────────────────────────────────────── */
export const PanelCard: React.FC<{ children: ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 16,
    border: '1px solid var(--border)',
    boxShadow: '0 2px 8px rgba(249,115,22,.04)',
    padding: 'clamp(16px,3vw,22px)',
    ...style,
  }}>
    {children}
  </div>
);

/* ── PanelHead ───────────────────────────────────────────────── */
export const PanelHead: React.FC<{ title: string; action?: ReactNode }> = ({ title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
    <h3 style={{ fontSize: '.97rem', fontWeight: 700, color: 'var(--char)' }}>{title}</h3>
    {action}
  </div>
);

/* ── KPICard ─────────────────────────────────────────────────── */
export const KPICard: React.FC<{
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon?: string;
  accent?: string;
}> = ({ label, value, delta, deltaUp, icon, accent = 'var(--amber)' }) => (
  <div style={{
    background: '#fff', borderRadius: 14,
    padding: '18px 20px', border: '1px solid var(--border)',
    borderTop: `3px solid ${accent}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '.77rem', color: 'var(--char-l)', fontWeight: 500 }}>{label}</div>
      {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
    </div>
    <div style={{
      fontFamily: "'Sora',sans-serif", fontWeight: 800,
      fontSize: '1.8rem', color: 'var(--char)', margin: '6px 0 4px',
    }}>
      {value}
    </div>
    {delta && (
      <div style={{
        fontSize: '.72rem', fontWeight: 600,
        color: deltaUp ? 'var(--success)' : 'var(--error)',
      }}>
        {delta}
      </div>
    )}
  </div>
);

/* ── DocRow ──────────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'up-to-date':    { bg: 'rgba(22,163,74,.10)',  color: 'var(--success)',  label: 'Up to Date'    },
  'review-needed': { bg: 'rgba(249,115,22,.12)', color: 'var(--amber-d)', label: 'Review Needed' },
  'conflict':      { bg: 'rgba(220,38,38,.09)',  color: 'var(--error)',   label: 'Conflict'      },
};

export const DocRow: React.FC<{
  name: string;
  meta: string;
  status: string;
  onClick?: () => void;
}> = ({ name, meta, status, onClick }) => {
  const [hov, setHov] = React.useState(false);
  const s = STATUS_STYLE[status] || STATUS_STYLE['up-to-date'];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12,
        background: hov ? 'var(--coral)' : 'var(--peach)',
        cursor: onClick ? 'pointer' : 'default', transition: '.15s',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg,var(--amber),var(--gold))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.85rem', color: '#fff',
      }}>
        📄
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '.86rem', fontWeight: 600, color: 'var(--char)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--char-l)', marginTop: 1 }}>{meta}</div>
      </div>
      <span style={{
        fontSize: '.7rem', fontWeight: 700, padding: '2px 9px',
        borderRadius: 9, background: s.bg, color: s.color, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {s.label}
      </span>
    </div>
  );
};

/* ── EmptySlate ──────────────────────────────────────────────── */
export const EmptySlate: React.FC<{ icon: string; title: string; message: string; action?: ReactNode }> = ({ icon, title, message, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--char-m)', marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: '.86rem', color: 'var(--char-l)', lineHeight: 1.6, marginBottom: action ? 20 : 0, maxWidth: 320, margin: '0 auto' }}>
      {message}
    </div>
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

/* ── SectionGrid ─────────────────────────────────────────────── */
export const SectionGrid: React.FC<{ cols?: string; gap?: number; children: ReactNode }> = ({
  cols = 'repeat(auto-fit,minmax(280px,1fr))', gap = 18, children,
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, gap, marginBottom: 20 }}>
    {children}
  </div>
);

/* ── StatusDot ───────────────────────────────────────────────── */
export const StatusDot: React.FC<{ color: 'orange' | 'green' | 'red' }> = ({ color }) => (
  <div style={{
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
    background: color === 'orange' ? 'var(--amber)' : color === 'green' ? 'var(--success)' : 'var(--error)',
  }} />
);
