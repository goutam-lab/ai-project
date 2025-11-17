import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/apiService";

interface AuthContextType {
  token: string | null;
  user: { username: string; email: string; user_type: string } | null;
  login: (formData: URLSearchParams) => Promise<{ user_type: string }>; // Updated return type
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Fetch current user details using the token
          const userData = await api.get("/users/me");
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user, logging out", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (formData: URLSearchParams) => { 
    // Call the special login endpoint
    const data = await api.login(formData);
    
    // Set token in state and local storage
    setToken(data.access_token);
    localStorage.setItem("token", data.access_token);
    
    // Set user data
    setUser(data.user);

    return data.user; // <-- THIS IS THE ADDITION
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};