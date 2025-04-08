import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize Google Sign-In
    const initializeGoogleSignIn = async () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: '803340416309-r9oamtasir0uou5142hooi4s4qspvgju.apps.googleusercontent.com',
            callback: handleGoogleSignIn,
          });
        }
      };

      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    };

    initializeGoogleSignIn();
    setLoading(false);
  }, []);

  const handleGoogleSignIn = (response) => {
    if (response.credential) {
      // Decode the JWT token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const { name, email, picture, sub } = JSON.parse(jsonPayload);
      
      const userData = {
        id: sub,
        name: name,
        email: email,
        imageUrl: picture,
        token: response.credential
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.revoke(user?.email, () => {
        console.log('Google Sign-Out successful');
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 