import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = '/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'admin';
  phone: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<User>;
  registerDonor: (data: { fullName: string; orgName: string; phone: string; city: string; password: string; email: string }) => Promise<User>;
  registerReceiver: (data: { orgName: string; orgType: string; phone: string; city: string; password: string; email: string }) => Promise<User>;
  logout: () => void;
  setError: (error: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Uses sessionStorage (per-tab) so you can be donor in one tab and receiver in another.
 * Each browser tab has its own independent session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // sessionStorage is per-tab, so each tab keeps its own user
    const saved = sessionStorage.getItem('foodbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync to sessionStorage (per-tab) whenever user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('foodbridge_user', JSON.stringify(user));
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userName', user.name);
      sessionStorage.setItem('userId', user._id);
    } else {
      sessionStorage.removeItem('foodbridge_user');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userId');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerDonor = async (formData: { fullName: string; orgName: string; phone: string; city: string; password: string; email: string }): Promise<User> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: 'donor',
          phone: formData.phone,
          address: formData.city
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerReceiver = async (formData: { orgName: string; orgType: string; phone: string; city: string; password: string; email: string }): Promise<User> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.orgName,
          email: formData.email,
          password: formData.password,
          role: 'receiver',
          phone: formData.phone,
          address: formData.city
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, registerDonor, registerReceiver, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper to get headers with auth for API calls — reads from sessionStorage (per-tab)
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const userId = sessionStorage.getItem('userId');
  if (userId) headers['x-user-id'] = userId;
  return headers;
}
