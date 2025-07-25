// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(() => {
    try {
      const storedData = localStorage.getItem('admindata');
      if (storedData) {
        return JSON.parse(storedData).data.admindata;
      }
      return null;
    } catch (error) {
      return null;
    }
  });

  const login = (data) => {
    setAdminData(data);
  };

  const logout = () => {
    setAdminData(null);
  };

  return (
    <AuthContext.Provider value={{ adminData, login, logout }}>
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