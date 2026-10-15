import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingNav: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const links = [
    { label: 'Features',     id: 'features'    },
    { label: 'How It Works', id: 'how-it-works' },
    { label: "Who It's For", id: 'use-cases'   },
    { label: 'Pricing',      id: 'pricing'     },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px,5vw,48px)',
        height: 68,
        background:
          'linear-gradient(150deg, #1a1208 0%, #2d1f0a 35%, #7c2d00 75%, #c2410c 100%)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          fontFamily: "'Sora',sans-serif",
          fontWeight: 800,
          fontSize: '1.2rem',
          color: '#fff',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '-.4px',
        }}
      >
        Trace<span style={{ color: 'var(--gold)' }}>Wise</span>
      </div>

      {/* Desktop links */}
      <div className="hide-mobile" style={{ display: 'flex', gap: 28 }}>
        {links.map(l => (
          <span
            key={l.id}
            onClick={() => scroll(l.id)}
            style={{
              fontSize: '.88rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,.75)',
              cursor: 'pointer',
              transition: 'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fcd34d')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.75)')}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* Desktop auth buttons */}
      <div className="hide-mobile" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.28)',
            color: '#fff',
            fontSize: '.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter',sans-serif",
            transition: 'background .15s, border-color .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,.10)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.28)';
          }}
        >
          Sign In
        </button>

        <button
          onClick={() => navigate('/signup')}
          style={{
            padding: '9px 20px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--amber), var(--gold))',
            border: 'none',
            color: '#fff',
            fontSize: '.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Inter',sans-serif",
            boxShadow: '0 4px 14px rgba(249,115,22,.35)',
            transition: 'transform .12s, box-shadow .15s, filter .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.filter = 'brightness(1.08)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(249,115,22,.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Get Started
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="hide-desktop"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="hide-desktop"
          style={{
            position: 'fixed',
            top: 68,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, #2d1f0a 0%, #1a1208 100%)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 99,
            boxShadow: '0 12px 32px rgba(0,0,0,.35)',
          }}
        >
          {links.map(l => (
            <span
              key={l.id}
              onClick={() => scroll(l.id)}
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,.85)',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              {l.label}
            </span>
          ))}

          <div
            style={{
              display: 'flex',
              gap: 10,
              paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <button
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,.28)',
                color: '#fff',
                fontSize: '.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Sign In
            </button>

            <button
              onClick={() => { navigate('/signup'); setMenuOpen(false); }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--amber), var(--gold))',
                border: 'none',
                color: '#fff',
                fontSize: '.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
                boxShadow: '0 4px 14px rgba(249,115,22,.35)',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;