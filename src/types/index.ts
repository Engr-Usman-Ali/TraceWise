/* ── Auth / RBAC ─────────────────────────────────── */
export type AppRole = 'owner' | 'department_member';

export type DepartmentSlug = 'sales' | 'marketing' | 'operations';

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  slug: DepartmentSlug;
  email: string;          // login email given to employees
  login_email: string;    // alias column name in DB
  created_at: string;
}

export interface Profile {
  id: string;             // matches auth.users.id
  company_id: string | null;
  role: AppRole;
  department_id: string | null;
  full_name: string;
  created_at: string;
}

/* ── Documents ───────────────────────────────────── */
export type DocStatus = 'up-to-date' | 'review-needed' | 'conflict';
export type ImpactLevel = 'high' | 'medium' | 'low';

export interface Document {
  id: string;
  company_id: string;
  department_id: string | null;
  name: string;
  file_path: string | null;
  status: DocStatus;
  updated_at: string;
  created_by: string;
}

/* ── Dependency Graph ────────────────────────────── */
export interface DocumentLink {
  id: string;
  source_doc_id: string;
  target_doc_id: string;
  impact_level: ImpactLevel;
  reason: string;
  company_id: string;
}

/* ── Approvals ───────────────────────────────────── */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  document_link_id: string;
  requested_by: string;
  reviewed_by: string | null;
  status: ApprovalStatus;
  note: string | null;
  company_id: string;
  created_at: string;
}

/* ── Notifications ───────────────────────────────── */
export interface Notification {
  id: string;
  company_id: string;
  department_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/* ── UI Helpers ──────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: string; message: string; type: ToastType; }

export interface NavItem { label: string; icon: string; path: string; badge?: number; }
