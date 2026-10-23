
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface DepartmentDocument {
  id: string;
  name: string;
  description?: string | null;
  department_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string | null;
}

export async function getDepartmentDocuments(
  accessToken: string,
): Promise<DepartmentDocument[]> {
  const response = await fetch(`${API_BASE_URL}/documents/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to load documents (${response.status})`,
    );
  }

  const data: unknown = await response.json();

  // Support either a direct array or a paginated API response.
  if (Array.isArray(data)) {
    return data as DepartmentDocument[];
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray(data.items)
  ) {
    return data.items as DepartmentDocument[];
  }

  throw new Error("The documents API returned an unexpected response.");
}
