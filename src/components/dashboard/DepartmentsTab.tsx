import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDepartments, DeptItem } from '../../hooks/useDashboard';
import { Button, FormField, TextInput } from '../ui';
import { DashHeader, PanelCard, EmptySlate } from './DashShared';

const SLUG_CFG = {
  sales:      { icon: '📈', color: 'var(--amber)',   label: 'Sales'      },
  marketing:  { icon: '📣', color: '#8B5CF6',        label: 'Marketing'  },
  operations: { icon: '⚙️', color: '#0EA5E9',        label: 'Operations' },
};

/* ── Create Dept Modal ──────────────────────────────────────── */
const CreateDeptModal: React.FC<{
  existing: DeptItem[];
  onClose:  () => void;
  onSave:   (name: string, slug: string, email: string, password: string) => Promise<string | null>;
}> = ({ existing, onClose, onSave }) => {
  const [name,     setName]     = useState('');
  const [slug,     setSlug]     = useState<'sales'|'marketing'|'operations'>('sales');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [created,  setCreated]  = useState<{ email: string; password: string; name: string } | null>(null);

  const usedSlugs = existing.map(d => d.slug);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name     = 'Name is required';
    if (!email.includes('@'))      e.email    = 'Enter a valid email';
    if (password.length < 6)       e.password = 'At least 6 characters';
    if (usedSlugs.includes(slug))  e.slug     = `${SLUG_CFG[slug].label} already exists`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = async () => {
    if (!validate()) return;
    setSaving(true);
    const err = await onSave(name.trim(), slug, email.trim(), password);
    setSaving(false);
    if (err) { setErrors({ general: err }); return; }
    setCreated({ email: email.trim(), password, name: name.trim() });
  };

  // Show success / credential screen
  if (created) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, animation: 'fadeIn .2s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--char)', marginBottom: 6 }}>{created.name} created!</h3>
            <p style={{ fontSize: '.86rem', color: 'var(--char-l)', lineHeight: 1.5 }}>
              Share these credentials securely with your employee. They will use them to sign in.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--peach)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--char-l)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Login Email</div>
              <div style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--char)', wordBreak: 'break-all' }}>{created.email}</div>
            </div>
            <div style={{ background: 'var(--peach)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--char-l)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Password</div>
              <div style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--char)' }}>{created.password}</div>
            </div>
          </div>
          <p style={{ fontSize: '.75rem', color: 'var(--error)', marginBottom: 18, textAlign: 'center' }}>
            ⚠️ Copy these now — the password will not be shown again.
          </p>
          <Button fullWidth onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px,4vw,32px)', width: '100%', maxWidth: 480, animation: 'fadeIn .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--char)' }}>Create Department</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--char-l)' }}>✕</button>
        </div>

        <FormField label="Department Name" error={errors.name}>
          <TextInput placeholder="e.g. Sales Team" value={name} onChange={e => setName(e.target.value)} error={!!errors.name} />
        </FormField>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--char-m)', display: 'block', marginBottom: 8 }}>Department Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {(Object.entries(SLUG_CFG) as [typeof slug, typeof SLUG_CFG[typeof slug]][]).map(([s, cfg]) => {
              const disabled = usedSlugs.includes(s);
              return (
                <div key={s} onClick={() => !disabled && setSlug(s as typeof slug)}
                  style={{
                    border: `1.5px solid ${slug === s ? 'var(--amber)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '10px 8px', cursor: disabled ? 'not-allowed' : 'pointer',
                    background: slug === s ? 'var(--peach)' : disabled ? '#fafafa' : '#fff',
                    textAlign: 'center', transition: '.15s', opacity: disabled ? .45 : 1,
                  }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 3 }}>{cfg.icon}</div>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--char-m)' }}>{cfg.label}</div>
                  {disabled && <div style={{ fontSize: '.65rem', color: 'var(--char-l)', marginTop: 1 }}>Exists</div>}
                </div>
              );
            })}
          </div>
          {errors.slug && <p style={{ fontSize: '.75rem', color: 'var(--error)', marginTop: 4 }}>{errors.slug}</p>}
        </div>

        <div style={{ background: 'var(--peach)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '.8rem', color: 'var(--char-m)', lineHeight: 1.5 }}>
            📧 Set login credentials below and share them securely with your employee.
          </p>
        </div>

        <FormField label="Login Email" error={errors.email}>
          <TextInput type="email" placeholder="sales@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} error={!!errors.email} />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <TextInput type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} error={!!errors.password} />
        </FormField>

        {errors.general && (
          <div style={{ background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.18)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '.83rem', color: 'var(--error)' }}>
            {errors.general}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={handle}>Create Department</Button>
        </div>
      </div>
    </div>
  );
};

/* ── Main DepartmentsTab ────────────────────────────────────── */
const DepartmentsTab: React.FC = () => {
  const { showToast }                   = useAuth();
  const { depts, loading, createDept, deleteDept } = useDepartments();
  const [showCreate, setShowCreate]     = useState(false);
  const [deleting,   setDeleting]       = useState<string | null>(null);

  const handleCreate = async (name: string, slug: string, email: string, password: string): Promise<string | null> => {
    const err = await createDept({ name, slug, login_email: email, login_password: password });
    if (!err) showToast(`${name} department created!`);
    return err;
  };

  const handleDelete = async (d: DeptItem) => {
    if (!window.confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    setDeleting(d.id);
    const err = await deleteDept(d.id);
    setDeleting(null);
    if (err) showToast(err, 'error');
    else showToast(`${d.name} deleted`);
  };

  return (
    <div className="fade-in">
      <DashHeader
        title="Departments"
        subtitle="Create up to 3 departments and issue login credentials to your team members."
        action={
          depts.length < 3
            ? <Button size="sm" onClick={() => setShowCreate(true)}>+ New Department</Button>
            : undefined
        }
      />

      {loading ? (
        <PanelCard>
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--char-l)', fontSize: '.87rem' }}>Loading…</div>
        </PanelCard>
      ) : depts.length === 0 ? (
        <PanelCard>
          <EmptySlate
            icon="🏢"
            title="No departments yet"
            message="Create up to 3 departments. Each gets a unique login email and password for their employees."
            action={<Button size="sm" onClick={() => setShowCreate(true)}>Create First Department</Button>}
          />
        </PanelCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 20 }}>
          {depts.map((d: DeptItem) => {
            const cfg = SLUG_CFG[d.slug as keyof typeof SLUG_CFG];
            return (
              <PanelCard key={d.id} style={{ borderTop: `3px solid ${cfg?.color || 'var(--amber)'}`, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', border: '1.5px solid var(--border)' }}>
                      {cfg?.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.97rem', color: 'var(--char)' }}>{d.name}</div>
                      <div style={{ fontSize: '.73rem', color: 'var(--char-l)', textTransform: 'capitalize', marginTop: 1 }}>{d.slug}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '.69rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9, background: 'rgba(22,163,74,.1)', color: 'var(--success)' }}>
                    Active
                  </span>
                </div>

                <div style={{ background: 'var(--peach)', borderRadius: 10, padding: '10px 13px', marginBottom: 14, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--char-l)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>
                    Employee Login Email
                  </div>
                  <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--char)', wordBreak: 'break-all' }}>{d.login_email}</div>
                </div>

                <div style={{ fontSize: '.72rem', color: 'var(--char-l)', marginBottom: 14 }}>
                  Created {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <button
                  onClick={() => handleDelete(d)}
                  disabled={deleting === d.id}
                  style={{ background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--error)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Inter',sans-serif", opacity: deleting === d.id ? .5 : 1 }}
                >
                  {deleting === d.id ? 'Deleting…' : 'Delete department'}
                </button>
              </PanelCard>
            );
          })}
        </div>
      )}

      {depts.length >= 3 && (
        <div style={{ background: 'var(--peach)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 18px', fontSize: '.86rem', color: 'var(--char-m)' }}>
          ℹ️ Maximum 3 departments reached. Upgrade to Enterprise to add more.
        </div>
      )}

      {showCreate && (
        <CreateDeptModal
          existing={depts}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
};

export default DepartmentsTab;
