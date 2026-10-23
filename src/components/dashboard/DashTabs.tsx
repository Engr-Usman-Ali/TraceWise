import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface TabDef {
  label:  string;
  icon:   string;
  path:   string;
  badge?: number;
}

const TABS: TabDef[] = [
  { label: 'Overview',    icon: '📊', path: '/dashboard'             },
  { label: 'Documents',   icon: '📄', path: '/dashboard/documents'   },
  { label: 'Review Tasks', icon: '📋', path: '/dashboard/review-tasks' },
  { label: 'Departments', icon: '🏢', path: '/dashboard/departments' },
  { label: 'Profile',     icon: '👤', path: '/dashboard/profile'     },
];

const DashTabs: React.FC<{ notifCount?: number }> = ({ notifCount = 0 }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div style={{
      display: 'flex', gap: 4,
      borderBottom: '1px solid var(--border)',
      background: '#fff',
      padding: '0 clamp(16px,3vw,32px)',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {TABS.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '14px 18px',
              border: 'none', borderBottom: `2.5px solid ${active ? 'var(--amber)' : 'transparent'}`,
              background: 'none', cursor: 'pointer',
              fontSize: '.87rem', fontWeight: active ? 700 : 500,
              color: active ? 'var(--amber-d)' : 'var(--char-l)',
              whiteSpace: 'nowrap', transition: 'color .15s, border-color .15s',
              fontFamily: "'Inter',sans-serif",
              marginBottom: -1,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--char)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--char-l)'; }}
          >
            <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
            {tab.label}
            {tab.label === 'Overview' && notifCount > 0 && (
              <span style={{
                background: 'var(--amber)', color: '#fff',
                fontSize: '.65rem', fontWeight: 700,
                padding: '1px 6px', borderRadius: 10,
              }}>
                {notifCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DashTabs;
