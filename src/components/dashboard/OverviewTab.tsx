import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOverviewStats, useDocuments, useNotifications } from '../../hooks/useDashboard';
import { Button } from '../ui';
import { DashHeader, PanelCard, PanelHead, KPICard, DocRow, EmptySlate, SectionGrid, StatusDot } from './DashShared';

const OverviewTab: React.FC = () => {
  const navigate             = useNavigate();
  const { profile, company } = useAuth();
  const { stats, loading: statsLoading } = useOverviewStats();
  const { docs,  loading: docsLoading  } = useDocuments();
  const { notifs }                        = useNotifications();

  const firstName  = profile?.full_name?.split(' ')[0] || 'there';
  const recentDocs = docs.slice(0, 5);
  const unreadCount = notifs.filter((n: any) => !n.is_read).length;

  const kpis = [
    {
      label: 'Total Documents', icon: '📄',
      value: statsLoading ? '—' : String(stats?.total_documents ?? 0),
      accent: 'var(--amber)',
    },
    {
      label: 'Departments', icon: '🏢',
      value: statsLoading ? '—' : String(stats?.total_departments ?? 0),
      accent: '#8B5CF6',
    },
    {
      label: 'Review Needed', icon: '⚠️',
      value: statsLoading ? '—' : String(stats?.review_needed ?? 0),
      delta: stats?.review_needed ? 'Needs attention' : undefined,
      deltaUp: false,
      accent: '#F59E0B',
    },
    {
      label: 'Conflicts', icon: '🚨',
      value: statsLoading ? '—' : String(stats?.conflicts ?? 0),
      delta: stats?.conflicts ? 'Action required' : undefined,
      deltaUp: false,
      accent: 'var(--error)',
    },
  ];

  return (
    <div className="fade-in">
      <DashHeader
        title={`Good morning, ${firstName} 👋`}
        subtitle={`${company?.name || 'Your company'} · Owner Dashboard`}
        action={
          <Button size="sm" onClick={() => navigate('/dashboard/documents')}>
            + Add Document
          </Button>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 24 }}>
        {kpis.map(k => (
          <KPICard key={k.label} label={k.label} value={k.value} delta={k.delta} deltaUp={k.deltaUp} icon={k.icon} accent={k.accent} />
        ))}
      </div>

      <SectionGrid cols="1.6fr 1fr">
        {/* Recent Documents */}
        <PanelCard>
          <PanelHead
            title="Recent Documents"
            action={
              <span
                onClick={() => navigate('/dashboard/documents')}
                style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--amber)', cursor: 'pointer' }}
              >
                View all →
              </span>
            }
          />
          {docsLoading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--char-l)', fontSize: '.87rem' }}>Loading…</div>
          ) : recentDocs.length === 0 ? (
            <EmptySlate
              icon="📄"
              title="No documents yet"
              message="Upload your first document to start tracking dependencies."
              action={<Button size="sm" onClick={() => navigate('/dashboard/documents')}>Add Document</Button>}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentDocs.map((d: any) => (
                <DocRow
                  key={d.id}
                  name={d.name}
                  meta={`${d.department_name || 'No dept'} · ${new Date(d.updated_at).toLocaleDateString()}`}
                  status={d.status}
                  onClick={() => navigate('/dashboard/documents')}
                />
              ))}
            </div>
          )}
        </PanelCard>

        {/* Notifications snapshot */}
        <PanelCard>
          <PanelHead
            title="Notifications"
            action={
              unreadCount > 0
                ? <span style={{ fontSize: '.72rem', fontWeight: 700, background: 'var(--amber)', color: '#fff', borderRadius: 10, padding: '2px 8px' }}>{unreadCount}</span>
                : undefined
            }
          />
          {notifs.length === 0 ? (
            <EmptySlate icon="🔔" title="All quiet" message="No notifications yet. They'll appear here when documents change." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifs.slice(0, 5).map((n: any) => (
                <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <StatusDot color={n.is_read ? 'green' : 'orange'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '.83rem', fontWeight: n.is_read ? 400 : 600,
                      color: n.is_read ? 'var(--char-l)' : 'var(--char)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '.71rem', color: 'var(--char-l)', marginTop: 1 }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {notifs.length > 5 && (
                <div style={{ fontSize: '.78rem', color: 'var(--char-l)', textAlign: 'center', paddingTop: 4 }}>
                  +{notifs.length - 5} more
                </div>
              )}
            </div>
          )}
        </PanelCard>
      </SectionGrid>

      {/* Document health bar */}
      {stats && stats.total_documents > 0 && (
        <PanelCard>
          <PanelHead title="Document Health" />
          <div style={{ display: 'flex', gap: 0, height: 10, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
            {[
              { pct: (stats.up_to_date / stats.total_documents) * 100, color: 'var(--success)' },
              { pct: (stats.review_needed / stats.total_documents) * 100, color: '#F59E0B' },
              { pct: (stats.conflicts / stats.total_documents) * 100, color: 'var(--error)' },
            ].map((s, i) => (
              s.pct > 0 && <div key={i} style={{ width: `${s.pct}%`, background: s.color, transition: '.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Up to Date',    val: stats.up_to_date,    color: 'var(--success)' },
              { label: 'Review Needed', val: stats.review_needed, color: '#F59E0B'        },
              { label: 'Conflicts',     val: stats.conflicts,     color: 'var(--error)'   },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--char-m)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                <span style={{ fontWeight: 600 }}>{s.val}</span> {s.label}
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
};

export default OverviewTab;
