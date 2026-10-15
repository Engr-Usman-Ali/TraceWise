import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, FormField, TextInput, Toggle } from '../ui';
import { DashHeader, PanelCard } from './DashShared';

const ProfileTab: React.FC = () => {
  const navigate             = useNavigate();
  const { profile, company, signOut, showToast } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'OW';

  const [toggles, setToggles] = useState({
    high:     true,
    approvals: true,
    weekly:   true,
    ai:       false,
  });

  const toggle = (k: keyof typeof toggles) =>
    setToggles(p => ({ ...p, [k]: !p[k] }));

  const handleSave = () => showToast('Profile saved.');

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="fade-in">
      <DashHeader
        title="Account & Settings"
        subtitle="Manage your owner account information and preferences."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        gap: 20,
      }}>

        {/* ── Avatar + identity card ─────────────────────── */}
        <PanelCard style={{ textAlign: 'center', padding: 28 }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--amber),var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem',
            color: '#fff', margin: '0 auto 14px',
          }}>
            {initials}
          </div>

          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--char)', marginBottom: 4 }}>
            {profile?.full_name || 'Owner'}
          </div>
          <div style={{ fontSize: '.82rem', color: 'var(--char-l)', marginBottom: 10 }}>
            {company?.name || '—'}
          </div>

          {/* Owner badge */}
          <span style={{
            display: 'inline-block', fontSize: '.75rem', fontWeight: 700,
            background: 'rgba(249,115,22,.12)', color: 'var(--amber-d)',
            padding: '3px 14px', borderRadius: 20,
          }}>
            👑 Owner
          </span>

          {/* Company info */}
          <div style={{ marginTop: 22, background: 'var(--peach)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--char-l)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Company</div>
            <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--char)' }}>{company?.name || '—'}</div>
          </div>

          {/* Sign out */}
          <div style={{ marginTop: 20 }}>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </PanelCard>

        {/* ── Right column ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Account info */}
          <PanelCard>
            <h3 style={{ fontSize: '.97rem', fontWeight: 700, color: 'var(--char)', marginBottom: 18 }}>
              Account Information
            </h3>

            <FormField label="Full Name">
              <TextInput
                defaultValue={profile?.full_name || ''}
                placeholder="Your full name"
              />
            </FormField>
            <FormField label="Company Name">
              <TextInput
                defaultValue={company?.name || ''}
                placeholder="Your company"
              />
            </FormField>

            {/* Read-only account ID */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--char-m)', display: 'block', marginBottom: 5 }}>
                Account ID
              </label>
              <div style={{
                background: 'var(--peach)', borderRadius: 10,
                padding: '10px 14px', border: '1px solid var(--border)',
                fontSize: '.78rem', color: 'var(--char-l)',
                fontFamily: 'monospace', wordBreak: 'break-all',
              }}>
                {profile?.id || '—'}
              </div>
            </div>

            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </PanelCard>

          {/* Notification preferences */}
          <PanelCard>
            <h3 style={{ fontSize: '.97rem', fontWeight: 700, color: 'var(--char)', marginBottom: 16 }}>
              Notification Preferences
            </h3>
            {[
              { key: 'high'      as const, label: 'High-impact change alerts'  },
              { key: 'approvals' as const, label: 'Approval requests'          },
              { key: 'weekly'    as const, label: 'Weekly summary digest'      },
              { key: 'ai'        as const, label: 'AI analysis complete'       },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '.87rem', color: 'var(--char-m)' }}>{item.label}</span>
                <Toggle on={toggles[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </PanelCard>

          {/* Security note */}
          <PanelCard style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <div>
                <div style={{ fontSize: '.87rem', fontWeight: 700, color: 'var(--char)', marginBottom: 4 }}>
                  Password & Security
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--char-l)', lineHeight: 1.55, marginBottom: 12 }}>
                  To change your password, sign out and use "Forgot password?" on the login screen.
                </div>
                <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/login'); }}>
                  Go to Login
                </Button>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
