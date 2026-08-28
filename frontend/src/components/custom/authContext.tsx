import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  userStatus: string;
  groups: Array<{ name: string }>;
}

interface AuthContextType {
  token: string | null;
  user: UserData | null;
  role: "USER" | "ADMIN" | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  role: null,
  isLoading: true,
  setToken: () => {},
  fetchUser: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
if (response.data.success && response.data.data) {
          const userData = response.data.data;
          setUser(userData);
          const isAdmin = userData.groups?.some((g: { name: string }) => g.name === "ADMIN");
          setRole(isAdmin ? "ADMIN" : "USER");
        }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete api.defaults.headers.common["Authorization"];
      setIsLoading(false);
    }
  }, [token, fetchUser]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const handleSetToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, user, role, isLoading, setToken: handleSetToken, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);