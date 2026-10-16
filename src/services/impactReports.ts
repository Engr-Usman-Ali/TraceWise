
export type ImpactPriority = "high" | "medium" | "low";

export type ImpactStatus =
  | "pending"
  | "in_review"
  | "completed"
  | "dismissed";

export interface ImpactReport {
  id: string;
  source_document_id: string | null;
  source_document_title: string;
  status: string;
  summary: string | null;
  created_at: string | null;
  item_count: number;
  high_priority_count: number;
}

export interface ImpactReportList {
  items: ImpactReport[];
  total: number;
  page: number;
  page_size: number;
}

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function getImpactReports(options: {
  page?: number;
  pageSize?: number;
  priority?: ImpactPriority | "";
  status?: ImpactStatus | "";
  accessToken: string;
}): Promise<ImpactReportList> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    page_size: String(options.pageSize ?? 10),
  });

  if (options.status) {
    params.set("status", options.status);
  }

  if (options.priority) {
    params.set("priority", options.priority);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/impact-reports?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Unable to load reports (${response.status})`,
    );
  }

  return response.json() as Promise<ImpactReportList>;
}
