import { useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

/* ── Types ─────────────────────────────────────────────────── */
export interface DocItem {
  id: string;
  company_id: string;
  department_id: string | null;
  name: string;
  file_path: string | null;
  status: 'up-to-date' | 'review-needed' | 'conflict';
  created_by: string | null;
  updated_at: string;
  created_at: string;
  department_name: string | null;
}

export interface OverviewStats {
  total_documents: number;
  total_departments: number;
  review_needed: number;
  conflicts: number;
  up_to_date: number;
}

export interface NotifItem {
  id: string;
  company_id: string;
  department_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DeptItem {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  login_email: string;
  created_at: string;
}

/* ── useOverviewStats ──────────────────────────────────────── */
export function useOverviewStats() {
  const [stats, setStats]   = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/overview/stats');
      setStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { stats, loading, error, refetch: fetch_ };
}

/* ── useDocuments ──────────────────────────────────────────── */
export function useDocuments() {
  const [docs, setDocs]     = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/documents/');
      setDocs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createDoc = async (payload: { name: string; department_id?: string; status?: string }): Promise<string | null> => {
    try {
      await apiFetch('/documents/', { method: 'POST', body: JSON.stringify(payload) });
      await fetch_();
      return null;
    } catch (e: any) { return e.message; }
  };

  const updateDoc = async (id: string, payload: Partial<DocItem>): Promise<string | null> => {
    try {
      await apiFetch(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      await fetch_();
      return null;
    } catch (e: any) { return e.message; }
  };

  const deleteDoc = async (id: string): Promise<string | null> => {
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' });
      setDocs(p => p.filter(d => d.id !== id));
      return null;
    } catch (e: any) { return e.message; }
  };

  return { docs, loading, error, refetch: fetch_, createDoc, updateDoc, deleteDoc };
}

/* ── useNotifications ──────────────────────────────────────── */
export function useNotifications() {
  const [notifs, setNotifs]   = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/notifications/');
      setNotifs(data);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'POST' });
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  return { notifs, loading, refetch: fetch_, markRead, markAllRead };
}

/* ── useDepartments ────────────────────────────────────────── */
export function useDepartments() {
  const [depts, setDepts]     = useState<DeptItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/departments/');
      setDepts(data);
    } catch {
      setDepts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createDept = async (payload: {
    name: string; slug: string; login_email: string; login_password: string;
  }): Promise<string | null> => {
    try {
      await apiFetch('/departments/', { method: 'POST', body: JSON.stringify(payload) });
      await fetch_();
      return null;
    } catch (e: any) { return e.message; }
  };

  const deleteDept = async (id: string): Promise<string | null> => {
    try {
      await apiFetch(`/departments/${id}`, { method: 'DELETE' });
      setDepts(p => p.filter(d => d.id !== id));
      return null;
    } catch (e: any) { return e.message; }
  };

  return { depts, loading, refetch: fetch_, createDept, deleteDept };
}
