import React, { InputHTMLAttributes, ReactNode, ButtonHTMLAttributes, useState } from 'react';
import { DocStatus, ImpactLevel } from '../../types';

/* ── Button ─────────────────────────────────────── */
type Variant = 'primary' | 'ghost' | 'white' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  fullWidth?: boolean;
  loading?:  boolean;
}

const btnBase: React.CSSProperties = {
  cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600,
  border: 'none', borderRadius: 10,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all .18s', whiteSpace: 'nowrap',
};
const btnVariant: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--amber)',   color: '#fff' },
  ghost:   { background: 'transparent',    color: 'var(--amber)', border: '2px solid var(--amber)' },
  white:   { background: '#fff',           color: 'var(--amber-d)' },
  danger:  { background: 'transparent',    color: 'var(--error)',  border: '2px solid var(--error)' },
};
const btnSize: Record<Size, React.CSSProperties> = {
  sm: { padding: '7px 16px',  fontSize: '.83rem' },
  md: { padding: '11px 24px', fontSize: '.95rem' },
  lg: { padding: '14px 32px', fontSize: '1rem'   },
};
const btnHover: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--amber-d)',  transform: 'translateY(-1px)' },
  ghost:   { background: 'var(--amber)',    color: '#fff' },
  white:   { background: 'var(--peach)' },
  danger:  { background: 'var(--error)',    color: '#fff' },
};

export const Button: React.FC<BtnProps> = ({
  variant='primary', size='md', fullWidth=false, loading=false, children, style, disabled, ...rest
}) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...btnBase, ...btnVariant[variant], ...btnSize[size],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(hov && !disabled && !loading ? btnHover[variant] : {}),
        ...(disabled || loading ? { opacity: .6, cursor: 'not-allowed' } : {}),
        ...style,
      }}
    >
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
};

/* ── Tag ─────────────────────────────────────────── */
export const Tag: React.FC<{ children: ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-block', fontSize: '.74rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--coral)', color: 'var(--amber-dd)', ...style }}>
    {children}
  </span>
);

/* ── Card ────────────────────────────────────────── */
export const Card: React.FC<{ children: ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={className} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(249,115,22,.05)', ...style }}>
    {children}
  </div>
);

/* ── FormField ───────────────────────────────────── */
export const FormField: React.FC<{ label: string; error?: string; hint?: string; children: ReactNode }> = ({ label, error, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--char-m)', display: 'block', marginBottom: 5 }}>{label}</label>
    {children}
    {error && <p style={{ fontSize: '.75rem', color: 'var(--error)', marginTop: 4 }}>{error}</p>}
    {hint  && <p style={{ fontSize: '.75rem', color: 'var(--char-l)', marginTop: 4 }}>{hint}</p>}
  </div>
);

/* ── TextInput ───────────────────────────────────── */
export const TextInput: React.FC<InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, style, ...rest }) => (
  <input style={{ ...(error ? { borderColor: 'var(--error)' } : {}), ...style }} {...rest} />
);

/* ── Toggle ──────────────────────────────────────── */
export const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? 'var(--amber)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: '.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '.2s' }} />
  </div>
);

/* ── StatusBadge ─────────────────────────────────── */
const statusCfg: Record<DocStatus, { bg: string; color: string; label: string }> = {
  'up-to-date':    { bg: 'rgba(22,163,74,.10)',  color: 'var(--success)',  label: 'Up to Date'    },
  'review-needed': { bg: 'rgba(249,115,22,.12)', color: 'var(--amber-d)', label: 'Review Needed' },
  'conflict':      { bg: 'rgba(220,38,38,.09)',  color: 'var(--error)',   label: 'Conflict'      },
};
export const StatusBadge: React.FC<{ status: DocStatus }> = ({ status }) => {
  const c = statusCfg[status];
  return <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>{c.label}</span>;
};

/* ── ImpactBadge ─────────────────────────────────── */
const impactCfg: Record<ImpactLevel, { bg: string; color: string; label: string }> = {
  high:   { bg: 'rgba(220,38,38,.10)',  color: 'var(--error)',   label: 'High Impact'   },
  medium: { bg: 'rgba(249,115,22,.12)', color: 'var(--amber-d)', label: 'Medium Impact' },
  low:    { bg: 'rgba(22,163,74,.10)',  color: 'var(--success)', label: 'Low Impact'    },
};
export const ImpactBadge: React.FC<{ level: ImpactLevel }> = ({ level }) => {
  const c = impactCfg[level];
  return <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 8, background: c.bg, color: c.color }}>{c.label}</span>;
};

/* ── DeptChip ────────────────────────────────────── */
export const DeptChip: React.FC<{ label: string }> = ({ label }) => (
  <span style={{ display: 'inline-block', fontSize: '.72rem', fontWeight: 600, background: 'var(--peach)', color: 'var(--amber-d)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px', margin: '2px 2px 0 0' }}>
    {label}
  </span>
);

/* ── Avatar ──────────────────────────────────────── */
export const Avatar: React.FC<{ initials: string; size?: number; onClick?: () => void }> = ({ initials, size = 36, onClick }) => (
  <div onClick={onClick} style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,var(--amber),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: size * .33, color: '#fff', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}>
    {initials}
  </div>
);

/* ── Spinner ─────────────────────────────────────── */
export const Spinner: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <div style={{ width: size, height: size, border: `${size * .14}px solid var(--border)`, borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
);

/* ── SectionHeader ───────────────────────────────── */
export const SectionHeader: React.FC<{ tag: string; title: string; subtitle?: string }> = ({ tag, title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: 56 }}>
    <Tag>{tag}</Tag>
    <h2 style={{ marginTop: 10, fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: 'var(--char)', marginBottom: 10 }}>{title}</h2>
    {subtitle && <p style={{ color: 'var(--char-l)', fontSize: 'clamp(.88rem,2vw,1.05rem)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>{subtitle}</p>}
  </div>
);

/* ── Divider ─────────────────────────────────────── */
export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    {label && <span style={{ fontSize: '.78rem', color: 'var(--char-l)', whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
);

/* ── EmptyState ──────────────────────────────────── */
export const EmptyState: React.FC<{ icon: string; title: string; message: string }> = ({ icon, title, message }) => (
  <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--char-l)' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--char-m)', marginBottom: 6 }}>{title}</h4>
    <p style={{ fontSize: '.87rem', lineHeight: 1.6 }}>{message}</p>
  </div>
);
