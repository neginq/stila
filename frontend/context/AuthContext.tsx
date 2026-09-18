"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthContextType = {
  token: string | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");

    if (savedToken) {
      setToken(savedToken);
    }

    setIsAuthReady(true);
  }, []);

  function login(newToken: string) {
    sessionStorage.removeItem("latestRecommendation");
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("latestRecommendation");
    setToken(null);
  }

  const isLoggedIn = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn,
        isAuthReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
