import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is saved, restore the session by asking the backend who we are.
  useEffect(() => {
    const token = localStorage.getItem('freshcart_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/api/auth/me', { auth: true })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('freshcart_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('freshcart_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async ({ name, email, password, phone }) => {
    const res = await api.post('/api/auth/signup', { name, email, password, phone });
    localStorage.setItem('freshcart_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('freshcart_token');
    setUser(null);
  };

  // Matches backend config/roles.js:
  // role_id 1 = Admin, 2 = Store Manager, 3 = Employee, 4 = Customer
  const isAdmin = user && [1, 2].includes(user.role_id); // full store access
  const isStoreStaff = user && [1, 2, 3].includes(user.role_id); // can enter store panel (Inventory only, if Employee)

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin, isStoreStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
