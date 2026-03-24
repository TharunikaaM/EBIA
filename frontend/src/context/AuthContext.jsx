import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { email, name, picture }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ebia_token');
    const savedUser = localStorage.getItem('ebia_user');
    if (savedToken && savedUser && savedUser !== 'null') {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email && parsed.email !== 'guest@local') {
          setUser(parsed);
          setToken(savedToken);
        }
      } catch { /* ignore corrupt data */ }
    }
    // Always ensure a guest token exists for API calls
    if (!savedToken) {
      axios.post(`${API_BASE_URL}/api/v1/auth/guest`)
        .then(r => {
          if (r.data?.access_token) {
            localStorage.setItem('ebia_token', r.data.access_token);
            setToken(r.data.access_token);
          }
        })
        .catch(() => {});
    } else {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (googleCredential) => {
    const res = await axios.post(`${API_BASE_URL}/api/v1/auth/google`, {
      token: googleCredential,
    });
    const { access_token, user_info } = res.data;
    localStorage.setItem('ebia_token', access_token);
    localStorage.setItem('ebia_user', JSON.stringify(user_info));
    setToken(access_token);
    setUser(user_info);
    return user_info;
  }, []);

  const logout = useCallback(() => {
    // Revert to guest
    setUser(null);
    localStorage.removeItem('ebia_user');
    // Get a fresh guest token
    axios.post(`${API_BASE_URL}/api/v1/auth/guest`)
      .then(r => {
        if (r.data?.access_token) {
          localStorage.setItem('ebia_token', r.data.access_token);
          setToken(r.data.access_token);
        }
      })
      .catch(() => {
        localStorage.removeItem('ebia_token');
        setToken(null);
      });
  }, []);

  const isLoggedIn = !!user && user.email !== 'guest@local';

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
