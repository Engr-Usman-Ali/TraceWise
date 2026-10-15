import React, { useState } from 'react';
import { useDocuments, useDepartments, DocItem } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';
import { Button, FormField, TextInput } from '../ui';
import { DashHeader, PanelCard, EmptySlate } from './DashShared';

/* ── Status badge ─────────────────────────────────────────── */
const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  'up-to-date':    { bg: 'rgba(22,163,74,.10)',  color: 'var(--success)',  label: 'Up to Date'    },
  'review-needed': { bg: 'rgba(249,115,22,.12)', color: 'var(--amber-d)', label: 'Review Needed' },
  'conflict':      { bg: 'rgba(220,38,38,.09)',  color: 'var(--error)',   label: 'Conflict'      },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG['up-to-date'];
  return (
    <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

/* ── Filter bar ───────────────────────────────────────────── */
type FilterStatus = 'all' | 'up-to-date' | 'review-needed' | 'conflict';

const FilterBar: React.FC<{ active: FilterStatus; onChange: (f: FilterStatus) => void }> = ({ active, onChange }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {(['all', 'up-to-date', 'review-needed', 'conflict'] as FilterStatus[]).map(f => (
      <button
        key={f}
        onClick={() => onChange(f)}
        style={{
          padding: '5px 14px', borderRadius: 20, fontSize: '.78rem', fontWeight: 600,
          border: `1.5px solid ${active === f ? 'var(--amber)' : 'var(--border)'}`,
          background: active === f ? 'var(--peach)' : '#fff',
          color: active === f ? 'var(--amber-d)' : 'var(--char-m)',
          cursor: 'pointer', transition: '.15s',
        }}
      >
        {f === 'all' ? 'All' : STATUS_CFG[f]?.label}
      </button>
    ))}
  </div>
);

/* ── Add Document Modal ───────────────────────────────────── */
const AddDocModal: React.FC<{
  depts: { id: string; name: string }[];
  onClose: () => void;
  onSave: (name: string, deptId: string) => Promise<void>;
}> = ({ depts, onClose, onSave }) => {
  const [name,   setName]   = useState('');
  const [deptId, setDeptId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const handle = async () => {
    if (!name.trim()) { setErr('Document name is required'); return; }
    setSaving(true);
    await onSave(name.trim(), deptId);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px,4vw,32px)', width: '100%', maxWidth: 460, animation: 'fadeIn .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--char)' }}>Add Document</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--char-l)' }}>✕</button>
        </div>

        <FormField label="Document Name" error={err}>
          <TextInput
            placeholder="e.g. Q4 Sales Playbook"
            value={name}
            onChange={e => { setName(e.target.value); setErr(''); }}
            autoFocus
          />
        </FormField>

        <FormField label="Assign to Department (optional)">
          <select value={deptId} onChange={e => setDeptId(e.target.value)}>
            <option value="">— No department —</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </FormField>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={handle}>Add Document</Button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Status Modal ────────────────────────────────────── */
