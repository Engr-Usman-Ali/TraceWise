import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeptLayout from '../components/layout/DeptLayout';
import { Button, Card, ImpactBadge, DeptChip, EmptyState } from '../components/ui';

const PCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ c, style }: any) => (
  <Card style={{ padding:'clamp(14px,3vw,22px)', ...style }}>{c}</Card>
);

const DashHead: React.FC<{ title:string; sub:string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:10 }}>
    <div>
      <h2 style={{ fontSize:'clamp(1.2rem,3vw,1.6rem)', fontWeight:800, color:'var(--char)' }}>{title}</h2>
      <div style={{ fontSize:'.83rem', color:'var(--char-l)', marginTop:2 }}>{sub}</div>
    </div>
    {action}
  </div>
);

/* ── My Documents ─────────────────────────────── */
const MyDocs: React.FC = () => {
  const { department, showToast } = useAuth();
  const docs = [
    { icon:'📄', name:'Q4 Sales Playbook',       meta:'Updated 2h ago',   badge:'Review Needed', bc:'warn' },
    { icon:'📋', name:'Campaign Brief — Oct',     meta:'Updated today',    badge:'Up to Date',   bc:'ok'   },
    { icon:'📑', name:'Pricing Sheet v7',         meta:'Updated 5h ago',   badge:'Conflict',     bc:'err'  },
  ];
  return (
    <div className="fade-in">
      <DashHead title={`${department?.name || 'Department'} Documents`} sub="Documents assigned to your department workspace."
        action={<Button size="sm" onClick={() => showToast('Upload coming soon.')}>+ Upload</Button>}
      />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
        {docs.map(d => (
          <div key={d.name} style={{ background:'#fff', borderRadius:14, padding:'16px', border:'1px solid var(--border)', display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,var(--amber),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:'#fff', flexShrink:0 }}>{d.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'.9rem', fontWeight:600, color:'var(--char)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</div>
              <div style={{ fontSize:'.74rem', color:'var(--char-l)', marginBottom:8 }}>{d.meta}</div>
              <span style={{ fontSize:'.7rem', fontWeight:700, padding:'2px 9px', borderRadius:9, background:d.bc==='ok'?'rgba(22,163,74,.1)':d.bc==='warn'?'rgba(249,115,22,.12)':'rgba(220,38,38,.09)', color:d.bc==='ok'?'var(--success)':d.bc==='warn'?'var(--amber-d)':'var(--error)' }}>{d.badge}</span>
            </div>
          </div>
        ))}
      </div>
      {docs.length === 0 && (
        <Card style={{ padding:24 }}><EmptyState icon="📄" title="No documents yet" message="Your owner hasn't assigned any documents to your department yet." /></Card>
      )}
    </div>
  );
};

/* ── Upload ───────────────────────────────────── */
const DeptUpload: React.FC = () => {
  const { showToast } = useAuth();
  const [hov, setHov] = useState(false);
  return (
    <div className="fade-in">
      <DashHead title="Upload Documents" sub="Upload files to your department workspace." />
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={() => showToast('Files uploaded!')}
        style={{ border:`2px dashed ${hov?'var(--amber-d)':'var(--amber)'}`, borderRadius:16, padding:'48px 28px', textAlign:'center', background:hov?'rgba(249,115,22,.07)':'rgba(249,115,22,.03)', cursor:'pointer', transition:'.2s' }}>
        <div style={{ fontSize:'2rem', marginBottom:10 }}>📂</div>
        <h4 style={{ fontWeight:700, color:'var(--char)', marginBottom:5 }}>Drag files or click to browse</h4>
        <p style={{ fontSize:'.85rem', color:'var(--char-l)' }}>PDF, DOCX, XLSX, PPTX — up to 50MB</p>
      </div>
    </div>
  );
};

/* ── Dept Notifications ───────────────────────── */
const DeptNotifications: React.FC = () => {
  const { showToast } = useAuth();
  const [items, setItems] = useState([
    { id:'dn1', title:'Action required: Pricing update in your documents', desc:'3 documents in your department reference the old pricing tiers that were updated today.', time:'1h ago', unread:true },
    { id:'dn2', title:'Review requested: Campaign Brief changes', desc:'Your admin has flagged 2 sections for your review and approval.', time:'3h ago', unread:true },
    { id:'dn3', title:'Document sync complete', desc:'Your department documents have been re-analyzed. All clear.', time:'Yesterday', unread:false },
  ]);
  return (
    <div className="fade-in">
      <DashHead title="Notifications" sub={`${items.filter(n=>n.unread).length} unread`}
        action={<Button variant="ghost" size="sm" onClick={() => { setItems(p=>p.map(n=>({...n,unread:false}))); showToast('Marked as read.'); }}>Mark all read</Button>}
      />
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {items.map(n => (
          <Card key={n.id} style={{ padding:'14px 18px', borderLeft:n.unread?'3px solid var(--amber)':'1px solid var(--border)' }}>
            <h4 style={{ fontSize:'.88rem', fontWeight:600, color:'var(--char)', marginBottom:4 }}>{n.title}</h4>
            <p style={{ fontSize:'.8rem', color:'var(--char-l)', lineHeight:1.5, marginBottom:6 }}>{n.desc}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'.7rem', color:'var(--char-l)' }}>{n.time}</span>
              {n.unread && <Button size="sm" onClick={() => { setItems(p=>p.map(x=>x.id===n.id?{...x,unread:false}:x)); showToast('Dismissed.'); }}>Dismiss</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ── Dept Approvals ───────────────────────────── */
const DeptApprovals: React.FC = () => {
  const { showToast } = useAuth();
  const [done, setDone] = useState<string[]>([]);
  const items = [
    { id:'da1', level:'medium' as const, doc:'Campaign Brief — Section 2', desc:'Pricing copy needs to reflect updated tiers ($449/mo). Please review and approve or revise.', depts:['Marketing'] },
    { id:'da2', level:'low'    as const, doc:'Social Media Calendar', desc:'Minor date inconsistency detected from campaign launch update.', depts:['Marketing'] },
  ];
  const pending = items.filter(a => !done.includes(a.id));
  return (
    <div className="fade-in">
      <DashHead title="Pending Approvals" sub="Review AI-suggested changes for your department." />
      {pending.length === 0 ? (
        <Card style={{ padding:24 }}><EmptyState icon="✅" title="All clear!" message="No pending approvals in your department." /></Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {pending.map(a => (
            <Card key={a.id} style={{ padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <ImpactBadge level={a.level} />
                    <span style={{ fontSize:'.87rem', fontWeight:600, color:'var(--char)' }}>{a.doc}</span>
                  </div>
                  <p style={{ fontSize:'.82rem', color:'var(--char-l)', lineHeight:1.5, marginBottom:7 }}>{a.desc}</p>
                  {a.depts.map(d => <DeptChip key={d} label={d} />)}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                  <Button size="sm" onClick={() => { setDone(p=>[...p,a.id]); showToast('Approved!'); }}>Approve</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setDone(p=>[...p,a.id]); showToast('Rejected.','error'); }}>Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Dept Router ──────────────────────────────── */
const DeptPage: React.FC = () => (
  <DeptLayout>
    <Routes>
      <Route index                element={<MyDocs />}             />
      <Route path="upload"        element={<DeptUpload />}         />
      <Route path="notifications" element={<DeptNotifications />}  />
      <Route path="approvals"     element={<DeptApprovals />}      />
      <Route path="*"             element={<Navigate to="/dept" replace />} />
    </Routes>
  </DeptLayout>
);

export default DeptPage;
