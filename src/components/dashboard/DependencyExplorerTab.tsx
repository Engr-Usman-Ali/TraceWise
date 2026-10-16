
import { useCallback, useEffect, useState } from 'react';
import '../../styles/DependencyExplorerTab.css';

interface DependencyNode {
  id: string;
  name?: string;
  title?: string;
  department_id?: string | null;
  status?: string;
  created_at?: string;
}

interface DependencyEdge {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type?: string;
  description?: string | null;
  verification_status?: 'candidate' | 'verified' | 'rejected';
  confidence?: number | null;
}

interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  total_documents: number;
  total_relationships: number;
}

interface DependencyExplorerTabProps {
  accessToken: string;
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function DependencyExplorerTab({
  accessToken,
}: DependencyExplorerTabProps) {
  const [graph, setGraph] = useState<DependencyGraph>({
    nodes: [],
    edges: [],
    total_documents: 0,
    total_relationships: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGraph = useCallback(async () => {
    if (!accessToken) {
      setError('Your session is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dependency-explorer/graph`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Your session is invalid or you do not have permission to view this graph. Please sign in again.'
        );
      }

      if (!response.ok) {
        throw new Error(
          `Could not load dependency data. Server returned ${response.status}.`
        );
      }

      const data: DependencyGraph = await response.json();

      setGraph({
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        edges: Array.isArray(data.edges) ? data.edges : [],
        total_documents:
          data.total_documents ?? data.nodes?.length ?? 0,
        total_relationships:
          data.total_relationships ?? data.edges?.length ?? 0,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while loading the graph.'
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  const getDocumentName = (id: string) => {
    const document = graph.nodes.find((node) => node.id === id);
    return document?.name || document?.title || 'Unknown document';
  };

  return (
    <section className="dependency-explorer">
      <div className="dependency-header">
        <div>
          <p className="dependency-eyebrow">DOCUMENT INTELLIGENCE</p>
          <h1>Dependency Explorer</h1>
          <p className="dependency-subtitle">
            Explore how your company documents relate to one another.
          </p>
        </div>

        <button
          type="button"
          className="dependency-refresh"
          onClick={() => void loadGraph()}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      <div className="dependency-stats">
        <article className="dependency-stat">
          <span className="dependency-stat-icon">▤</span>
          <div>
            <p>Total documents</p>
            <strong>{graph.total_documents}</strong>
          </div>
        </article>

        <article className="dependency-stat">
          <span className="dependency-stat-icon">↔</span>
          <div>
            <p>Total relationships</p>
            <strong>{graph.total_relationships}</strong>
          </div>
        </article>

        <article className="dependency-stat">
          <span className="dependency-stat-icon">✓</span>
          <div>
            <p>Verified relationships</p>
            <strong>
              {
                graph.edges.filter(
                  (edge) => edge.verification_status === 'verified'
                ).length
              }
            </strong>
          </div>
        </article>
      </div>

      {error && (
        <div className="dependency-message dependency-error" role="alert">
          <strong>Unable to load the dependency graph</strong>
          <p>{error}</p>
          <button type="button" onClick={() => void loadGraph()}>
            Try again
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="dependency-message" role="status">
          Loading your company's documents and relationships...
        </div>
      )}

      {!loading && !error && graph.nodes.length === 0 && (
        <div className="dependency-empty">
          <div className="dependency-empty-icon">🔗</div>
          <h2>No documents to display yet</h2>
          <p>
            Documents belonging to your company will appear here. Once
            relationships are created, you can explore how the documents
            are connected.
          </p>
        </div>
      )}

      {!loading && !error && graph.nodes.length > 0 && (
        <>
          <div className="dependency-section-heading">
            <div>
              <h2>Document map</h2>
              <p>
                {graph.nodes.length} documents found in your company.
              </p>
            </div>
          </div>

          {graph.edges.length === 0 && (
            <div className="dependency-notice">
              Your documents are loaded, but no relationships have been
              created yet.
            </div>
          )}

          <div className="dependency-document-grid">
            {graph.nodes.map((node) => {
              const connectedCount = graph.edges.filter(
                (edge) =>
                  edge.source_document_id === node.id ||
                  edge.target_document_id === node.id
              ).length;

              return (
                <article className="dependency-document" key={node.id}>
                  <div className="dependency-document-top">
                    <span className="dependency-file-icon">▤</span>
                    <span className="dependency-document-status">
                      {node.status || 'Document'}
                    </span>
                  </div>

                  <h3>{node.name || node.title || 'Untitled document'}</h3>

                  <p className="dependency-document-id">
                    ID: {node.id}
                  </p>

                  <div className="dependency-document-footer">
                    <span>Connections</span>
                    <strong>{connectedCount}</strong>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="dependency-section-heading dependency-relationships-heading">
            <div>
              <h2>Relationships</h2>
              <p>Connections between your documents.</p>
            </div>
          </div>

          {graph.edges.length > 0 && (
            <div className="dependency-relationship-list">
              {graph.edges.map((edge) => (
                <article className="dependency-relationship" key={edge.id}>
                  <div className="dependency-relationship-doc">
                    <span className="dependency-file-icon">▤</span>
                    <span>{getDocumentName(edge.source_document_id)}</span>
                  </div>

                  <div className="dependency-relationship-link">
                    <span>→</span>
                    <small>
                      {(edge.relationship_type || 'references').replace(
                        /_/g,
                        ' '
                      )}
                    </small>
                  </div>

                  <div className="dependency-relationship-doc">
                    <span className="dependency-file-icon">▤</span>
                    <span>{getDocumentName(edge.target_document_id)}</span>
                  </div>

                  <span
                    className={`dependency-status dependency-status-${(
                      edge.verification_status || 'candidate'
                    ).toLowerCase()}`}
                  >
                    {edge.verification_status || 'candidate'}
                  </span>

                  {edge.description && (
                    <p className="dependency-relationship-description">
                      {edge.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
