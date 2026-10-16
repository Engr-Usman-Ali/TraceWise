
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  FileSearch,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getImpactReports,
  type ImpactReport,
  type ImpactPriority,
  type ImpactStatus,
} from "../../services/impactReports";

import "../../styles/ImpactReportsTab.css";

interface ImpactReportsTabProps {
  accessToken: string;
  onOpenReport?: (reportId: string) => void;
}

const priorityOptions: Array<{
  label: string;
  value: ImpactPriority | "";
}> = [
  { label: "All priorities", value: "" },
  { label: "High priority", value: "high" },
  { label: "Medium priority", value: "medium" },
  { label: "Low priority", value: "low" },
];

const statusOptions: Array<{
  label: string;
  value: ImpactStatus | "";
}> = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "In review", value: "in_review" },
  { label: "Completed", value: "completed" },
  { label: "Dismissed", value: "dismissed" },
];

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function readableStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function ImpactReportsTab({
  accessToken,
  onOpenReport,
}: ImpactReportsTabProps) {
  const [reports, setReports] = useState<ImpactReport[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<ImpactPriority | "">("");
  const [status, setStatus] = useState<ImpactStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const result = await getImpactReports({
          page: 1,
          pageSize: 100,
          priority,
          status,
          accessToken,
        });

        if (active) {
          setReports(result.items);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load impact reports.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (!accessToken) {
      setLoading(false);
      setError("Please sign in to view impact reports.");
      return;
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, [accessToken, priority, status, refreshKey]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return reports;

    return reports.filter((report) =>
      [
        report.source_document_title,
        report.summary ?? "",
        report.status,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [reports, search]);

  return (
    <section className="impact-page">
      <header className="impact-header">
        <div>
          <div className="impact-eyebrow">WORKSPACE INTELLIGENCE</div>
          <h1>Impact Reports</h1>
          <p>
            Understand which documents may be affected when
            important business information changes.
          </p>
        </div>

        <button
          type="button"
          className="impact-refresh"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div className="impact-toolbar">
        <label className="impact-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search reports or source documents..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as ImpactPriority | "")
          }
        >
          {priorityOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as ImpactStatus | "")
          }
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="impact-state">
          <RefreshCw className="impact-spinner" size={24} />
          <p>Loading impact reports...</p>
        </div>
      ) : error ? (
        <div className="impact-state impact-error">
          <AlertCircle size={24} />
          <h2>Unable to load reports</h2>
          <p>{error}</p>
          <button
            type="button"
            className="impact-primary-button"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="impact-state">
          <div className="impact-empty-icon">
            <FileSearch size={28} />
          </div>
          <h2>No impact reports found</h2>
          <p>
            Reports will appear here after a document change
            has been analyzed.
          </p>
        </div>
      ) : (
        <>
          <div className="impact-results-heading">
            <span>
              {filteredReports.length} report
              {filteredReports.length === 1 ? "" : "s"}
            </span>
            <span>Newest first</span>
          </div>

          <div className="impact-report-list">
            {filteredReports.map((report) => (
              <ImpactReportCard
                key={report.id}
                report={report}
                onOpen={() => onOpenReport?.(report.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ImpactReportCard({
  report,
  onOpen,
}: {
  report: ImpactReport;
  onOpen: () => void;
}) {
  const hasAction = Boolean(onOpen);

  return (
    <article className="impact-report-card">
      <div className="impact-card-top">
        <div className="impact-document-icon">
          <FileSearch size={21} />
        </div>

        <div className="impact-card-title">
          <h2>{report.source_document_title}</h2>
          <p>Source document change analysis</p>
        </div>

        <span
          className={`impact-status status-${report.status}`}
        >
          {readableStatus(report.status)}
        </span>
      </div>

      {report.summary && (
        <p className="impact-summary">{report.summary}</p>
      )}

      <div className="impact-card-metrics">
        <div>
          <span>Potentially affected items</span>
          <strong>{report.item_count}</strong>
        </div>

        <div>
          <span>High-priority items</span>
          <strong>{report.high_priority_count}</strong>
        </div>

        <div>
          <span>Created</span>
          <strong>{formatDate(report.created_at)}</strong>
        </div>
      </div>

      <div className="impact-card-footer">
        <span className="impact-review-note">
          AI recommendations require human review.
        </span>

        <button
          type="button"
          className="impact-open-button"
          onClick={onOpen}
          disabled={!hasAction}
        >
          View report <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
