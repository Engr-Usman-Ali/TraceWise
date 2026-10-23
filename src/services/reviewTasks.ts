
export type ReviewTaskPriority = "high" | "medium" | "low";

export type ReviewTaskStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";

export interface ReviewTask {
  id: string;
  title: string;
  description: string | null;
  impact_report_id: string | null;
  document_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  priority: ReviewTaskPriority;
  status: ReviewTaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewTaskList {
  items: ReviewTask[];
  total: number;
  page: number;
  page_size: number;
}

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

async function request<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getReviewTasks(
  accessToken: string,
  filters: {
    status?: ReviewTaskStatus | "";
    priority?: ReviewTaskPriority | "";
  } = {},
): Promise<ReviewTaskList> {
  const params = new URLSearchParams({
    page: "1",
    page_size: "100",
  });

  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);

  return request(`/review-tasks?${params}`, accessToken);
}

export function createReviewTask(
  accessToken: string,
  data: {
    title: string;
    description?: string;
    priority: ReviewTaskPriority;
    due_date?: string;
  },
): Promise<ReviewTask> {
  return request("/review-tasks", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReviewTask(
  accessToken: string,
  taskId: string,
  data: {
    status?: ReviewTaskStatus;
    priority?: ReviewTaskPriority;
  },
): Promise<ReviewTask> {
  return request(`/review-tasks/${taskId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getReviewTaskComments(
  accessToken: string,
  taskId: string,
): Promise<{ items: Array<{
  id: string;
  author_id: string | null;
  comment: string;
  created_at: string;
}> }> {
  return request(`/review-tasks/${taskId}/comments`, accessToken);
}

export function addReviewTaskComment(
  accessToken: string,
  taskId: string,
  comment: string,
): Promise<{ id: string; comment: string; created_at: string }> {
  return request(`/review-tasks/${taskId}/comments`, accessToken, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export function getReviewTaskHistory(
  accessToken: string,
  taskId: string,
): Promise<{ items: Array<{
  id: string;
  event_type: string;
  details: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
}> }> {
  return request(`/review-tasks/${taskId}/history`, accessToken);
}
