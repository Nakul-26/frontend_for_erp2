// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Store user info and role
  const [user, setUser] = useState(() => {
    try {
      const storedData = localStorage.getItem('user');
      if (storedData) {
        return JSON.parse(storedData);
      }
      return null;
    } catch (error) {
      return null;
    }
  });

  // data should include { name, role, ... }
  const login = (data) => {
    setUser(data);
    console.log('User logged in:', data);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};