const EditStatusModal: React.FC<{
  doc: DocItem;
  onClose: () => void;
  onSave: (status: string) => Promise<void>;
}> = ({ doc, onClose, onSave }) => {
  const [status,  setStatus]  = useState<'up-to-date'|'review-needed'|'conflict'>(doc.status);
  const [saving,  setSaving]  = useState(false);

  const handle = async () => {
    setSaving(true);
    await onSave(status);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, animation: 'fadeIn .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--char)' }}>Update Status</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--char-l)' }}>✕</button>
        </div>
        <p style={{ fontSize: '.86rem', color: 'var(--char-l)', marginBottom: 18 }}>{doc.name}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {Object.entries(STATUS_CFG).map(([val, cfg]) => (
            <div
              key={val}
              onClick={() => setStatus(val as 'up-to-date'|'review-needed'|'conflict')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 11, cursor: 'pointer',
                border: `1.5px solid ${status === val ? 'var(--amber)' : 'var(--border)'}`,
                background: status === val ? 'var(--peach)' : '#fff', transition: '.15s',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--char)' }}>{cfg.label}</span>
              {status === val && <span style={{ marginLeft: 'auto', color: 'var(--amber)', fontSize: '.9rem' }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={handle}>Save</Button>
        </div>
      </div>
    </div>
  );
};

/* ── Main DocumentsTab ────────────────────────────────────── */
const DocumentsTab: React.FC = () => {
  const { showToast }                         = useAuth();
  const { docs, loading, createDoc, updateDoc, deleteDoc } = useDocuments();
  const { depts }                             = useDepartments();

  const [filter,    setFilter]    = useState<FilterStatus>('all');
  const [search,    setSearch]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [editDoc,   setEditDoc]   = useState<DocItem | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const filtered = docs.filter((d: DocItem) => {
    const matchStatus = filter === 'all' || d.status === filter;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = async (name: string, deptId: string) => {
    const err = await createDoc({ name, department_id: deptId || undefined });
    if (err) showToast(err, 'error');
    else showToast('Document added successfully');
  };

  const handleStatusSave = async (status: string) => {
    if (!editDoc) return;
    const err = await updateDoc(editDoc.id, { status: status as DocItem['status'] });
    if (err) showToast(err, 'error');
    else showToast('Status updated');
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const err = await deleteDoc(id);
    setDeleting(null);
    if (err) showToast(err, 'error');
    else showToast('Document deleted');
  };

  return (
    <div className="fade-in">
      <DashHeader
        title="Documents"
        subtitle={`${docs.length} document${docs.length !== 1 ? 's' : ''} in your workspace`}
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Add Document</Button>}
      />

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '.9rem', pointerEvents: 'none' }}>🔍</span>
          <input
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, borderRadius: 10, border: '1.5px solid var(--border)', padding: '9px 14px 9px 36px', width: '100%', fontSize: '.87rem', outline: 'none', fontFamily: "'Inter',sans-serif" }}
            onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <FilterBar active={filter} onChange={setFilter} />
      </div>

      {/* Table */}
      {loading ? (
        <PanelCard>
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--char-l)', fontSize: '.87rem' }}>Loading documents…</div>
        </PanelCard>
      ) : filtered.length === 0 ? (
        <PanelCard>
          <EmptySlate
            icon="📄"
            title={search || filter !== 'all' ? 'No matching documents' : 'No documents yet'}
            message={search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first document to start building your dependency map.'}
            action={!search && filter === 'all' ? <Button size="sm" onClick={() => setShowAdd(true)}>Add Document</Button> : undefined}
          />
        </PanelCard>
      ) : (
        <PanelCard style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 110px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--border)', background: 'var(--peach)' }}>
            {['Document Name', 'Department', 'Updated', 'Status'].map(h => (
              <div key={h} style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--char-l)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</div>
            ))}
          </div>

          {/* Data rows */}
          {filtered.map((d: DocItem, i: number) => (
            <div
              key={d.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 160px 110px',
                gap: 12, padding: '13px 18px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: '.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--peach)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Name + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,var(--amber),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', color: '#fff', flexShrink: 0 }}>📄</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '.87rem', fontWeight: 600, color: 'var(--char)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                    <button onClick={() => setEditDoc(d)} style={{ background: 'none', border: 'none', fontSize: '.71rem', color: 'var(--amber)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Inter',sans-serif" }}>Edit status</button>
                    <button
                      onClick={() => { if (window.confirm(`Delete "${d.name}"?`)) handleDelete(d.id); }}
                      disabled={deleting === d.id}
                      style={{ background: 'none', border: 'none', fontSize: '.71rem', color: 'var(--error)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Inter',sans-serif", opacity: deleting === d.id ? .5 : 1 }}
                    >
                      {deleting === d.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div style={{ fontSize: '.82rem', color: 'var(--char-m)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.department_name || <span style={{ color: 'var(--char-l)', fontSize: '.78rem' }}>Unassigned</span>}
              </div>

              {/* Date */}
              <div style={{ fontSize: '.8rem', color: 'var(--char-l)' }}>
                {new Date(d.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Status */}
              <StatusBadge status={d.status} />
            </div>
          ))}
        </PanelCard>
      )}

      {/* Modals */}
      {showAdd && (
        <AddDocModal
          depts={depts}
          onClose={() => setShowAdd(false)}
          onSave={handleCreate}
        />
      )}
      {editDoc && (
        <EditStatusModal
          doc={editDoc}
          onClose={() => setEditDoc(null)}
          onSave={handleStatusSave}
        />
      )}
    </div>
  );
};

export default DocumentsTab;
