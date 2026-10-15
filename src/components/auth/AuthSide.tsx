import React, { ReactNode } from 'react';

interface AuthSideProps {
  title: string;
  subtitle: string;
  extras?: ReactNode;
  testimonial?: { quote: string; author: string };
}

const AuthSide: React.FC<AuthSideProps> = ({ title, subtitle, extras, testimonial }) => (
  <div style={{ flex: 1, background: 'linear-gradient(160deg,var(--amber-dd),var(--amber) 50%,var(--gold))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(32px,5vw,56px)', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
    <div style={{ position: 'absolute', top: -60, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.25rem', marginBottom: 40, opacity: .9 }}>TraceWise</div>
      <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: '.95rem', opacity: .85, lineHeight: 1.65, maxWidth: 360 }}>{subtitle}</p>
      {extras && <div style={{ marginTop: 32 }}>{extras}</div>}
      {testimonial && (
        <div style={{ marginTop: 40, background: 'rgba(255,255,255,.12)', borderRadius: 14, padding: '18px 22px' }}>
          <p style={{ fontSize: '.87rem', opacity: .95, fontStyle: 'italic', marginBottom: 8 }}>"{testimonial.quote}"</p>
          <strong style={{ fontSize: '.78rem', opacity: .7 }}>— {testimonial.author}</strong>
        </div>
      )}
    </div>
  </div>
);

export default AuthSide;
