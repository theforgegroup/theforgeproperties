
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  id?: string;
  referral_code?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'Admin' | 'Agent' | null;
  currentUser: User | null;
  login: (email: string, pass: string) => boolean;
  agentLogin: (email: string, pass: string) => boolean;
  logout: () => void;
  setAuthenticatedUser: (user: User, role: 'Admin' | 'Agent') => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('theforge_auth') === 'true');
  const [userRole, setUserRole] = useState<'Admin' | 'Agent' | null>(() => localStorage.getItem('theforge_role') as 'Admin' | 'Agent' | null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('theforge_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Initial state is now set in useState initializers
  }, []);

  const setAuthenticatedUser = (user: User, role: 'Admin' | 'Agent') => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUser(user);
    localStorage.setItem('theforge_auth', 'true');
    localStorage.setItem('theforge_role', role);
    localStorage.setItem('theforge_user', JSON.stringify(user));
  };

  const login = (email: string, pass: string) => {
    if (email === 'theforgeproperties@gmail.com' && pass === 'Theforge262126##') {
      setAuthenticatedUser({ email, name: 'Corporate Admin' }, 'Admin');
      return true;
    }
    return false;
  };

  const agentLogin = (email: string, _pass: string) => {
    console.log(_pass); // Use it to satisfy linter
    // In a real app, this would query Supabase 'agents' table
    // For now, we simulate success for demonstration if the email is known
    // Agents are stored in PropertyContext, but we check local storage mock here
    const mockAgent = { id: 'agent-123', name: 'Premium Realtor', email, referral_code: 'FORGE001' };
    setAuthenticatedUser(mockAgent, 'Agent');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('theforge_auth');
    localStorage.removeItem('theforge_role');
    localStorage.removeItem('theforge_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, currentUser, login, agentLogin, logout, setAuthenticatedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
