import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

const DEPT_NAV = [
  { label: 'My Documents',  icon: '📄', path: '/dept'                },
  { label: 'Upload',        icon: '📤', path: '/dept/upload'         },
  { label: 'Notifications', icon: '🔔', path: '/dept/notifications', badge: 2 },
  { label: 'Approvals',     icon: '✅', path: '/dept/approvals'      },
];

const DeptSidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { profile, company, department, signOut } = useAuth();

  const deptColors: Record<string, string> = { sales: '#F97316', marketing: '#8B5CF6', operations: '#0EA5E9' };
  const deptColor = deptColors[department?.slug || 'sales'] || 'var(--amber)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Dept badge */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ background: 'var(--peach)', borderRadius: 12, padding: '10px 14px', borderLeft: `3px solid ${deptColor}` }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, color: deptColor, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{department?.slug}</div>
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--char)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{department?.name || 'Department'}</div>
          <div style={{ fontSize: '.73rem', color: 'var(--char-l)', marginTop: 1 }}>{company?.name}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {DEPT_NAV.map(item => {
          const active = location.pathname === item.path;
          return (
            <div key={item.path} onClick={() => { navigate(item.path); onClose?.(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', fontSize: '.87rem', fontWeight: active ? 600 : 500, color: active ? deptColor : 'var(--char-m)', background: active ? 'var(--peach)' : 'transparent', transition: '.15s', marginBottom: 2 }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--peach)'; e.currentTarget.style.color=deptColor; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--char-m)'; } }}
            >
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: deptColor, color: '#fff', borderRadius: 10, fontSize: '.65rem', padding: '1px 7px', fontWeight: 700 }}>{item.badge}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Avatar initials={(department?.name || 'DM').slice(0,2).toUpperCase()} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--char)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || department?.name}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--char-l)', textTransform: 'capitalize' }}>{department?.slug} member</div>
          </div>
        </div>
        <div onClick={() => { signOut(); navigate('/'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: '.83rem', color: 'var(--error)', fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.background='rgba(220,38,38,.06)')}
          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
        >🚪 Sign Out</div>
      </div>
    </div>
  );
};

const DeptLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="hide-desktop" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: '4px' }}>☰</button>
          <div onClick={() => navigate('/')} style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--char)', cursor: 'pointer' }}>
            Trace<span style={{ color: 'var(--amber)' }}>Wise</span>
          </div>
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--char-l)' }} className="hide-mobile">Department Portal</div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <aside className="hide-mobile" style={{ width: 'var(--sidebar-w)', flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border)', height: '100%' }}>
          <DeptSidebarContent />
        </aside>

        {mobileOpen && (
          <div className="hide-desktop" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: '#fff', boxShadow: '4px 0 20px rgba(0,0,0,.15)', animation: 'fadeIn .2s ease' }}>
              <DeptSidebarContent onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,32px)', background: 'var(--peach)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DeptLayout;
