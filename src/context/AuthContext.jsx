import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  
useEffect(() => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);
      setToken(savedToken);
    }
  } catch (error) {
    console.error('Failed to restore login:', error);

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  } finally {
    setLoading(false);
  }
}, []);


  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    // ✅ लॉगआउट करताना URL मधला redirect पॅरामीटर काढून टाका
    if (window.location.search.includes('redirect')) {
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);