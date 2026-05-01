import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('habitquest_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username, password) => {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (username === 'error') {
      throw new Error('Invalid credentials');
    }
    
    const existingDataStr = localStorage.getItem('habitquest_user');
    let existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    
    const userData = { ...existingData, isLoggedIn: true, heroName: existingData.heroName || username, level: existingData.level || 1, avatar: existingData.avatar || '' };
    setUser(userData);
    localStorage.setItem('habitquest_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (username, email, password) => {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (username === 'error') {
      throw new Error('Summoning Failed');
    }
    
    const userData = { isLoggedIn: true };
    setUser(userData);
    localStorage.setItem('habitquest_user', JSON.stringify(userData));
    return userData;
  };

  const updateUser = (data) => {
    const newData = { ...user, ...data };
    setUser(newData);
    localStorage.setItem('habitquest_user', JSON.stringify(newData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('habitquest_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
