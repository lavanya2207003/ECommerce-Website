import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      adminAPI
        .getProfile()
        .then((data) => setAdmin(data.admin))
        .catch(() => {
          localStorage.removeItem("adminToken");
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await adminAPI.login(email, password);
      if (!data || !data.token) {
        setError("Invalid response from server.");
        return { success: false, error: "Invalid response from server." };
      }
      localStorage.setItem("adminToken", data.token);
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || "Unable to connect to the server.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const data = await adminAPI.updateProfile(profileData);
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, error, login, logout, updateProfile }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
