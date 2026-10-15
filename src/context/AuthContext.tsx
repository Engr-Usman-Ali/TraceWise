import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { Profile, Company, Department, Toast, ToastType } from '../types';

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

interface AuthContextType {
  profile:         Profile | null;
  company:         Company | null;
  department:      Department | null;
  departments:     Department[];
  loading:         boolean;
  isAuthenticated: boolean;
  signUpOwner:     (email: string, password: string, fullName: string, companyName: string) => Promise<string | null>;
  signIn:          (email: string, password: string) => Promise<{ error: string | null; redirectTo: string }>;
  signOut:         () => void;
  createDepartment:(name: string, slug: 'sales'|'marketing'|'operations', loginEmail: string, loginPassword: string) => Promise<string | null>;
  refreshDepts:    () => Promise<void>;
  toasts:          Toast[];
  showToast:       (message: string, type?: ToastType) => void;
  removeToast:     (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [company,     setCompany]     = useState<Company | null>(null);
  const [department,  setDepartment]  = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [toasts,      setToasts]      = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const me = await apiFetch('/auth/me');
      setProfile({
        id: me.id, company_id: me.company_id,
        department_id: me.department_id, role: me.role,
        full_name: me.full_name, created_at: '',
      });
      if (me.company_id) {
        setCompany({ id: me.company_id, name: me.company_name || '', owner_id: me.id, created_at: '' });
      }
      if (me.department_id) {
        setDepartment({ id: me.department_id, company_id: me.company_id, name: me.department_name || '', slug: 'sales', email: '', login_email: '', created_at: '' });
      }
      if (me.role === 'owner' && me.company_id) {
        try { const depts = await apiFetch('/departments/'); setDepartments(depts); } catch {}
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const signUpOwner = async (
    email: string, password: string, fullName: string, companyName: string,
  ): Promise<string | null> => {
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, company_name: companyName }),
      });
      localStorage.setItem('access_token',  data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await loadMe();
      return null;
    } catch (e: any) { return e.message; }
  };

  // ← KEY CHANGE: returns { error, redirectTo } instead of string | null
  const signIn = async (
    email: string, password: string,
  ): Promise<{ error: string | null; redirectTo: string }> => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('access_token',  data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await loadMe();
      return { error: null, redirectTo: data.redirect_to || '/dashboard' };
    } catch (e: any) {
      return { error: e.message, redirectTo: '' };
    }
  };

  const signOut = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setProfile(null); setCompany(null); setDepartment(null); setDepartments([]);
  }, []);

  const createDepartment = async (
    name: string, slug: 'sales'|'marketing'|'operations',
    loginEmail: string, loginPassword: string,
  ): Promise<string | null> => {
    try {
      await apiFetch('/departments/', {
        method: 'POST',
        body: JSON.stringify({ name, slug, login_email: loginEmail, login_password: loginPassword }),
      });
      await refreshDepts();
      return null;
    } catch (e: any) { return e.message; }
  };

  const refreshDepts = useCallback(async () => {
    try { const depts = await apiFetch('/departments/'); setDepartments(depts); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      profile, company, department, departments, loading,
      isAuthenticated: !!profile,
      signUpOwner, signIn, signOut,
      createDepartment, refreshDepts,
      toasts, showToast, removeToast,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};