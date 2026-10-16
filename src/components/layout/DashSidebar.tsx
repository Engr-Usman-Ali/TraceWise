import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface NavDef {
  label: string;
  icon: string;
  path: string;
}

const NAV: NavDef[] = [
  { label: 'Overview', icon: '📊', path: '/dashboard' },
  { label: 'Documents', icon: '📄', path: '/dashboard/documents' },
  { label: 'Departments', icon: '🏢', path: '/dashboard/departments' },
  { label: 'Impact Reports', icon: '📈', path: '/dashboard/impact-reports' },
  { label: 'Profile', icon: '👤', path: '/dashboard/profile' },
];

interface DashSidebarProps {
  notifCount?: number;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const DashSidebar: React.FC<DashSidebarProps> = ({
  notifCount = 0,
  mobileOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, company, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .filter(Boolean)
        .map((word: string) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'OW';

  const go = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <style>{`
        .dash-sidebar {
          width: 248px;
          flex-shrink: 0;
          background: linear-gradient(
            150deg,
            #1a1208 0%,
            #2d1f0a 35%,
            #7c2d00 75%,
            #c2410c 100%
          );
          border-right: 1px solid rgba(255,255,255,.08);
          height: 100vh;
          height: 100dvh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 200;
          overflow: hidden;
        }

        .dash-sidebar::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(251,191,36,.15);
          filter: blur(50px);
          pointer-events: none;
        }

        .dash-sidebar::after {
          content: '';
          position: absolute;
          bottom: -60px;
          left: 20px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(234,88,12,.20);
          filter: blur(45px);
          pointer-events: none;
        }

        .dash-sidebar > * {
          position: relative;
          z-index: 1;
        }

        .dash-backdrop {
          display: none;
        }

        .dash-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 11px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: .88rem;
          font-weight: 500;
          color: rgba(255,255,255,.65);
          text-align: left;
          transition: background .15s, color .15s, border-color .15s;
          position: relative;
        }

        .dash-nav-item:hover {
          background: rgba(255,255,255,.07);
          color: #fff;
        }

        .dash-nav-item.active {
          background: rgba(255,255,255,.09);
          border-color: rgba(251,191,36,.28);
          color: #fcd34d;
          font-weight: 700;
          box-shadow: inset 0 0 0 1px rgba(251,191,36,.10);
        }

        .dash-nav-item.active::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 0 3px 3px 0;
          background: var(--amber, #f59e0b);
        }

        .dash-nav-item:focus-visible {
          outline: 2px solid #fcd34d;
          outline-offset: 2px;
        }

        @media (max-width: 900px) {
          .dash-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            height: 100vh;
            height: 100dvh;
            transform: translateX(-100%);
            transition: transform .25s ease;
            box-shadow: 0 0 40px rgba(0,0,0,.35);
          }

          .dash-sidebar.open {
            transform: translateX(0);
          }

          .dash-backdrop.show {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.55);
            z-index: 190;
            animation: fadeIn .2s ease;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dash-sidebar,
          .dash-nav-item {
            transition: none;
          }
        }
      `}</style>

      <div
        className={`dash-backdrop${mobileOpen ? ' show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="dashboard-sidebar"
        className={`dash-sidebar${mobileOpen ? ' open' : ''}`}
        aria-label="Dashboard sidebar"
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: 'rgba(255,255,255,.10)',
                border: '1px solid rgba(251,191,36,.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: '.9rem',
                color: '#fcd34d',
              }}
            >
              {(company?.name || 'D')[0].toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  fontSize: '.95rem',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {company?.name || 'Dashboard'}
              </div>

              <div
                style={{
                  fontSize: '.7rem',
                  color: 'rgba(255,255,255,.48)',
                  marginTop: 1,
                }}
              >
                Owner Workspace
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          <div
            style={{
              fontSize: '.66rem',
              fontWeight: 700,
              letterSpacing: '.09em',
              color: 'rgba(255,255,255,.38)',
              textTransform: 'uppercase',
              padding: '0 14px',
              marginBottom: 8,
            }}
          >
            Menu
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map((item) => {
              const active = item.path === '/dashboard'
                ? location.pathname === '/dashboard' ||
                  location.pathname === '/dashboard/'
                : location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => go(item.path)}
                  className={`dash-nav-item${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    style={{
                      fontSize: '1.05rem',
                      width: 20,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.label === 'Overview' && notifCount > 0 && (
                    <span
                      style={{
                        background: 'var(--amber, #f59e0b)',
                        color: '#1a1208',
                        fontSize: '.65rem',
                        fontWeight: 800,
                        padding: '1px 7px',
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                      aria-label={`${notifCount} unread notifications`}
                    >
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: 12,
            borderTop: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px',
              borderRadius: 11,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.10)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--amber, #f59e0b), var(--gold, #fbbf24))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '.78rem',
                color: '#fff',
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '.82rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile?.full_name || 'Owner'}
              </div>

              <div
                style={{
                  fontSize: '.7rem',
                  color: 'rgba(255,255,255,.48)',
                }}
              >
                Owner
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,.55)',
                flexShrink: 0,
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color .15s, background .15s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = '#fca5a5';
                event.currentTarget.style.background = 'rgba(220,38,38,.20)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = 'rgba(255,255,255,.55)';
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashSidebar; 