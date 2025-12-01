import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/userApi';
import i18n from '../i18n'; // Import i18n instance

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const logout = useCallback(() => {
    // The server will clear the httpOnly cookie upon logout api call.
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      // The httpOnly cookie is sent automatically by the browser.
      const response = await getProfile();
      const fetchedUser = response.data;
      setUser(fetchedUser);
      if (fetchedUser.preferredLanguage) {
          i18n.changeLanguage(fetchedUser.preferredLanguage);
      }
    } catch (error) {
      // This will fail if the cookie is invalid or expired, which is expected.
      console.error("No valid session found.", error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (userData) => {
    // The httpOnly cookie is set by the server. We just update the client state.
    setUser(userData);
    if (userData.preferredLanguage) {
        i18n.changeLanguage(userData.preferredLanguage);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  }

  const authContextValue = {
    user,
    loading,
    login,
    logout,
    updateUser,
    refetchUser: fetchUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
