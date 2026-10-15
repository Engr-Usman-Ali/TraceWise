import React from 'react';
import { useAuth } from '../../context/AuthContext';

const colors = { success: 'var(--success)', error: 'var(--error)', info: 'var(--amber)' };

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => removeToast(t.id)}
          style={{ background: 'var(--char)', color: '#fff', padding: '12px 18px', borderRadius: 12, fontSize: '.87rem', fontWeight: 500, borderLeft: `3px solid ${colors[t.type]}`, boxShadow: '0 4px 20px rgba(0,0,0,.25)', cursor: 'pointer', animation: 'slideIn .25s ease' }}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
export default ToastContainer;
