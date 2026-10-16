import React, { useState } from 'react';
import DashSidebar from './DashSidebar';
import { useNotifications } from '../../hooks/useDashboard';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notifs } = useNotifications();

  const unreadCount = notifs.filter((n: any) => !n.is_read).length;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg, #fafafa)',
      }}
    >
      <DashSidebar
        notifCount={unreadCount}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'clamp(16px, 3vw, 32px)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="dash-mobile-menu-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
          style={{
            display: 'none',
            position: 'fixed',
            top: 14,
            left: 14,
            zIndex: 180,
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.08)',
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        <style>{`
          @media (max-width: 900px) {
            .dash-mobile-menu-btn {
              display: flex !important;
            }
          }
        `}</style>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 