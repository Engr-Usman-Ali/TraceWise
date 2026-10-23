import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeptLayout from '../components/layout/DeptLayout';
import { Button, Card, ImpactBadge, DeptChip, EmptyState } from '../components/ui';
import { FileText, RefreshCw, Search, AlertCircle } from "lucide-react";
import {
  getDepartmentDocuments,
  type DepartmentDocument,
} from "../services/deptDocuments";

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

  const [documents, setDocuments] = useState<DepartmentDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please sign in to view your documents.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getDepartmentDocuments(token);

        if (active) {
          setDocuments(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load documents.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="fade-in">
      <DashHead
        title={`${department?.name || "Department"} Documents`}
        sub="View documents available to your department workspace."
        action={
          <Button
            size="sm"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
          >
            <RefreshCw size={14} />
            {" "}Refresh
          </Button>
        }
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          marginBottom: 20,
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <Search size={17} color="var(--char-l)" />

        <input
          type="search"
          placeholder="Search documents..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: ".88rem",
            color: "var(--char)",
          }}
        />
      </div>

      {loading ? (
        <Card style={{ padding: 32, textAlign: "center" }}>
          <RefreshCw size={22} />
          <p style={{ marginTop: 10, color: "var(--char-l)" }}>
            Loading documents...
          </p>
        </Card>
      ) : error ? (
        <Card style={{ padding: 24, textAlign: "center" }}>
          <AlertCircle size={26} color="var(--error)" />
          <h3 style={{ marginTop: 10 }}>Unable to load documents</h3>
          <p style={{ margin: "8px 0 16px", color: "var(--char-l)" }}>
            {error}
          </p>
          <Button
            size="sm"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Try again
          </Button>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card style={{ padding: 28 }}>
          <EmptyState
            icon="📄"
            title={
              search ? "No matching documents" : "No documents available"
            }
            message={
              search
                ? "Try another search term."
                : "Documents available to your department will appear here."
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {filteredDocuments.map((document) => (
            <Card
              key={document.id}
              style={{ padding: 18, minWidth: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 11,
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, var(--amber), var(--gold))",
                  }}
                >
                  <FileText size={21} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: ".92rem",
                      fontWeight: 700,
                      color: "var(--char)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {document.name || "Untitled document"}
                  </h3>

                  <p
                    style={{
                      marginTop: 6,
                      fontSize: ".76rem",
                      color: "var(--char-l)",
                    }}
                  >
                    {document.updated_at
                      ? `Updated ${new Date(
                          document.updated_at,
                        ).toLocaleDateString("en-US")}`
                      : document.created_at
                        ? `Created ${new Date(
                            document.created_at,
                          ).toLocaleDateString("en-US")}`
                        : "Date unavailable"}
                  </p>

                  {document.description && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: ".82rem",
                        color: "var(--char-l)",
                        lineHeight: 1.5,
                      }}
                    >
                      {document.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p
        style={{
          marginTop: 18,
          fontSize: ".78rem",
          color: "var(--char-l)",
        }}
      >
        Showing {filteredDocuments.length} of {documents.length} documents.
      </p>
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
